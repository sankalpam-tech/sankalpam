import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import 'colors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';

import './config/passport.js';
import passport from 'passport';

import { StatusCodes } from 'http-status-codes';

// Config & DB
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

// import dotenv from 'dotenv';
// dotenv.config();

// Init app
const app = express();

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 DB CONNECTION (cached internally)
connectDB();

// Security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookies & Auth
app.use(cookieParser());
app.use(passport.initialize());

// Sanitization (optional but recommended)
// app.use(mongoSanitize());
// app.use(xss());

// Prevent HTTP param pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Compression
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Razorpay webhook (raw body)
app.use(
  '/api/v1/payments/webhook/razorpay',
  express.raw({ type: 'application/json' })
);

// Root API
app.get('/api/v1', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to Sankalpam API',
    version: '1.0.0'
  });
});

// Routes
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

// ✅ LAMBDA EXPORT (VERY IMPORTANT)
export const handler = serverless(app);
