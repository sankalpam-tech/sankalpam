import twilio from 'twilio';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send an SMS message
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number (E.164 format: +1234567890)
 * @param {string} options.body - Message body
 * @param {string} [options.from] - Sender phone number (default: TWILIO_PHONE_NUMBER)
 * @returns {Promise<Object>} - Result of sending the SMS
 */
export const sendSMS = async ({ to, body, from = process.env.TWILIO_PHONE_NUMBER }) => {
  try {
    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    if (!body) {
      throw new Error('Message body is required');
    }

    const message = await client.messages.create({
      body,
      to,
      from,
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send a verification code via SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} code - Verification code
 * @returns {Promise<Object>}
 */
export const sendVerificationCode = async (phoneNumber, code) => {
  const message = `Your ${process.env.APP_NAME || 'Sankalpam'} verification code is: ${code}. Valid for 10 minutes.`;
  
  return sendSMS({
    to: phoneNumber,
    body: message,
  });
};

/**
 * Send a booking confirmation SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} booking - Booking details
 * @returns {Promise<Object>}
 */
export const sendBookingConfirmationSMS = async (phoneNumber, booking) => {
  const message = `Your booking #${booking.bookingNumber} has been confirmed. Thank you for choosing ${process.env.APP_NAME || 'Sankalpam'}!`;
  
  return sendSMS({
    to: phoneNumber,
    body: message,
  });
};

/**
 * Send a payment confirmation SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} payment - Payment details
 * @returns {Promise<Object>}
 */
export const sendPaymentConfirmationSMS = async (phoneNumber, payment) => {
  const message = `Payment of ₹${payment.amount} for booking #${payment.bookingNumber} has been received. Thank you!`;
  
  return sendSMS({
    to: phoneNumber,
    body: message,
  });
};

export default {
  sendSMS,
  sendVerificationCode,
  sendBookingConfirmationSMS,
  sendPaymentConfirmationSMS,
};