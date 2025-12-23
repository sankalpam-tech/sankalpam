import asyncHandler from 'express-async-handler';
import TourPackage from '../models/TourPackage.js';
import TourBooking from '../models/TourBooking.js';
import TourReview from '../models/TourReview.js';
import { bookingStatus, paymentStatus } from '../models/TourBooking.js';
import { validationResult } from 'express-validator';

// @desc    Get all tour packages
// @route   GET /api/tour-packages
// @access  Public
export const getTourPackages = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    destination,
    search,
    rating,
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Filter by price range
  if (minPrice || maxPrice) {
    query['price.adult'] = {};
    if (minPrice) query['price.adult'].$gte = Number(minPrice);
    if (maxPrice) query['price.adult'].$lte = Number(maxPrice);
  }

  // Filter by duration
  if (minDuration || maxDuration) {
    query.duration = {};
    if (minDuration) query.duration.$gte = Number(minDuration);
    if (maxDuration) query.duration.$lte = Number(maxDuration);
  }

  // Filter by destination
  if (destination) {
    query.destinations = { $in: [new RegExp(destination, 'i')] };
  }

  // Filter by rating
  if (rating) {
    query['rating.average'] = { $gte: Number(rating) };
  }

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'destinations': { $regex: search, $options: 'i' } }
    ];
  }

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;

  // Execute query with pagination
  const [tours, total] = await Promise.all([
    TourPackage.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select('-itinerary -inclusions -exclusions -requirements')
      .lean(),
    TourPackage.countDocuments(query)
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;

  res.json({
    success: true,
    count: tours.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    data: tours,
  });
});

// @desc    Get single tour package
// @route   GET /api/tour-packages/:id
// @access  Public
export const getTourPackage = asyncHandler(async (req, res) => {
  const tour = await TourPackage.findById(req.params.id)
    .populate('guide', 'name email phone avatar')
    .lean();

  if (!tour) {
    res.status(404);
    throw new Error('Tour package not found');
  }

  // Get related tours (same destination)
  const relatedTours = await TourPackage.find({
    _id: { $ne: tour._id },
    destinations: { $in: tour.destinations },
    isActive: true,
  })
    .limit(4)
    .select('name slug price duration images rating')
    .lean();

  res.json({
    success: true,
    data: {
      ...tour,
      relatedTours,
    },
  });
});

// @desc    Create a tour booking
// @route   POST /api/tour-bookings
// @access  Private
export const createTourBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const {
    tourPackageId,
    travelDate,
    travelers,
    contactInfo,
    emergencyContact,
    specialRequirements,
    paymentMethod,
  } = req.body;

  // Check if tour package exists and is active
  const tourPackage = await TourPackage.findById(tourPackageId);
  if (!tourPackage || !tourPackage.isActive) {
    res.status(404);
    throw new Error('Tour package not found or inactive');
  }

  // Check if travel date is available
  const travelDateObj = new Date(travelDate);
  if (
    travelDateObj < tourPackage.availableFrom ||
    travelDateObj > tourPackage.availableTo
  ) {
    res.status(400);
    throw new Error('Selected date is not available for this tour');
  }

  // Calculate pricing
  const basePrice =
    tourPackage.price.adult * travelers.adults.count +
    tourPackage.price.child * travelers.children.count +
    tourPackage.price.infant * travelers.infants.count;

  const discount = (basePrice * (tourPackage.discount || 0)) / 100;
  const taxes = basePrice * 0.1; // 10% tax (example)
  const fees = 0; // Additional fees if any
  const total = basePrice + taxes + fees - discount;

  // Create booking
  const booking = new TourBooking({
    user: req.user._id,
    tourPackage: tourPackage._id,
    travelDate: travelDateObj,
    travelers,
    contactInfo,
    emergencyContact,
    specialRequirements,
    pricing: {
      basePrice,
      taxes,
      fees,
      discount,
      total,
      currency: 'INR',
    },
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cash' ? paymentStatus.PAID : paymentStatus.PENDING,
    },
    status: bookingStatus.CONFIRMED,
    createdBy: req.user._id,
  });

  await booking.save();

  // Populate the tour package details
  await booking.populate('tourPackage', 'name slug');

  // In a real application, you would integrate with a payment gateway here
  // and update the payment status accordingly

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Tour booking created successfully',
  });
});

// @desc    Get user's tour bookings
// @route   GET /api/tour-bookings
// @access  Private
export const getUserTourBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { user: req.user._id };
  
  if (status && Object.values(bookingStatus).includes(status)) {
    query.status = status;
  }
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [bookings, total] = await Promise.all([
    TourBooking.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(pageSize)
      .populate('tourPackage', 'name slug images')
      .lean(),
    TourBooking.countDocuments(query)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: bookings.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    data: bookings,
  });
});

