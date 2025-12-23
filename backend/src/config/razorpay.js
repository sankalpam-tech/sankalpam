import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

let razorpayInstance = null;

// Initialize Razorpay only if keys are available
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('Razorpay initialized successfully');
} else if (process.env.NODE_ENV !== 'test') {
  console.warn('Razorpay keys not found. Payment functionality will be disabled.');
}

export const razorpay = razorpayInstance;

// Verify webhook signature
export const verifyWebhookSignature = (webhookBody, signature) => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret');
  hmac.update(JSON.stringify(webhookBody));
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

// Create an order
export const createOrder = async (amount, currency = 'INR', receipt = '') => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `order_rcpt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default razorpay;
