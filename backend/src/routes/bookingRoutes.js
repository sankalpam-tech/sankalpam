import express from 'express';
import {
  getBookings,
  getBooking,
  getMyBookings,
  createBooking,
  updateBooking,
  updateBookingStatus,
  assignPriest,
  addAdminNote,
  submitReview,
  checkAvailability,
  getAvailableSlots
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateCreateBooking,
  validateUpdateBooking,
  validateUpdateStatus,
  validateAddAdminNote,
  validateSubmitReview
} from '../middleware/validators/bookingValidator.js';

const router = express.Router();

// Public routes
router.get('/availability', checkAvailability);
router.get('/available-slots', getAvailableSlots);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get('/my-bookings', getMyBookings);
router.post('/', validateCreateBooking, createBooking);
router.get('/:id', getBooking);
router.put('/:id', validateUpdateBooking, updateBooking);
router.post('/:id/review', validateSubmitReview, submitReview);

// Admin/Priest routes
router.use(authorize('admin', 'priest'));

router.get('/', getBookings);
router.put('/:id/status', validateUpdateStatus, updateBookingStatus);
router.post('/:id/notes', validateAddAdminNote, addAdminNote);

// Admin only routes
router.use(authorize('admin'));

router.put('/:id/assign-priest', assignPriest);

export default router;