// @desc    Add a review for a tour
// @route   POST /api/tour-reviews
// @access  Private
export const addTourReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { tourPackageId, bookingId, rating, title, comment, photos } = req.body;
  
  // Check if the booking exists and belongs to the user
  const booking = await TourBooking.findOne({
    _id: bookingId,
    user: req.user._id,
    tourPackage: tourPackageId,
    status: bookingStatus.COMPLETED,
  });
  
  if (!booking) {
    res.status(400);
    throw new Error('Invalid booking or booking not completed yet');
  }
  
  // Check if the user has already reviewed this booking
  const existingReview = await TourReview.findOne({
    user: req.user._id,
    booking: bookingId,
  });
  
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this booking');
  }
  
  // Create the review
  const review = new TourReview({
    user: req.user._id,
    tourPackage: tourPackageId,
    booking: bookingId,
    rating,
    title,
    comment,
    photos,
    status: 'approved', // In a real app, you might want to moderate reviews first
  });
  
  await review.save();
  
  // Update the booking with the review
  booking.review = review._id;
  await booking.save();
  
  // The TourReview model's post-save hook will update the tour package rating
  
  res.status(201).json({
    success: true,
    data: review,
    message: 'Review submitted successfully',
  });
});

// @desc    Get tour package reviews
// @route   GET /api/tour-packages/:id/reviews
// @access  Public
export const getTourPackageReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, rating } = req.query;
  
  const result = await TourReview.getTourReviews(id, {
    page,
    limit,
    rating,
  });
  
  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get user's tour reviews
// @route   GET /api/users/me/tour-reviews
// @access  Private
export const getUserTourReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const result = await TourReview.getUserReviews(req.user._id, {
    page,
    limit,
  });
  
  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get tour package availability
// @route   GET /api/tour-packages/:id/availability
// @access  Public
export const getTourAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  
  const tour = await TourPackage.findById(id);
  
  if (!tour) {
    res.status(404);
    throw new Error('Tour package not found');
  }
  
  // Get all bookings for this tour within the date range
  const bookings = await TourBooking.find({
    tourPackage: id,
    status: { $in: [bookingStatus.CONFIRMED, bookingStatus.PENDING] },
    travelDate: {
      $gte: startDate ? new Date(startDate) : new Date(),
      $lte: endDate ? new Date(endDate) : new Date(tour.availableTo),
    },
  });
  
  // Calculate available slots for each date
  const availability = [];
  let currentDate = new Date(startDate || new Date());
  const endDateObj = endDate ? new Date(endDate) : new Date(tour.availableTo);
  
  while (currentDate <= endDateObj) {
    if (currentDate >= tour.availableFrom && currentDate <= tour.availableTo) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dateBookings = bookings.filter(
        (b) => b.travelDate.toISOString().split('T')[0] === dateStr
      );
      
      const bookedSlots = dateBookings.reduce(
        (total, b) => total + b.travelers.adults.count + b.travelers.children.count,
        0
      );
      
      const availableSlots = Math.max(0, tour.maxPeople - bookedSlots);
      
      availability.push({
        date: dateStr,
        available: availableSlots > 0,
        availableSlots,
        price: tour.price,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  res.json({
    success: true,
    data: {
      tourId: tour._id,
      tourName: tour.name,
      maxPeople: tour.maxPeople,
      availability,
    },
  });
});

// @desc    Cancel a tour booking
// @route   PUT /api/tour-bookings/:id/cancel
// @access  Private
export const cancelTourBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const booking = await TourBooking.findOne({
    _id: id,
    user: req.user._id,
    status: { $in: [bookingStatus.CONFIRMED, bookingStatus.PENDING] },
  });
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found or cannot be cancelled');
  }
  
  // Check if the booking can be cancelled (e.g., minimum days before travel)
  const daysUntilTravel = Math.ceil(
    (new Date(booking.travelDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilTravel < 7) { // Example: 7-day cancellation policy
    res.status(400);
    throw new Error('Booking cannot be cancelled less than 7 days before travel');
  }
  
  // Update booking status
  booking.status = bookingStatus.CANCELLED;
  booking.cancellationReason = reason;
  booking.cancellationDate = new Date();
  
  // Calculate refund (example: full refund if cancelled more than 14 days before)
  const refundAmount = daysUntilTravel > 14 ? booking.pricing.total : 0;
  booking.cancellationRefund = refundAmount;
  
  if (refundAmount > 0) {
    booking.payment.status = paymentStatus.REFUNDED;
    // In a real app, you would process the refund here
  }
  
  await booking.save();
  
  res.json({
    success: true,
    data: booking,
    message: `Booking cancelled successfully${refundAmount > 0 ? '. Refund of ₹' + refundAmount + ' will be processed shortly.' : ''}`,
  });
});