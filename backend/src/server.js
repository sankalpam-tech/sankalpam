import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import 'colors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';

import './config/passport.js';
import { connectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pujaRoutes from './routes/pujaRoutes.js';
import pujaCategoryRoutes from './routes/pujaCategoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import tourBookingRoutes from './routes/tourBookingRoutes.js';
import tourReviewRoutes from './routes/tourReviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import notificationPreferenceRoutes from './routes/notificationPreferenceRoutes.js';
import ecommerceRoutes from './routes/ecommerceRoutes.js';
import astrologerRoutes from './routes/astrologerRoutes.js';
import priestAssignmentRoutes from './routes/priestAssignmentRoutes.js';
import priestAvailabilityRoutes from './routes/priestAvailabilityRoutes.js';


const app = express();

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect DB (Lambda-safe – runs once per container)
connectDB();

// Security
app.use(helmet());

// Logging (disable noisy logs in Lambda prod)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later'
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookies + Passport
app.use(cookieParser());
app.use(passport.initialize());

// HPP
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price']
  })
);

// CORS
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Compression
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Razorpay webhook (RAW body)
app.use(
  '/api/v1/payments/webhook/razorpay',
  express.raw({ type: 'application/json' })
);

// Routes
app.get('/api/v1', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to Sankalpam API'
  });
});

app.use('/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pujas', pujaRoutes);
app.use('/api/v1/puja-categories', pujaCategoryRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', express.json(), paymentRoutes);
app.use('/api/v1/ecommerce', ecommerceRoutes);
app.use('/api/v1/astrologers', astrologerRoutes);
app.use('/api/v1/priest-availability', priestAvailabilityRoutes);
app.use('/api/v1/priest-assignments', priestAssignmentRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/tour-bookings', tourBookingRoutes);
app.use('/api/v1/tour-reviews', tourReviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/notification-preferences', notificationPreferenceRoutes);

// 404
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
});

// Error handler
app.use(errorHandler);

/* ============================
   🚀 LOCAL vs LAMBDA START
============================ */

if (process.env.IS_LAMBDA !== 'true') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.yellow.bold);
  });
}

// 🔥 Lambda handler export
export const handler = serverless(app);
export default app;
