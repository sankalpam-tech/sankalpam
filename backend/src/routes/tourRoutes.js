import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getTourPackages,
  getTourPackage,
  createTourBooking,
  getUserTourBookings,
  addTourReview,
  getTourPackageReviews,
  getUserTourReviews,
  getTourAvailability,
  cancelTourBooking,
} from '../controllers/tourController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get(
  '/tour-packages',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('minDuration').optional().isInt({ min: 1 }).toInt(),
    query('maxDuration').optional().isInt({ min: 1 }).toInt(),
    query('destination').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('rating').optional().isFloat({ min: 1, max: 5 }).toFloat(),
  ],
  getTourPackages
);

router.get(
  '/tour-packages/:id',
  [param('id').isMongoId().withMessage('Invalid tour package ID')],
  getTourPackage
);

router.get(
  '/tour-packages/:id/reviews',
  [
    param('id').isMongoId().withMessage('Invalid tour package ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
  ],
  getTourPackageReviews
);

router.get(
  '/tour-packages/:id/availability',
  [
    param('id').isMongoId().withMessage('Invalid tour package ID'),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
  ],
  getTourAvailability
);

// Protected routes (require authentication)
router.use(protect);

// Tour bookings
router.post(
  '/tour-bookings',
  [
    body('tourPackageId')
      .notEmpty()
      .withMessage('Tour package ID is required')
      .isMongoId()
      .withMessage('Invalid tour package ID'),
    body('travelDate')
      .notEmpty()
      .withMessage('Travel date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        // Check if the date is in the future
        if (new Date(value) < new Date()) {
          throw new Error('Travel date must be in the future');
        }
        return true;
      }),
    body('travelers')
      .isObject()
      .withMessage('Travelers information is required')
      .custom((value) => {
        if (!value.adults || !value.adults.count || value.adults.count < 1) {
          throw new Error('At least one adult is required');
        }
        return true;
      }),
    body('contactInfo')
      .isObject()
      .withMessage('Contact information is required')
      .custom((value) => {
        if (!value.fullName || !value.email || !value.phone) {
          throw new Error('Full name, email, and phone are required');
        }
        return true;
      }),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  createTourBooking
);

router.get(
  '/tour-bookings',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('status')
      .optional()
      .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'refunded']),
  ],
  getUserTourBookings
);

router.put(
  '/tour-bookings/:id/cancel',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('reason').optional().isString().trim(),
  ],
  cancelTourBooking
);

// Tour reviews
router.post(
  '/tour-reviews',
  [
    body('tourPackageId')
      .notEmpty()
      .withMessage('Tour package ID is required')
      .isMongoId()
      .withMessage('Invalid tour package ID'),
    body('bookingId')
      .notEmpty()
      .withMessage('Booking ID is required')
      .isMongoId()
      .withMessage('Invalid booking ID'),
    body('rating')
      .notEmpty()
      .withMessage('Rating is required')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('comment')
      .notEmpty()
      .withMessage('Comment is required')
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Comment cannot exceed 2000 characters'),
    body('photos')
      .optional()
      .isArray()
      .withMessage('Photos must be an array'),
  ],
  addTourReview
);

router.get(
  '/users/me/tour-reviews',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  getUserTourReviews
);

// Admin routes
router.use(authorize('admin'));

// Add admin-only routes here

// Example:
// router.get('/admin/tour-bookings', adminGetAllTourBookings);
// router.put('/admin/tour-bookings/:id/status', adminUpdateBookingStatus);

export default router;
