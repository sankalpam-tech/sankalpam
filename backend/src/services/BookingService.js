import Booking from '../models/Booking.js';
import TourPackage from '../models/TourPackage.js';
import { sendNotification } from './notificationService.js';
import { bookingStatus } from '../models/Booking.js';

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @param {string} bookingData.user - User ID
 * @param {string} bookingData.tourPackage - Tour package ID
 * @param {Date} bookingData.travelDate - Travel date
 * @param {number} bookingData.adults - Number of adults
 * @param {number} [bookingData.children] - Number of children
 * @param {number} [bookingData.infants] - Number of infants
 * @param {Object} [bookingData.contactInfo] - Contact information
 * @param {string} [bookingData.specialRequirements] - Special requirements
 * @returns {Promise<Object>} - Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    // Check if tour package exists and is active
    const tourPackage = await TourPackage.findById(bookingData.tourPackage);
    
    if (!tourPackage || !tourPackage.isActive) {
      throw new Error('Tour package not found or inactive');
    }

    // Check availability for the selected date
    const isAvailable = await checkTourAvailability(
      bookingData.tourPackage, 
      bookingData.travelDate,
      bookingData.adults + (bookingData.children || 0) + (bookingData.infants || 0)
    );

    if (!isAvailable.available) {
      throw new Error(isAvailable.message || 'Tour not available for the selected date');
    }

    // Calculate pricing
    const pricing = calculatePricing(tourPackage, {
      adults: bookingData.adults,
      children: bookingData.children,
      infants: bookingData.infants,
    });

    // Create booking
    const booking = new Booking({
      ...bookingData,
      status: bookingStatus.PENDING_PAYMENT,
      totalAmount: pricing.total,
      pricing,
    });

    await booking.save();

    // Send booking confirmation
    await sendBookingConfirmation(booking);

    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Check tour availability
 * @param {string} tourPackageId - Tour package ID
 * @param {Date} date - Travel date
 * @param {number} pax - Number of people
 * @returns {Promise<Object>} - Availability status
 */
export const checkTourAvailability = async (tourPackageId, date, pax = 1) => {
  try {
    const tourPackage = await TourPackage.findById(tourPackageId);
    
    if (!tourPackage) {
      return { available: false, message: 'Tour package not found' };
    }

    if (!tourPackage.isActive) {
      return { available: false, message: 'Tour package is not active' };
    }

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return { available: false, message: 'Cannot book for past dates' };
    }

    // Check capacity
    if (pax > tourPackage.maxGroupSize) {
      return { 
        available: false, 
        message: `Group size exceeds maximum of ${tourPackage.maxGroupSize} people` 
      };
    }

    // Check if the tour is available on the selected date
    if (tourPackage.availableDates && tourPackage.availableDates.length > 0) {
      const isDateAvailable = tourPackage.availableDates.some(availDate => {
        const availDateObj = new Date(availDate);
        return availDateObj.toDateString() === date.toDateString();
      });

      if (!isDateAvailable) {
        return { 
          available: false, 
          message: 'Tour not available on the selected date' 
        };
      }
    }

    // Check if there are enough spots available
    const bookingsOnDate = await Booking.countDocuments({
      tourPackage: tourPackageId,
      travelDate: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: { $ne: bookingStatus.CANCELLED },
    });

    const availableSpots = (tourPackage.maxCapacity || 1000) - bookingsOnDate;
    
    if (pax > availableSpots) {
      return { 
        available: false, 
        message: `Only ${availableSpots} spot(s) available for the selected date` 
      };
    }

    return { available: true };
  } catch (error) {
    console.error('Error checking tour availability:', error);
    return { available: false, message: 'Error checking availability' };
  }
};

/**
 * Calculate booking pricing
 * @param {Object} tourPackage - Tour package document
 * @param {Object} pax - Number of people
 * @param {number} pax.adults - Number of adults
 * @param {number} [pax.children] - Number of children
 * @param {number} [pax.infants] - Number of infants
 * @returns {Object} - Pricing details
 */
