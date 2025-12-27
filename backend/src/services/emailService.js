// import nodemailer from 'nodemailer';
// // import { config } from 'dotenv';
// import path from 'path';
// import ejs from 'ejs';
// import fs from 'fs/promises';

// // Load environment variables
// // config();

// // Create transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_SECURE === 'true',
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// // Verify connection configuration
// transporter.verify((error) => {
//   if (error) {
//     console.error('Error verifying email transporter:', error);
//   } else {
//     console.log('Email server is ready to take our messages');
//   }
// });

// // Path to email templates
// const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates', 'emails');

// /**
//  * Send an email
//  * @param {Object} options - Email options
//  * @param {string|string[]} options.to - Recipient email address(es)
//  * @param {string} options.subject - Email subject
//  * @param {string} [options.text] - Plain text email body
//  * @param {string} [options.html] - HTML email body
//  * @param {string} [options.template] - Template name (without .ejs extension)
//  * @param {Object} [options.context] - Template context
//  * @param {Object[]} [options.attachments] - Email attachments
//  * @returns {Promise<Object>} - Result of sending the email
//  */
// export const sendEmail = async ({
//   to,
//   subject,
//   text,
//   html,
//   template,
//   context = {},
//   attachments = [],
// }) => {
//   try {
//     // If template is provided, render it
//     if (template) {
//       try {
//         const templatePath = path.join(TEMPLATES_DIR, `${template}.ejs`);
//         const templateContent = await fs.readFile(templatePath, 'utf-8');
        
//         // Add default context
//         const emailContext = {
//           appName: process.env.APP_NAME || 'Sankalpam',
//           appUrl: process.env.FRONTEND_URL || 'https://sankalpam.app',
//           year: new Date().getFullYear(),
//           ...context,
//         };
        
//         // Render template
//         html = ejs.render(templateContent, emailContext);
        
//         // Generate text version if not provided
//         if (!text) {
//           // Simple HTML to text conversion
//           text = html
//             .replace(/<[^>]+>/g, ' ') // Remove HTML tags
//             .replace(/\s+/g, ' ') // Collapse whitespace
//             .trim();
//         }
//       } catch (error) {
//         console.error('Error rendering email template:', error);
//         throw new Error('Failed to render email template');
//       }
//     }

//     if (!html && !text) {
//       throw new Error('Either html, text, or template must be provided');
//     }

//     const mailOptions = {
//       from: `"${process.env.EMAIL_FROM_NAME || 'Sankalpam'}" <${process.env.EMAIL_FROM}>`,
//       to: Array.isArray(to) ? to.join(', ') : to,
//       subject,
//       text,
//       html,
//       attachments,
//     };

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
    
//     return {
//       success: true,
//       messageId: info.messageId,
//       response: info.response,
//     };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw new Error('Failed to send email');
//   }
// };

// /**
//  * Send a verification email
//  * @param {string} to - Recipient email
//  * @param {string} name - Recipient name
//  * @param {string} token - Verification token
//  * @returns {Promise<Object>}
//  */
// export const sendVerificationEmail = async (to, name, token) => {
//   const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
//   return sendEmail({
//     to,
//     subject: 'Verify Your Email Address',
//     template: 'verify-email', // Will look for verify-email.ejs in templates/emails
//     context: {
//       name,
//       verificationUrl,
//       token,
//     },
//   });
// };

// /**
//  * Send a password reset email
//  * @param {string} to - Recipient email
//  * @param {string} name - Recipient name
//  * @param {string} token - Reset token
//  * @returns {Promise<Object>}
//  */
// export const sendPasswordResetEmail = async (to, name, token) => {
//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
//   return sendEmail({
//     to,
//     subject: 'Reset Your Password',
//     template: 'reset-password', // Will look for reset-password.ejs in templates/emails
//     context: {
//       name,
//       resetUrl,
//       token,
//     },
//   });
// };

// /**
//  * Send a booking confirmation email
//  * @param {string} to - Recipient email
//  * @param {string} name - Recipient name
//  * @param {Object} booking - Booking details
//  * @returns {Promise<Object>}
//  */
// export const sendBookingConfirmationEmail = async (to, name, booking) => {
//   return sendEmail({
//     to,
//     subject: `Booking Confirmation #${booking.bookingNumber}`,
//     template: 'booking-confirmation', // Will look for booking-confirmation.ejs in templates/emails
//     context: {
//       name,
//       booking,
//     },
//   });
// };

// export default {
//   sendEmail,
//   sendVerificationEmail,
//   sendPasswordResetEmail,
//   sendBookingConfirmationEmail,
// };









import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs/promises';

// ❌ DO NOT USE dotenv in Lambda
// ❌ DO NOT call config()

// Gmail transporter (Lambda-safe)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Email templates directory
const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates', 'emails');

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  template,
  context = {},
  attachments = [],
}) => {
  try {
    // Render EJS template if provided
    if (template) {
      const templatePath = path.join(TEMPLATES_DIR, `${template}.ejs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      const emailContext = {
        appName: 'Sankalpam',
        frontendUrl: process.env.FRONTEND_URL,
        year: new Date().getFullYear(),
        ...context,
      };

      html = ejs.render(templateContent, emailContext);

      if (!text) {
        text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    const mailOptions = {
      from: `"Sankalpam" <${process.env.MAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email send failed:', error.message);
    // ❗ NEVER crash Lambda because of email
    return { success: false };
  }
};

export const sendVerificationEmail = async (to, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return sendEmail({
    to,
    subject: 'Verify Your Email Address',
    template: 'verify-email',
    context: { name, verificationUrl },
  });
};

export const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: 'Reset Your Password',
    template: 'reset-password',
    context: { name, resetUrl },
  });
};

export const sendBookingConfirmationEmail = async (to, name, booking) => {
  return sendEmail({
    to,
    subject: `Booking Confirmation #${booking.bookingNumber}`,
    template: 'booking-confirmation',
    context: { name, booking },
  });
};
