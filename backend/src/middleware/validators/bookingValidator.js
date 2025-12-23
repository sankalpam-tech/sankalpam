import { body, param } from 'express-validator';
import { validate } from '../validator.js';
import Booking from '../../models/Booking.js';
import Puja from '../../models/Puja.js';

// Common validation for create and update
export const bookingValidationRules = [
  body('puja')
    .notEmpty().withMessage('Puja is required')
    .isMongoId().withMessage('Invalid puja ID')
    .custom(async (value) => {
      const puja = await Puja.findById(value);
      if (!puja || !puja.isActive) {
        throw new Error('Puja not found or inactive');
      }
      return true;
    }),
  
  body('bookingDate')
    .notEmpty().withMessage('Booking date is required')
    .isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD')
    .custom((value) => {
      const today = new Date();
      const bookingDate = new Date(value);
      // Allow booking at least 2 days in advance
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = bookingDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 2) {
        throw new Error('Booking must be made at least 2 days in advance');
      }
      
      // Max 90 days in advance
      if (diffDays > 90) {
        throw new Error('Booking cannot be made more than 90 days in advance');
      }
      
      return true;
    }),
    
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format. Use HH:MM in 24-hour format'),
    
  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format. Use HH:MM in 24-hour format')
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
    
  body('numberOfPeople')
    .notEmpty().withMessage('Number of people is required')
    .isInt({ min: 1, max: 100 }).withMessage('Number of people must be between 1 and 100'),
    
  body('location.type')
    .optional()
    .isIn(['online', 'in-person']).withMessage('Invalid location type'),
    
  body('location.address')
    .if(body('location.type').equals('in-person'))
    .notEmpty().withMessage('Address is required for in-person puja')
    .isLength({ max: 500 }).withMessage('Address cannot be more than 500 characters'),
    
  body('contactPerson.name')
    .notEmpty().withMessage('Contact person name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
  body('contactPerson.phone')
    .notEmpty().withMessage('Contact phone number is required')
    .matches(/^[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
    
  body('contactPerson.email')
    .notEmpty().withMessage('Contact email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('additionalInfo')
    .optional()
    .isLength({ max: 1000 }).withMessage('Additional info cannot be more than 1000 characters'),
    
  body('requirements')
    .optional()
    .isArray().withMessage('Requirements must be an array')
    .custom((requirements) => {
      if (requirements && requirements.length > 0) {
        for (const req of requirements) {
          if (!req.name) {
            throw new Error('Each requirement must have a name');
          }
          if (req.cost && (isNaN(req.cost) || req.cost < 0)) {
            throw new Error('Requirement cost must be a positive number');
          }
        }
      }
      return true;
    })
];

// Validation for updating booking status
export const updateStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),
    
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid status'),
    
  body('cancellationReason')
    .if(body('status').isIn(['cancelled', 'rejected']))
    .notEmpty().withMessage('Cancellation reason is required when cancelling or rejecting a booking')
    .isLength({ min: 10, max: 500 }).withMessage('Cancellation reason must be between 10 and 500 characters')
];

// Validation for adding admin notes
export const addAdminNoteValidation = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),
    
  body('note')
    .notEmpty().withMessage('Note is required')
    .isLength({ min: 5, max: 1000 }).withMessage('Note must be between 5 and 1000 characters')
];

// Validation for submitting a review
export const submitReviewValidation = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),
    
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
  body('review')
    .optional()
    .isLength({ max: 1000 }).withMessage('Review cannot be more than 1000 characters')
];

// Check if booking time slot is available
export const checkBookingAvailability = async (req, res, next) => {
  try {
    const { puja, bookingDate, startTime, endTime } = req.body;
    
    // Skip if this is an update and the puja/date/time hasn't changed
    if (req.params.id) {
      const existingBooking = await Booking.findById(req.params.id);
      if (existingBooking && 
          existingBooking.puja.toString() === puja &&
          new Date(existingBooking.bookingDate).toISOString().split('T')[0] === new Date(bookingDate).toISOString().split('T')[0] &&
          existingBooking.startTime === startTime &&
          existingBooking.endTime === endTime) {
        return next();
      }
    }
    
    const isAvailable = await Booking.checkAvailability(
      puja,
      bookingDate,
      startTime,
      endTime,
      req.params.id || null
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'The selected time slot is not available. Please choose a different time.'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user can modify the booking
export const checkBookingOwnership = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Admin can modify any booking
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Priest can modify their own assigned bookings
    if (req.user.role === 'priest' && 
        booking.priest && 
        booking.priest.toString() === req.user.id) {
      return next();
    }
    
    // Users can only modify their own bookings
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }
    
    // If the booking is already completed or cancelled, don't allow modifications
    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot modify a booking that is ${booking.status}`
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const validateCreateBooking = [
  ...bookingValidationRules,
  validate,
  checkBookingAvailability
];

export const validateUpdateBooking = [
  ...bookingValidationRules,
  validate,
  checkBookingAvailability,
  checkBookingOwnership
];

export const validateUpdateStatus = [
  ...updateStatusValidation,
  validate,
  checkBookingOwnership
];

export const validateAddAdminNote = [
  ...addAdminNoteValidation,
  validate
];

export const validateSubmitReview = [
  ...submitReviewValidation,
  validate,
  checkBookingOwnership
];