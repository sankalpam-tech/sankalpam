import { StatusCodes } from 'http-status-codes';
import Booking from '../models/Booking.js';
import Priest from '../models/Priest.js';
import PriestAvailability from '../models/PriestAvailability.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/responseUtils.js';

// @desc    Auto-assign priest to a booking
// @route   POST /api/bookings/:id/assign-priest
// @access  Private/Admin
export const autoAssignPriest = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.query;

    // Find the booking
    const booking = await Booking.findById(id)
      .populate('puja', 'name duration')
      .populate('user', 'name email phone');

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Check if booking already has a priest assigned
    if (booking.priest && !force) {
      return errorResponse(
        res,
        'A priest is already assigned to this booking. Use force=true to reassign.',
        StatusCodes.BAD_REQUEST
      );
    }

    // Find available priests for this booking
    const availablePriests = await PriestAvailability.findAvailablePriests(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking.puja,
      booking._id
    );

    if (availablePriests.length === 0) {
      return errorResponse(
        res,
        'No priests available for the selected time slot',
        StatusCodes.CONFLICT
      );
    }

    // Get the least busy priest (with fewest upcoming bookings)
    const priestsWithBookings = await Promise.all(
      availablePriests.map(async (priest) => {
        const upcomingCount = await Booking.countDocuments({
          priest: priest._id,
          status: { $in: ['confirmed', 'in-progress'] },
          bookingDate: { $gte: new Date() }
        });
        return { priest, upcomingCount };
      })
    );

    // Sort by number of upcoming bookings (ascending)
    priestsWithBookings.sort((a, b) => a.upcomingCount - b.upcomingCount);
    
    const selectedPriest = priestsWithBookings[0].priest;

    // Assign priest to booking
    booking.priest = selectedPriest._id;
    booking.status = 'confirmed';
    booking.updatedBy = req.user.id;
    
    await booking.save();

    // Populate the assigned priest details
    const updatedBooking = await Booking.findById(booking._id)
      .populate('puja', 'name duration')
      .populate('user', 'name email phone')
      .populate('priest', 'name email phone');

    // TODO: Send notification to priest
    // await sendPriestAssignmentNotification(updatedBooking);

    return successResponse(
      res,
      updatedBooking,
      'Priest assigned successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error in autoAssignPriest:', error);
    return errorResponse(
      res,
      'Server error while assigning priest',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Manually assign priest to a booking
// @route   PUT /api/bookings/:id/assign-priest/:priestId
// @access  Private/Admin
export const manualAssignPriest = async (req, res) => {
  try {
    const { id, priestId } = req.params;
    const { force = false } = req.query;

    // Find the booking
    const booking = await Booking.findById(id)
      .populate('puja', 'name duration')
      .populate('user', 'name email phone');

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Check if priest is already assigned
    if (booking.priest && booking.priest.toString() === priestId && !force) {
      return errorResponse(
        res,
        'This priest is already assigned to the booking',
        StatusCodes.BAD_REQUEST
      );
    }

    // Find the priest
    const priest = await Priest.findById(priestId);
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Check priest availability
    const availability = await PriestAvailability.findOne({ priest: priestId });
    if (!availability) {
      return errorResponse(
        res,
        'Priest availability not configured',
        StatusCodes.CONFLICT
      );
    }

    const isAvailable = await availability.checkAvailability(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking._id
    );

    if (!isAvailable.available) {
      return errorResponse(
        res,
        `Priest is not available: ${isAvailable.reason}`,
        StatusCodes.CONFLICT
      );
    }

    // Assign priest to booking
    const previousPriest = booking.priest;
    booking.priest = priest._id;
    booking.status = 'confirmed';
    booking.updatedBy = req.user.id;
    
    await booking.save();

    // Populate the assigned priest details
    const updatedBooking = await Booking.findById(booking._id)
      .populate('puja', 'name duration')
      .populate('user', 'name email phone')
      .populate('priest', 'name email phone');

    // TODO: Send notifications
    // await sendPriestAssignmentNotification(updatedBooking);
    // if (previousPriest) {
    //   await sendPriestUnassignmentNotification(updatedBooking, previousPriest);
    // }

    return successResponse(
      res,
      updatedBooking,
      'Priest assigned successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error in manualAssignPriest:', error);
    return errorResponse(
      res,
      'Server error while assigning priest',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Remove priest assignment from a booking
// @route   DELETE /api/bookings/:id/assign-priest
// @access  Private/Admin
export const removePriestAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    if (!booking.priest) {
      return errorResponse(
        res,
        'No priest is assigned to this booking',
        StatusCodes.BAD_REQUEST
      );
    }

    const previousPriest = booking.priest;
    booking.priest = undefined;
    booking.status = 'pending';
    booking.updatedBy = req.user.id;
    
    await booking.save();

    // TODO: Send notification to priest
    // await sendPriestUnassignmentNotification(booking, previousPriest);

    return successResponse(
      res,
      { bookingId: booking._id, priestUnassigned: true },
      'Priest unassigned successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error in removePriestAssignment:', error);
    return errorResponse(
      res,
      'Server error while removing priest assignment',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get available priests for a booking
// @route   GET /api/bookings/:id/available-priests
// @access  Private/Admin
export const getAvailablePriests = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Find available priests for this booking
    const availablePriests = await PriestAvailability.findAvailablePriests(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking.puja,
      booking._id
    );

    // Get priest details
    const priests = await Promise.all(
      availablePriests.map(async (priest) => {
        const upcomingBookings = await Booking.countDocuments({
          priest: priest._id,
          status: { $in: ['confirmed', 'in-progress'] },
          bookingDate: { $gte: new Date() }
        });

        return {
          _id: priest._id,
          name: priest.name,
          specialization: priest.specialization,
          experience: priest.experience,
          rating: priest.rating,
          upcomingBookings,
          isAssigned: booking.priest && booking.priest.toString() === priest._id.toString()
        };
      })
    );

    return successResponse(
      res,
      {
        booking: {
          _id: booking._id,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime
        },
        availablePriests: priests,
        count: priests.length
      },
      'Available priests retrieved successfully'
    );
  } catch (error) {
    console.error('Error in getAvailablePriests:', error);
    return errorResponse(
      res,
      'Server error while retrieving available priests',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get priest's upcoming bookings
// @route   GET /api/priests/:id/upcoming-bookings
// @access  Private
export const getPriestUpcomingBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Check if priest exists
    const priest = await Priest.findById(id);
    if (!priest) {
      return notFoundResponse(res, 'Priest');
    }

    // Check if user is authorized (admin or the priest themselves)
    if (req.user.role !== 'admin' && req.user.id !== priest.user.toString()) {
      return errorResponse(
        res,
        'Not authorized to view this priest\'s bookings',
        StatusCodes.FORBIDDEN
      );
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming bookings
    const [bookings, total] = await Promise.all([
      Booking.find({
        priest: id,
        status: { $in: ['confirmed', 'in-progress'] },
        bookingDate: { $gte: today }
      })
        .sort({ bookingDate: 1, startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('puja', 'name duration')
        .populate('user', 'name email phone'),
      
      Booking.countDocuments({
        priest: id,
        status: { $in: ['confirmed', 'in-progress'] },
        bookingDate: { $gte: today }
      })
    ]);

    return successResponse(
      res,
      {
        priest: {
          _id: priest._id,
          name: priest.name,
          specialization: priest.specialization
        },
        bookings,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / limit)
        }
      },
      'Upcoming bookings retrieved successfully'
    );
  } catch (error) {
    console.error('Error in getPriestUpcomingBookings:', error);
    return errorResponse(
      res,
      'Server error while retrieving upcoming bookings',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};