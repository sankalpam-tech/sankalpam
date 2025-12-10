import crypto from 'crypto';
import Payment from '../models/Payment.js';
import { razorpay } from '../config/razorpay.js';
import { errorResponse } from '../utils/responseUtils.js';

/**
 * Create a new payment order
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.amount - Amount in smallest currency unit (e.g., paise for INR)
 * @param {string} paymentData.currency - Currency code (default: INR)
 * @param {string} paymentData.receipt - Receipt ID
 * @param {Object} notes - Additional notes
 * @returns {Promise<Object>} - Razorpay order
 */
export const createRazorpayOrder = async (paymentData) => {
  try {
    const options = {
      amount: paymentData.amount, // Amount in smallest currency unit
      currency: paymentData.currency || 'INR',
      receipt: paymentData.receipt,
      payment_capture: 1, // Auto capture payment
      notes: paymentData.notes || {}
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt: order.created_at,
      razorpayData: order
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.error?.description || 'Failed to create payment order',
      code: error.statusCode || 500
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - Whether the signature is valid
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
};

/**
 * Capture a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to capture
 * @returns {Promise<Object>} - Capture result
 */
export const captureRazorpayPayment = async (paymentId, amount) => {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount);
    return {
      success: true,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      captured: payment.captured,
      method: payment.method,
      bank: payment.bank,
      cardId: payment.card_id,
      bankTransactionId: payment.bank_transaction_id,
      razorpayData: payment
    };
  } catch (error) {
    console.error('Error capturing Razorpay payment:', error);
    return {
      success: false,
      error: error.error?.description || 'Failed to capture payment',
      code: error.statusCode || 500,
      razorpayError: error.error
    };
  }
};

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (in smallest currency unit)
 * @param {string} [reason] - Reason for refund
 * @returns {Promise<Object>} - Refund result
 */
export const createRazorpayRefund = async (paymentId, amount, reason = 'Refund') => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount,
      speed: 'normal', // or 'optimum'
      notes: {
        reason: reason
      }
    });

    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      speedRequested: refund.speed_requested,
      speedProcessed: refund.speed_processed,
      receipt: refund.receipt,
      razorpayData: refund
    };
  } catch (error) {
    console.error('Error creating Razorpay refund:', error);
    return {
      success: false,
      error: error.error?.description || 'Failed to create refund',
      code: error.statusCode || 500,
      razorpayError: error.error
    };
  }
};

/**
 * Process payment for a booking
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - Payment data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Payment result
 */
export const processBookingPayment = async (bookingId, paymentData, userId) => {
  try {
    // Create payment record
    const payment = await Payment.createForBooking(bookingId, {
      ...paymentData,
      gateway: 'razorpay'
    }, userId);

    // Create Razorpay order
    const orderData = {
      amount: payment.amount * 100, // Convert to paise
      currency: payment.currency,
      receipt: `order_${payment._id}`,
      notes: {
        bookingId: bookingId,
        userId: userId
      },
      payment_capture: 1
    };

    const order = await createRazorpayOrder(orderData);

    if (!order.success) {
      throw new Error(order.error || 'Failed to create payment order');
    }

    // Update payment with order details
    payment.gateway = {
      ...payment.gateway,
      orderId: order.orderId,
      status: 'created',
      razorpayData: order.razorpayData
    };

    await payment.save();

    return {
      success: true,
      paymentId: payment._id,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      name: 'Sankalpam',
      description: `Payment for booking ${bookingId}`,
      prefill: {
        name: payment.billingAddress.name,
        email: payment.billingAddress.email,
        contact: payment.billingAddress.phone
      },
      theme: {
        color: '#3399cc'
      },
      order: order.razorpayData
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to process payment',
      code: 500
    };
  }
};

/**
 * Verify and capture payment
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {Promise<Object>} - Payment verification result
 */
