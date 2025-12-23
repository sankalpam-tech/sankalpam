import { StatusCodes } from 'http-status-codes';
import TourBooking from '../models/TourBooking.js';
import Tour from '../models/TourPackage.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create new booking
// @route   POST /api/v1/tour-bookings
// @access  Private
export const createTourBooking = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const tour = await Tour.findById(req.body.tour);
  
  if (!tour) {
    return next(
      new ErrorResponse(`No tour found with id of ${req.body.tour}`, 404)
    );
  }

  // Calculate total price
  const totalPrice = tour.price * req.body.participants.length;
  
  const booking = await TourBooking.create({
    ...req.body,
    totalPrice,
    status: 'confirmed' // Default status
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings
// @route   GET /api/v1/tour-bookings
// @access  Private/Admin
export const getTourBookings = asyncHandler(async (req, res, next) => {
  res.status(StatusCodes.OK).json(res.advancedResults);
});

// @desc    Get single booking
// @route   GET /api/v1/tour-bookings/:id
// @access  Private
export const getTourBooking = asyncHandler(async (req, res, next) => {
  const booking = await TourBooking.findById(req.params.id)
    .populate({
      path: 'tour',
      select: 'name price duration'
    })
    .populate({
      path: 'user',
      select: 'name email'
    });

  if (!booking) {
    return next(
      new ErrorResponse(`No booking found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this booking`,
        401
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/v1/tour-bookings/:id
// @access  Private
export const updateTourBooking = asyncHandler(async (req, res, next) => {
  let booking = await TourBooking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`No booking found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this booking`,
        401
      )
    );
  }

  // If updating the tour, calculate new price
  if (req.body.tour) {
    const tour = await Tour.findById(req.body.tour);
    if (!tour) {
      return next(
        new ErrorResponse(`No tour found with id of ${req.body.tour}`, 404)
      );
    }
    req.body.totalPrice = tour.price * (req.body.participants?.length || booking.participants.length);
  } else if (req.body.participants) {
    // If only participants are being updated, recalculate price
    const tour = await Tour.findById(booking.tour);
    req.body.totalPrice = tour.price * req.body.participants.length;
  }

  booking = await TourBooking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/v1/tour-bookings/:id
// @access  Private
export const deleteTourBooking = asyncHandler(async (req, res, next) => {
  const booking = await TourBooking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`No booking found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this booking`,
        401
      )
    );
  }

  await booking.remove();

  res.status(StatusCodes.OK).json({
    success: true,
    data: {}
  });
});

// @desc    Get bookings for the logged in user
// @route   GET /api/v1/tour-bookings/my-bookings
// @access  Private
export const getMyTourBookings = asyncHandler(async (req, res, next) => {
  const bookings = await TourBooking.find({ user: req.user.id })
    .populate({
      path: 'tour',
      select: 'name imageCover startLocation duration price'
    })
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Update booking status
// @route   PUT /api/v1/tour-bookings/:id/status
// @access  Private/Admin
export const updateTourBookingStatus = asyncHandler(async (req, res, next) => {
  const booking = await TourBooking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`No booking found with id of ${req.params.id}`, 404)
    );
  }

  const { status } = req.body;
  
  // Add status to booking history
  booking.statusHistory.push({
    status,
    changedAt: Date.now(),
    changedBy: req.user.id
  });

  // Update status
  booking.status = status;
  await booking.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/v1/tour-bookings/:id/cancel
// @access  Private
export const cancelTourBooking = asyncHandler(async (req, res, next) => {
  const booking = await TourBooking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`No booking found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to cancel this booking`,
        401
      )
    );
  }

  // Check if booking can be cancelled
  if (booking.status === 'cancelled') {
    return next(
      new ErrorResponse('Booking is already cancelled', 400)
    );
  }

  // Add status to booking history
  booking.statusHistory.push({
    status: 'cancelled',
    changedAt: Date.now(),
    changedBy: req.user.id,
    reason: req.body.reason || 'Cancelled by user'
  });

  // Update status
  booking.status = 'cancelled';
  await booking.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: booking
  });
});

// @desc    Get booking stats
// @route   GET /api/v1/tour-bookings/stats
// @access  Private/Admin
export const getTourBookingStats = asyncHandler(async (req, res, next) => {
  const stats = await TourBooking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: stats
  });
});

// @desc    Get monthly booking stats
// @route   GET /api/v1/tour-bookings/monthly-stats/:year
// @access  Private/Admin
export const getMonthlyTourBookings = asyncHandler(async (req, res, next) => {
  const year = req.params.year * 1; // 2023

  const plan = await TourBooking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        numBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        avgPrice: { $avg: '$totalPrice' },
        minPrice: { $min: '$totalPrice' },
        maxPrice: { $max: '$totalPrice' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { month: 1 }
    }
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    count: plan.length,
    data: plan
  });
});

// @desc    Get bookings by tour
// @route   GET /api/v1/tour-bookings/tour/:tourId
// @access  Private/Admin
export const getTourBookingsByTour = asyncHandler(async (req, res, next) => {
  const bookings = await TourBooking.find({ tour: req.params.tourId })
    .populate({
      path: 'user',
      select: 'name email'
    })
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get bookings by user
// @route   GET /api/v1/tour-bookings/user/:userId
// @access  Private/Admin
export const getTourBookingsByUser = asyncHandler(async (req, res, next) => {
  const bookings = await TourBooking.find({ user: req.params.userId })
    .populate({
      path: 'tour',
      select: 'name startDate endDate'
    })
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});