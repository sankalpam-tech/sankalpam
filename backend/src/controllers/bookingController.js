import { StatusCodes } from 'http-status-codes';
import Booking from '../models/Booking.js';
import Puja from '../models/Puja.js';
import User from '../models/User.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  validationErrorResponse 
} from '../utils/responseUtils.js';

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private/Admin
export const getBookings = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Booking.find(JSON.parse(queryStr))
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Booking.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const bookings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    return successResponse(
      res,
      { count: bookings.length, pagination, data: bookings },
      'Bookings retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving bookings',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Check if user is authorized to view this booking
    if (
      req.user.role !== 'admin' && 
      booking.user._id.toString() !== req.user.id &&
      (booking.priest && booking.priest._id.toString() !== req.user.id)
    ) {
      return errorResponse(
        res,
        'Not authorized to access this booking',
        StatusCodes.FORBIDDEN
      );
    }

    return successResponse(
      res,
      booking,
      'Booking retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Booking');
    }
    return errorResponse(
      res,
      'Server error while retrieving booking',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get current user's bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    // For priests, get bookings assigned to them
    let query = {};
    if (req.user.role === 'priest') {
      query = { priest: req.user.id };
    } else {
      query = { user: req.user.id };
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      })
      .sort('-createdAt');

    return successResponse(
      res,
      { count: bookings.length, data: bookings },
      'Your bookings retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving your bookings',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if puja exists and is active
    const puja = await Puja.findOne({
      _id: req.body.puja,
      isActive: true
    });

    if (!puja) {
      return notFoundResponse(res, 'Puja');
    }

    // Create booking
    const booking = await Booking.create(req.body);

    // Populate the booking with puja and user details
    const newBooking = await Booking.findById(booking._id)
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      });

    // TODO: Send booking confirmation email to user
    // TODO: Send notification to admin about new booking

    return successResponse(
      res,
      newBooking,
      'Booking created successfully',
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return errorResponse(
        res,
        'Duplicate booking',
        StatusCodes.BAD_REQUEST
      );
    }
    return errorResponse(
      res,
      'Server error while creating booking',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Check if user is authorized to update this booking
    if (
      req.user.role !== 'admin' && 
      booking.user.toString() !== req.user.id
    ) {
      return errorResponse(
        res,
        'Not authorized to update this booking',
        StatusCodes.FORBIDDEN
      );
    }

    // Don't allow updating certain fields directly
    const { status, payment, ...updateData } = req.body;

    // Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    // TODO: Send update notification to user and admin

    return successResponse(
      res,
      booking,
      'Booking updated successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Booking');
    }
    return errorResponse(
      res,
      'Server error while updating booking',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
// @access  Private/Admin,Priest
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Check if user is authorized to update status
    if (
      req.user.role !== 'admin' && 
      (booking.priest && booking.priest.toString() !== req.user.id)
    ) {
      return errorResponse(
        res,
        'Not authorized to update this booking status',
        StatusCodes.FORBIDDEN
      );
    }

    // Validate status transition
    const allowedTransitions = {
      pending: ['confirmed', 'rejected'],
      confirmed: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: []
    };

    if (
      allowedTransitions[booking.status] && 
      !allowedTransitions[booking.status].includes(status)
    ) {
      return errorResponse(
        res,
        `Cannot change status from ${booking.status} to ${status}`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Update booking status
    const updateData = { status };
    
    if (['cancelled', 'rejected'].includes(status) && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    // If status is completed, set completion time
    if (status === 'completed') {
      updateData.completedAt = Date.now();
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    // TODO: Send status update notification to user
    // TODO: If status is completed, request review from user

    return successResponse(
      res,
      booking,
      'Booking status updated successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Booking');
    }
    return errorResponse(
      res,
      'Server error while updating booking status',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Assign priest to booking
// @route   PUT /api/v1/bookings/:id/assign-priest
// @access  Private/Admin
export const assignPriest = async (req, res) => {
  try {
    const { priestId } = req.body;

    // Check if priest exists and has the priest role
    const priest = await User.findOne({
      _id: priestId,
      role: 'priest',
      isActive: true
    });

    if (!priest) {
      return errorResponse(
        res,
        'Priest not found or inactive',
        StatusCodes.NOT_FOUND
      );
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Update booking with priest
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { priest: priestId },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    // TODO: Send notification to assigned priest
    // TODO: Send notification to user about priest assignment

    return successResponse(
      res,
      booking,
      'Priest assigned to booking successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Booking or Priest');
    }
    return errorResponse(
      res,
      'Server error while assigning priest to booking',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Add admin note to booking
// @route   POST /api/v1/bookings/:id/notes
// @access  Private/Admin
export const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Add note
    booking.adminNotes.push({
      note,
      createdBy: req.user.id
    });

    await booking.save();

    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    return successResponse(
      res,
      updatedBooking,
      'Note added to booking successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Booking');
    }
    return errorResponse(
      res,
      'Server error while adding note to booking',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Submit review for completed booking
// @route   POST /api/v1/bookings/:id/review
// @access  Private
export const submitReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'completed'
    });

    if (!booking) {
      return notFoundResponse(res, 'Completed booking not found');
    }

    // Check if review already exists
    if (booking.rating) {
      return errorResponse(
        res,
        'You have already submitted a review for this booking',
        StatusCodes.BAD_REQUEST
      );
    }

    // Update booking with review
    booking.rating = rating;
    booking.review = review;
    booking.reviewDate = Date.now();
    
    await booking.save();

    // Update puja's average rating and rating count
    await Puja.calculateAverageRating(booking.puja);

    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'puja',
        select: 'name slug price duration category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'priest',
        select: 'name email phone'
      });

    // TODO: Send notification to admin about new review
    // TODO: If priest exists, update their average rating

    return successResponse(
      res,
      updatedBooking,
      'Thank you for your review!'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Booking');
    }
    return errorResponse(
      res,
      'Server error while submitting review',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Check booking availability
// @route   GET /api/v1/bookings/availability
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const { pujaId, bookingDate, startTime, endTime } = req.query;

    if (!pujaId || !bookingDate || !startTime || !endTime) {
      return errorResponse(
        res,
        'Please provide pujaId, bookingDate, startTime, and endTime',
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate date format
    if (isNaN(Date.parse(bookingDate))) {
      return errorResponse(
        res,
        'Invalid date format. Please use YYYY-MM-DD',
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return errorResponse(
        res,
        'Invalid time format. Please use HH:MM in 24-hour format',
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if end time is after start time
    if (startTime >= endTime) {
      return errorResponse(
        res,
        'End time must be after start time',
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if puja exists and is active
    const puja = await Puja.findOne({
      _id: pujaId,
      isActive: true
    });

    if (!puja) {
      return notFoundResponse(res, 'Puja');
    }

    // Check availability
    const isAvailable = await Booking.checkAvailability(
      pujaId,
      bookingDate,
      startTime,
      endTime
    );

    return successResponse(
      res,
      { available: isAvailable },
      'Availability checked successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja');
    }
    return errorResponse(
      res,
      'Server error while checking availability',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get available time slots for a puja on a specific date
// @route   GET /api/v1/bookings/available-slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { pujaId, date } = req.query;

    if (!pujaId || !date) {
      return errorResponse(
        res,
        'Please provide pujaId and date',
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return errorResponse(
        res,
        'Invalid date format. Please use YYYY-MM-DD',
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if puja exists and is active
    const puja = await Puja.findOne({
      _id: pujaId,
      isActive: true
    });

    if (!puja) {
      return notFoundResponse(res, 'Puja');
    }

    // Get all bookings for this puja on the selected date
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      puja: pujaId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled', 'rejected'] }
    }, 'startTime endTime');

    // Define working hours (can be made configurable)
    const workingHours = {
      start: '06:00', // 6 AM
      end: '21:00'    // 9 PM
    };

    // Generate all possible slots (e.g., every 30 minutes)
    const slotDuration = 30; // minutes
    const slots = [];
    
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      // Format time as HH:MM
      const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Calculate end time
      let endHourCalc = currentHour;
      let endMinuteCalc = currentMinute + slotDuration;
      
      if (endMinuteCalc >= 60) {
        endHourCalc += Math.floor(endMinuteCalc / 60);
        endMinuteCalc = endMinuteCalc % 60;
      }
      
      const endTime = `${endHourCalc.toString().padStart(2, '0')}:${endMinuteCalc.toString().padStart(2, '0')}`;
      
      // Check if this slot is available
      let isAvailable = true;
      
      for (const booking of bookings) {
        if (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        ) {
          isAvailable = false;
          break;
        }
      }
      
      // Add slot if it's in the future
      const now = new Date();
      const slotDateTime = new Date(bookingDate);
      const [hour, minute] = startTime.split(':').map(Number);
      slotDateTime.setHours(hour, minute, 0, 0);
      
      if (slotDateTime > now) {
        slots.push({
          startTime,
          endTime,
          available: isAvailable
        });
      }
      
      // Move to next slot
      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return successResponse(
      res,
      {
        date: bookingDate.toISOString().split('T')[0],
        puja: {
          id: puja._id,
          name: puja.name,
          duration: puja.duration
        },
        slots
      },
      'Available slots retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja');
    }
    return errorResponse(
      res,
      'Server error while retrieving available slots',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};