export const verifyAndCapturePayment = async (orderId, paymentId, signature) => {
  try {
    // Find payment by order ID
    const payment = await Payment.findOne({
      'gateway.orderId': orderId,
      status: 'pending'
    });

    if (!payment) {
      throw new Error('Payment not found or already processed');
    }

    // Verify signature
    const isValidSignature = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValidSignature) {
      throw new Error('Invalid payment signature');
    }

    // Capture payment
    const captureResult = await captureRazorpayPayment(paymentId, payment.amount * 100);
    if (!captureResult.success) {
      throw new Error(captureResult.error || 'Payment capture failed');
    }

    // Update payment status
    payment.gateway = {
      ...payment.gateway,
      paymentId: captureResult.paymentId,
      status: 'captured',
      razorpayData: captureResult.razorpayData
    };

    payment.status = 'completed';
    payment.completedAt = new Date();
    await payment.save();

    // Update booking status
    const Booking = (await import('../models/Booking.js')).default;
    await Booking.findByIdAndUpdate(payment.booking, {
      status: 'confirmed',
      paymentStatus: 'paid',
      $push: {
        notes: {
          text: `Payment of ${payment.amount} ${payment.currency} received via ${payment.paymentMethod}`,
          createdBy: payment.user
        }
      }
    });

    // TODO: Send payment confirmation email/notification

    return {
      success: true,
      paymentId: payment._id,
      orderId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      bookingId: payment.booking
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Update payment status if payment exists
    if (payment) {
      payment.status = 'failed';
      payment.gateway.status = 'failed';
      payment.gateway.error = error.message;
      await payment.save();

      // Update booking status
      const Booking = (await import('../models/Booking.js')).default;
      await Booking.findByIdAndUpdate(payment.booking, {
        status: 'payment_failed',
        $push: {
          notes: {
            text: `Payment failed: ${error.message}`,
            createdBy: payment.user
          }
        }
      });
    }

    return {
      success: false,
      error: error.message || 'Payment verification failed',
      code: 400
    };
  }
};

/**
 * Process refund for a payment
 * @param {string} paymentId - Payment ID
 * @param {number} amount - Amount to refund
 * @param {string} reason - Reason for refund
 * @param {string} userId - User ID processing the refund
 * @returns {Promise<Object>} - Refund result
 */
export const processRefund = async (paymentId, amount, reason, userId) => {
  try {
    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'completed' && payment.status !== 'partially_refunded') {
      throw new Error('Payment is not eligible for refund');
    }

    const refundableAmount = payment.amount - (payment.totalRefunded || 0);
    if (amount > refundableAmount) {
      throw new Error(`Cannot refund more than ${refundableAmount} ${payment.currency}`);
    }

    // Process refund with Razorpay
    const refundResult = await createRazorpayRefund(
      payment.gateway.paymentId,
      amount * 100, // Convert to paise
      reason
    );

    if (!refundResult.success) {
      throw new Error(refundResult.error || 'Refund failed');
    }

    // Update payment with refund details
    const refund = {
      amount: amount,
      reason: reason,
      status: refundResult.status,
      processedBy: userId,
      processedAt: new Date(),
      gatewayResponse: refundResult.razorpayData
    };

    payment.refunds.push(refund);

    // Update payment status
    if (amount === refundableAmount) {
      payment.status = 'refunded';
    } else {
      payment.status = 'partially_refunded';
    }

    await payment.save();

    // Update booking status if fully refunded
    if (payment.status === 'refunded') {
      const Booking = (await import('../models/Booking.js')).default;
      await Booking.findByIdAndUpdate(payment.booking, {
        status: 'cancelled',
        paymentStatus: 'refunded',
        $push: {
          notes: {
            text: `Refund of ${amount} ${payment.currency} processed. Reason: ${reason}`,
            createdBy: userId
          }
        }
      });
    }

    return {
      success: true,
      paymentId: payment._id,
      refundId: refundResult.refundId,
      amount: amount,
      currency: payment.currency,
      status: payment.status,
      refund: refundResult.razorpayData
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error.message || 'Failed to process refund',
      code: 400
    };
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate('booking', 'puja bookingDate startTime status')
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Get payment details from Razorpay if needed
    let razorpayPayment = null;
    if (payment.gateway?.paymentId) {
      try {
        const rzpPayment = await razorpay.payments.fetch(payment.gateway.paymentId);
        razorpayPayment = {
          id: rzpPayment.id,
          amount: rzpPayment.amount,
          currency: rzpPayment.currency,
          status: rzpPayment.status,
          method: rzpPayment.method,
          bank: rzpPayment.bank,
          card: rzpPayment.card,
          captured: rzpPayment.captured,
          description: rzpPayment.description,
          refundStatus: rzpPayment.refund_status,
          email: rzpPayment.email,
          contact: rzpPayment.contact,
          fee: rzpPayment.fee,
          tax: rzpPayment.tax,
          errorCode: rzpPayment.error_code,
          errorDescription: rzpPayment.error_description,
          createdAt: rzpPayment.created_at
        };
      } catch (error) {
        console.error('Error fetching Razorpay payment details:', error);
      }
    }

    return {
      success: true,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        booking: payment.booking,
        user: payment.user,
        billingAddress: payment.billingAddress,
        gateway: {
          ...payment.gateway.toObject(),
          razorpayPayment
        },
        refunds: payment.refunds,
        totalRefunded: payment.totalRefunded,
        isPaid: payment.isPaid,
        createdBy: payment.createdBy,
        updatedBy: payment.updatedBy
      }
    };
  } catch (error) {
    console.error('Error getting payment details:', error);
    return {
      success: false,
      error: error.message || 'Failed to get payment details',
      code: 404
    };
  }
};

