import { StatusCodes } from 'http-status-codes';
import * as paymentService from '../services/paymentService.js';
import Payment from '../models/Payment.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/responseUtils.js';

/**
 * @desc    Create a new payment for a booking
 * @route   POST /api/payments
 * @access  Private
 */
export const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, billingAddress, metadata } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return errorResponse(res, 'Booking ID is required', StatusCodes.BAD_REQUEST);
    }

    // Process payment
    const result = await paymentService.processBookingPayment(
      bookingId,
      {
        paymentMethod: paymentMethod || 'card', // Default to card
        billingAddress,
        metadata
      },
      userId
    );

    if (!result.success) {
      return errorResponse(res, result.error, result.code || StatusCodes.BAD_REQUEST);
    }

    return successResponse(
      res,
      {
        paymentId: result.paymentId,
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        key: result.key,
        name: result.name,
        description: result.description,
        prefill: result.prefill,
        theme: result.theme,
        order: result.order
      },
      'Payment initiated successfully',
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error('Error in createPayment:', error);
    return errorResponse(
      res,
      'Server error while creating payment',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Verify payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !signature) {
      return errorResponse(
        res,
        'Order ID, payment ID, and signature are required',
        StatusCodes.BAD_REQUEST
      );
    }

    // Verify and capture payment
    const result = await paymentService.verifyAndCapturePayment(orderId, paymentId, signature);

    if (!result.success) {
      return errorResponse(res, result.error, result.code || StatusCodes.BAD_REQUEST);
    }

    return successResponse(
      res,
      {
        paymentId: result.paymentId,
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        bookingId: result.bookingId
      },
      'Payment verified and captured successfully'
    );
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return errorResponse(
      res,
      'Server error while verifying payment',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Process refund
 * @route   POST /api/payments/:id/refund
 * @access  Private/Admin
 */
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return errorResponse(
        res,
        'A valid refund amount is required',
        StatusCodes.BAD_REQUEST
      );
    }

    if (!reason || reason.trim() === '') {
      return errorResponse(
        res,
        'Refund reason is required',
        StatusCodes.BAD_REQUEST
      );
    }

    // Process refund
    const result = await paymentService.processRefund(id, amount, reason, userId);

    if (!result.success) {
      return errorResponse(res, result.error, result.code || StatusCodes.BAD_REQUEST);
    }

    return successResponse(
      res,
      {
        paymentId: result.paymentId,
        refundId: result.refundId,
        amount: result.amount,
        currency: result.currency,
        status: result.status
      },
      'Refund processed successfully'
    );
  } catch (error) {
    console.error('Error in processRefund:', error);
    return errorResponse(
      res,
      'Server error while processing refund',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get payment details
    const result = await paymentService.getPaymentDetails(id);

    if (!result.success) {
      return errorResponse(res, result.error, result.code || StatusCodes.NOT_FOUND);
    }

    // Check if user is authorized to view this payment
    if (
      req.user.role !== 'admin' && 
      result.payment.user._id.toString() !== userId &&
      result.payment.createdBy._id.toString() !== userId
    ) {
      return errorResponse(
        res,
        'Not authorized to view this payment',
        StatusCodes.FORBIDDEN
      );
    }

    return successResponse(
      res,
      result.payment,
      'Payment details retrieved successfully'
    );
  } catch (error) {
    console.error('Error in getPaymentDetails:', error);
    return errorResponse(
      res,
      'Server error while retrieving payment details',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get payments for a user
 * @route   GET /api/payments/user/:userId
 * @access  Private/Admin or Self
 */
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user is authorized (admin or the user themselves)
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return errorResponse(
        res,
        'Not authorized to view these payments',
        StatusCodes.FORBIDDEN
      );
    }

    // Build query
    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('booking', 'puja bookingDate startTime status')
        .populate('user', 'name email')
        .lean(),
      
      Payment.countDocuments(query)
    ]);

    return successResponse(
      res,
      {
        payments,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / limit)
        }
      },
      'User payments retrieved successfully'
    );
  } catch (error) {
    console.error('Error in getUserPayments:', error);
    return errorResponse(
      res,
      'Server error while retrieving user payments',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get payments for a booking
 * @route   GET /api/bookings/:bookingId/payments
 * @access  Private
 */
export const getBookingPayments = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Get booking to check permissions
    const Booking = (await import('../models/Booking.js')).default;
    const booking = await Booking.findById(bookingId)
      .select('user payment')
      .lean();

    if (!booking) {
      return notFoundResponse(res, 'Booking');
    }

    // Check if user is authorized (admin, booking owner, or assigned priest)
    if (
      req.user.role !== 'admin' && 
      booking.user.toString() !== userId &&
      (booking.priest && booking.priest.toString() !== userId)
    ) {
      return errorResponse(
        res,
        'Not authorized to view these payments',
        StatusCodes.FORBIDDEN
      );
    }

    // Get payments for the booking
    const payments = await Payment.find({ booking: bookingId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();

    return successResponse(
      res,
      { payments },
      'Booking payments retrieved successfully'
    );
  } catch (error) {
    console.error('Error in getBookingPayments:', error);
    return errorResponse(
      res,
      'Server error while retrieving booking payments',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Handle Razorpay webhook
 * @route   POST /api/payments/webhook/razorpay
 * @access  Public (called by Razorpay)
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payload = req.body;

    if (!signature) {
      return errorResponse(
        res,
        'Missing Razorpay signature',
        StatusCodes.BAD_REQUEST
      );
    }

    // Process webhook
    const result = await paymentService.handleRazorpayWebhook(payload, signature);

    if (!result.success) {
      return errorResponse(res, result.error, result.code || StatusCodes.BAD_REQUEST);
    }

    // Return 200 OK to Razorpay
    return res.status(StatusCodes.OK).json({ success: true });
  } catch (error) {
    console.error('Error in handleRazorpayWebhook:', error);
    return errorResponse(
      res,
      'Server error while processing webhook',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
