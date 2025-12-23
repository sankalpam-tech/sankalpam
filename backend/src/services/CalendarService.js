import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
// import { config } from 'dotenv';
import Booking from '../models/Booking.js';
import { sendNotification } from './notificationService.js';

// Load environment variables
// config();

// Configure OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set refresh token if available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Create a new calendar event for a booking
 * @param {Object} booking - Booking document
 * @param {Object} [user] - User document (optional)
 * @returns {Promise<Object>} - Created event
 */
export const createBookingEvent = async (booking, user = null) => {
  try {
    // If user is not provided, fetch it
    if (!user && booking.user) {
      user = await User.findById(booking.user).select('email name');
    }

    // Get tour package details
    const tourPackage = await TourPackage.findById(booking.tourPackage)
      .select('name description duration startTime endTime location')
      .lean();

    if (!tourPackage) {
      throw new Error('Tour package not found');
    }

    // Format event details
    const event = {
      summary: `Tour: ${tourPackage.name}`,
      description: tourPackage.description || 'Tour booking',
      location: tourPackage.location || '',
      start: {
        dateTime: new Date(booking.travelDate).toISOString(),
        timeZone: 'Asia/Kolkata', // Default to IST
      },
      end: {
        dateTime: new Date(
          new Date(booking.travelDate).getTime() + 
          (tourPackage.duration || 1) * 24 * 60 * 60 * 1000
        ).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: user?.email, displayName: user?.name },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
      extendedProperties: {
        private: {
          bookingId: booking._id.toString(),
          tourPackageId: booking.tourPackage.toString(),
          status: booking.status,
        },
      },
    };

    // Add conference data if available
    if (process.env.GOOGLE_MEET_ENABLED === 'true') {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    // Create the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: process.env.GOOGLE_MEET_ENABLED === 'true' ? 1 : 0,
      requestBody: event,
      sendUpdates: 'all',
    });

    // Update booking with event ID
    await Booking.findByIdAndUpdate(booking._id, {
      $set: { calendarEventId: response.data.id },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Update a calendar event for a booking
 * @param {string} eventId - Google Calendar event ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} - Updated event
 */
export const updateBookingEvent = async (eventId, updates) => {
  try {
    // Get the existing event
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    // Apply updates
    const updatedEvent = {
      ...event.data,
      ...updates,
    };

    // Update the event
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: updatedEvent,
      sendUpdates: 'all',
    });

    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

/**
 * Cancel a calendar event for a booking
 * @param {string} eventId - Google Calendar event ID
 * @param {string} [reason] - Reason for cancellation
 * @returns {Promise<Object>} - Cancellation response
 */
export const cancelBookingEvent = async (eventId, reason = '') => {
  try {
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: {
        status: 'cancelled',
        description: reason
          ? `[CANCELLED] ${reason}\n\n${event.data.description || ''}`
          : `[CANCELLED] ${event.data.description || ''}`,
      },
      sendUpdates: 'all',
    });

    return response.data;
  } catch (error) {
    console.error('Error cancelling calendar event:', error);
    throw error;
  }
};

/**
 * Sync booking with calendar
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} - Sync result
 */
export const syncBookingWithCalendar = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.calendarEventId) {
      // Update existing event
      const event = await updateBookingEvent(booking.calendarEventId, {
        status: booking.status === 'cancelled' ? 'cancelled' : 'confirmed',
        summary: `[${booking.status.toUpperCase()}] Tour: ${booking.tourPackage?.name || 'Tour'}`,
      });
      
      return { success: true, event };
    } else {
      // Create new event
      const event = await createBookingEvent(booking);
      return { success: true, event };
    }
  } catch (error) {
    console.error('Error syncing booking with calendar:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get available time slots for a tour package
 * @param {string} tourPackageId - Tour package ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Available time slots
 */
export const getAvailableTimeSlots = async (tourPackageId, startDate, endDate) => {
  try {
    const tourPackage = await TourPackage.findById(tourPackageId);
    
    if (!tourPackage) {
      throw new Error('Tour package not found');
    }

    // Get all bookings for the tour package in the date range
    const bookings = await Booking.find({
      tourPackage: tourPackageId,
      travelDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' },
    }).select('travelDate participants');

    // Get blocked dates from the calendar
    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate).toISOString();
    
    const calendarResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: 'Asia/Kolkata',
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = calendarResponse.data.calendars?.primary?.busy || [];
    
    // Calculate available slots
    const availableSlots = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Skip if date is in the past
      if (currentDate < new Date()) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Check if date is in blocked dates
      const isBlocked = busySlots.some(slot => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        return currentDate >= slotStart && currentDate <= slotEnd;
      });

      // Check if date is at capacity
      const bookingsOnDate = bookings.filter(
        booking => booking.travelDate.toDateString() === currentDate.toDateString()
      );
      
      const totalBooked = bookingsOnDate.reduce(
        (sum, booking) => sum + (booking.participants?.adults || 0) + (booking.participants?.children || 0),
        0
      );
      
      const isAtCapacity = totalBooked >= (tourPackage.maxCapacity || 1000);

      if (!isBlocked && !isAtCapacity) {
        availableSlots.push({
          date: new Date(currentDate),
          availableSpots: (tourPackage.maxCapacity || 1000) - totalBooked,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

/**
 * Send calendar invite to user
 * @param {string} bookingId - Booking ID
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} - Invite result
 */
export const sendCalendarInvite = async (bookingId, userEmail) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('tourPackage', 'name description location')
      .populate('user', 'email name');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.calendarEventId) {
      // Create calendar event if it doesn't exist
      await createBookingEvent(booking);
    }

    // Send calendar invite
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: booking.calendarEventId,
    });

    // Add attendee
    const updatedEvent = {
      ...event.data,
      attendees: [
        ...(event.data.attendees || []),
        { email: userEmail, responseStatus: 'needsAction' },
      ],
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: booking.calendarEventId,
      requestBody: updatedEvent,
      sendUpdates: 'all',
    });

    // Send notification to user
    await sendNotification({
      user: booking.user,
      type: 'CALENDAR_INVITE',
      title: 'Calendar Invitation',
      message: `You've been invited to a calendar event for your ${booking.tourPackage.name} tour.`,
      data: {
        eventId: booking.calendarEventId,
        bookingId: booking._id,
        tourPackage: {
          id: booking.tourPackage._id,
          name: booking.tourPackage.name,
        },
      },
      channels: ['email', 'push'],
    });

    return { success: true, event: response.data };
  } catch (error) {
    console.error('Error sending calendar invite:', error);
    throw error;
  }
};

export default {
  createBookingEvent,
  updateBookingEvent,
  cancelBookingEvent,
  syncBookingWithCalendar,
  getAvailableTimeSlots,
  sendCalendarInvite,
};
