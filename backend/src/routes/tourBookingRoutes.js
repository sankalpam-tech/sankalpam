import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createTourBooking,
  getTourBookings,
  getTourBooking,
  updateTourBooking,
  deleteTourBooking,
  getMyTourBookings,
  updateTourBookingStatus,
  getTourBookingsByTour,
  getTourBookingsByUser,
  cancelTourBooking,
  getTourBookingStats,
  getMonthlyTourBookings,
} from '../controllers/tourBookingController.js';

const router = express.Router();

// Public routes (if any)

// Protected routes
router.use(protect);

// User routes
router.get('/my-bookings', getMyTourBookings);
router.post('/', createTourBooking);
router.get('/:id', getTourBooking);
router.put('/:id/cancel', cancelTourBooking);

// Admin routes
router.get('/', authorize('admin'), getTourBookings);
router.get('/tour/:tourId', authorize('admin'), getTourBookingsByTour);
router.get('/user/:userId', authorize('admin'), getTourBookingsByUser);
router.put('/:id', authorize('admin'), updateTourBooking);
router.put('/:id/status', authorize('admin'), updateTourBookingStatus);
router.delete('/:id', authorize('admin'), deleteTourBooking);
router.get('/stats', authorize('admin'), getTourBookingStats);
router.get('/monthly-stats', authorize('admin'), getMonthlyTourBookings);

export default router;