/**
 * Handle Razorpay webhook events
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Webhook signature
 * @returns {Promise<Object>} - Webhook processing result
 */
export const handleRazorpayWebhook = async (payload, signature) => {
  try {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const event = payload.event;
    const payment = payload.payload.payment?.entity;
    const refund = payload.payload.refund?.entity;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Handle successful payment
        if (payment) {
          // Find and update payment
          await Payment.findOneAndUpdate(
            { 'gateway.paymentId': payment.id },
            {
              $set: {
                'gateway.status': 'captured',
                status: 'completed',
                completedAt: new Date(payment.created_at * 1000),
                updatedAt: new Date()
              },
              $setOnInsert: {
                // Only set these fields if creating a new document
                amount: payment.amount / 100, // Convert from paise
                currency: payment.currency,
                paymentMethod: payment.method,
                gateway: {
                  name: 'razorpay',
                  paymentId: payment.id,
                  orderId: payment.order_id,
                  status: 'captured',
                  razorpayData: payment
                },
                createdBy: 'system',
                updatedBy: 'system'
              }
            },
            { upsert: false, new: true }
          );

          // Update booking status
          if (payment.notes?.bookingId) {
            const Booking = (await import('../models/Booking.js')).default;
            await Booking.findByIdAndUpdate(payment.notes.bookingId, {
              status: 'confirmed',
              paymentStatus: 'paid',
              $push: {
                notes: {
                  text: `Payment of ${payment.amount / 100} ${payment.currency} captured via ${payment.method}`,
                  createdBy: 'system'
                }
              }
            });
          }
        }
        break;

      case 'payment.failed':
        // Handle failed payment
        if (payment) {
          await Payment.findOneAndUpdate(
            { 'gateway.paymentId': payment.id },
            {
              'gateway.status': 'failed',
              'gateway.error': payment.error_description,
              status: 'failed',
              updatedAt: new Date()
            }
          );

          if (payment.notes?.bookingId) {
            const Booking = (await import('../models/Booking.js')).default;
            await Booking.findByIdAndUpdate(payment.notes.bookingId, {
              status: 'payment_failed',
              $push: {
                notes: {
                  text: `Payment failed: ${payment.error_description || 'Unknown error'}`,
                  createdBy: 'system'
                }
              }
            });
          }
        }
        break;

      case 'refund.created':
      case 'refund.processed':
        // Handle refund
        if (refund) {
          await Payment.findOneAndUpdate(
            { 'gateway.paymentId': refund.payment_id },
            {
              $push: {
                refunds: {
                  amount: refund.amount / 100, // Convert from paise
                  reason: refund.notes?.reason || 'Refund processed',
                  status: refund.status,
                  processedAt: new Date(refund.created_at * 1000),
                  gatewayResponse: refund
                }
              },
              $set: {
                status: refund.amount === refund.payment_amount ? 'refunded' : 'partially_refunded',
                updatedAt: new Date()
              }
            }
          );

          // Update booking status if fully refunded
          if (refund.amount === refund.payment_amount) {
            const payment = await Payment.findOne({ 'gateway.paymentId': refund.payment_id });
            if (payment?.booking) {
              const Booking = (await import('../models/Booking.js')).default;
              await Booking.findByIdAndUpdate(payment.booking, {
                status: 'cancelled',
                paymentStatus: 'refunded',
                $push: {
                  notes: {
                    text: `Full refund of ${refund.amount / 100} ${refund.currency} processed`,
                    createdBy: 'system'
                  }
                }
              });
            }
          }
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      success: false,
      error: error.message || 'Failed to process webhook',
      code: 400
    };
  }
};