const calculatePricing = (tourPackage, { adults, children = 0, infants = 0 }) => {
  const basePrice = tourPackage.price || 0;
  const childDiscount = tourPackage.childDiscount || 0; // Percentage
  const infantDiscount = tourPackage.infantDiscount || 0; // Percentage
  const taxRate = tourPackage.taxRate || 0; // Percentage
  const serviceCharge = tourPackage.serviceCharge || 0; // Fixed amount per booking

  const adultTotal = adults * basePrice;
  const childTotal = children * (basePrice * (1 - childDiscount / 100));
  const infantTotal = infants * (basePrice * (1 - infantDiscount / 100));
  
  const subtotal = adultTotal + childTotal + infantTotal;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax + serviceCharge;

  return {
    basePrice,
    adults: adults,
    adultRate: basePrice,
    adultTotal,
    children: children,
    childRate: basePrice * (1 - childDiscount / 100),
    childTotal,
    infants: infants,
    infantRate: basePrice * (1 - infantDiscount / 100),
    infantTotal,
    subtotal,
    taxRate,
    tax,
    serviceCharge,
    total,
    currency: tourPackage.currency || 'INR',
  };
};

/**
 * Send booking confirmation
 * @param {Object} booking - Booking document
 * @returns {Promise<void>}
 */
const sendBookingConfirmation = async (booking) => {
  try {
    // Get tour package details
    const tourPackage = await TourPackage.findById(booking.tourPackage);
    
    if (!tourPackage) {
      console.error('Tour package not found for booking:', booking._id);
      return;
    }

    // Format booking details for notification
    const bookingDetails = {
      bookingNumber: booking.bookingNumber,
      tourName: tourPackage.name,
      travelDate: booking.travelDate,
      totalAmount: booking.totalAmount,
      status: booking.status,
    };

    // Send notification
    await sendNotification({
      user: booking.user,
      type: 'BOOKING_CONFIRMATION',
      title: 'Booking Confirmed',
      message: `Your booking for ${tourPackage.name} on ${new Date(booking.travelDate).toLocaleDateString()} has been confirmed.`,
      data: {
        booking: bookingDetails,
        tourPackage: {
          id: tourPackage._id,
          name: tourPackage.name,
          duration: tourPackage.duration,
          image: tourPackage.images?.[0],
        },
      },
      channels: ['email', 'whatsapp', 'push'],
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @param {string} [cancellationReason] - Reason for cancellation
 * @returns {Promise<Object>} - Updated booking
 */
export const updateBookingStatus = async (bookingId, status, cancellationReason) => {
  try {
    const updateData = { status };
    
    if (status === bookingStatus.CANCELLED && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
      updateData.cancelledAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Send status update notification
    await sendBookingStatusUpdate(booking);

    return booking;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

/**
 * Send booking status update
 * @param {Object} booking - Booking document
 * @returns {Promise<void>}
 */
const sendBookingStatusUpdate = async (booking) => {
  try {
    const tourPackage = await TourPackage.findById(booking.tourPackage);
    
    if (!tourPackage) {
      console.error('Tour package not found for booking:', booking._id);
      return;
    }

    let title = '';
    let message = '';

    switch (booking.status) {
      case bookingStatus.CONFIRMED:
        title = 'Booking Confirmed';
        message = `Your booking for ${tourPackage.name} has been confirmed.`;
        break;
      case bookingStatus.CANCELLED:
        title = 'Booking Cancelled';
        message = `Your booking for ${tourPackage.name} has been cancelled.`;
        if (booking.cancellationReason) {
          message += ` Reason: ${booking.cancellationReason}`;
        }
        break;
      case bookingStatus.COMPLETED:
        title = 'Tour Completed';
        message = `Your tour ${tourPackage.name} has been marked as completed. We hope you had a great time!`;
        break;
      default:
        return; // Don't send notification for other statuses
    }

    await sendNotification({
      user: booking.user,
      type: 'BOOKING_UPDATE',
      title,
      message,
      data: {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        tourPackage: {
          id: tourPackage._id,
          name: tourPackage.name,
        },
      },
      channels: ['email', 'whatsapp', 'push'],
    });
  } catch (error) {
    console.error('Error sending booking status update:', error);
  }
};

/**
 * Get user bookings
 * @param {string} userId - User ID
 * @param {Object} [options] - Query options
 * @param {string} [options.status] - Filter by status
 * @param {number} [options.limit=10] - Number of results per page
 * @param {number} [options.page=1] - Page number
 * @returns {Promise<Object>} - Paginated bookings
 */
export const getUserBookings = async (userId, { status, limit = 10, page = 1 } = {}) => {
  try {
    const query = { user: userId };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('tourPackage', 'name images duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

export default {
  createBooking,
  checkTourAvailability,
  updateBookingStatus,
  getUserBookings,
};
