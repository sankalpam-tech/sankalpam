import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createPayment,
  verifyPayment,
  processRefund,
  getPaymentDetails,
  getUserPayments,
  getBookingPayments,
  handleRazorpayWebhook
} from '../controllers/paymentController.js';

const router = express.Router();

// Public webhook endpoint (no authentication needed for Razorpay webhooks)
router.post('/webhook/razorpay', handleRazorpayWebhook);

// Protected routes (require authentication)
router.use(protect);

// Payment creation and verification
router.post('/', createPayment);
router.post('/verify', verifyPayment);

// Get payment details
router.get('/:id', getPaymentDetails);

// Get payments for a user
router.get('/user/:userId', getUserPayments);

// Get payments for a booking
router.get('/bookings/:bookingId/payments', getBookingPayments);

// Admin-only routes
router.use(authorize('admin'));
router.post('/:id/refund', processRefund);

export default router;