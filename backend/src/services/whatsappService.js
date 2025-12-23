import twilio from 'twilio';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// WhatsApp sender (Twilio Sandbox number or approved WhatsApp Business number)
const WHATSAPP_FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

/**
 * Send a WhatsApp message
 * @param {Object} options - WhatsApp message options
 * @param {string} options.to - Recipient phone number in E.164 format with 'whatsapp:' prefix
 * @param {string} options.body - Message body
 * @param {string[]} [options.mediaUrl] - Array of media URLs to send with the message
 * @returns {Promise<Object>} - Result of sending the WhatsApp message
 */
export const sendWhatsApp = async ({ 
  to, 
  body, 
  mediaUrl = [] 
}) => {
  try {
    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    if (!body && (!mediaUrl || mediaUrl.length === 0)) {
      throw new Error('Message body or media URL is required');
    }

    // Ensure 'to' has the 'whatsapp:' prefix
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    // Prepare message payload
    const messagePayload = {
      from: WHATSAPP_FROM,
      to: toNumber,
    };

    // Add body if provided
    if (body) {
      messagePayload.body = body;
    }

    // Add media URLs if provided
    if (mediaUrl && mediaUrl.length > 0) {
      messagePayload.mediaUrl = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];
    }

    // Send the message
    const message = await client.messages.create(messagePayload);

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      mediaUrl: message.mediaUrl,
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};

/**
 * Send a WhatsApp template message
 * @param {string} to - Recipient phone number (with or without 'whatsapp:' prefix)
 * @param {string} templateName - Name of the approved WhatsApp template
 * @param {string} language - Template language code (e.g., 'en' for English)
 * @param {Object} components - Template components (buttons, variables, etc.)
 * @returns {Promise<Object>}
 */
export const sendWhatsAppTemplate = async (to, templateName, language = 'en', components = {}) => {
  try {
    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    if (!templateName) {
      throw new Error('Template name is required');
    }

    // Ensure 'to' has the 'whatsapp:' prefix
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Send the template message
    const message = await client.messages.create({
      from: WHATSAPP_FROM,
      to: toNumber,
      contentSid: templateName,
      contentVariables: JSON.stringify(components),
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
    };
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    throw new Error(`Failed to send WhatsApp template: ${error.message}`);
  }
};

/**
 * Send a booking confirmation via WhatsApp
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} booking - Booking details
 * @returns {Promise<Object>}
 */
export const sendBookingConfirmation = async (phoneNumber, booking) => {
  const message = `✅ *Booking Confirmed!*\n\n` +
    `*Booking #*: ${booking.bookingNumber}\n` +
    `*Tour*: ${booking.tourName || 'N/A'}\n` +
    `*Date*: ${new Date(booking.travelDate).toLocaleDateString()}\n` +
    `*Travelers*: ${booking.travelers || 1}\n` +
    `*Total Amount*: ₹${booking.totalAmount || 0}\n\n` +
    `Thank you for choosing ${process.env.APP_NAME || 'Sankalpam'}! We're excited to have you on board.`;

  return sendWhatsApp({
    to: phoneNumber,
    body: message,
  });
};

/**
 * Send a payment confirmation via WhatsApp
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} payment - Payment details
 * @returns {Promise<Object>}
 */
export const sendPaymentConfirmation = async (phoneNumber, payment) => {
  const message = `💳 *Payment Received!*\n\n` +
    `*Booking #*: ${payment.bookingNumber || 'N/A'}\n` +
    `*Amount*: ₹${payment.amount || 0}\n` +
    `*Transaction ID*: ${payment.transactionId || 'N/A'}\n` +
    `*Status*: ${payment.status || 'Completed'}\n\n` +
    `Thank you for your payment!`;

  return sendWhatsApp({
    to: phoneNumber,
    body: message,
  });
};

/**
 * Send a tour reminder via WhatsApp
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} booking - Booking details
 * @returns {Promise<Object>}
 */
export const sendTourReminder = async (phoneNumber, booking) => {
  const tourDate = new Date(booking.travelDate);
  const formattedDate = tourDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const message = `🔔 *Upcoming Tour Reminder*\n\n` +
    `*Tour*: ${booking.tourName || 'N/A'}\n` +
    `*Date*: ${formattedDate}\n` +
    `*Meeting Point*: ${booking.meetingPoint || 'Will be shared soon'}\n` +
    `*Contact Person*: ${booking.contactPerson || 'Tour Guide'}\n` +
    `*Contact Number*: ${booking.contactNumber || process.env.SUPPORT_PHONE || ''}\n\n` +
    `We're looking forward to seeing you!`;

  return sendWhatsApp({
    to: phoneNumber,
    body: message,
  });
};

export default {
  sendWhatsApp,
  sendWhatsAppTemplate,
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendTourReminder,
};