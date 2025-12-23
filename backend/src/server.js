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
import cookieParser from 'cookie-parser'; // 🔥 YOUR CODE (cookie support)

import './config/passport.js'; // 🔥 YOUR CODE (force passport strategy execution)
import passport from 'passport'; // 🔥 YOUR CODE

// import 'express-async-errors';
import { StatusCodes } from 'http-status-codes';

// Import config
import { connectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
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

// Initialize express
const app = express();

// Get current directory name (alternative to __dirname in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config(); // 🔥 YOUR CODE (explicit env loading)

// Connect to Database
connectDB();

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 🔥 YOUR CODE (cookie parsing for auth)
app.use(cookieParser());

// 🔥 YOUR CODE (passport initialization)
app.use(passport.initialize());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
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

// Enable CORS with specific configuration
const corsOptions = {
  origin: true, // Reflect the request origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Compress all responses
app.use(compression());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure webhook middleware for raw body (needed for Razorpay webhook verification)
app.use('/api/v1/payments/webhook/razorpay', express.raw({ type: 'application/json' }));

// Mount routers
app.get('/api/v1', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to Sankalpam API',
    version: '1.0.0',
    documentation: '/api/v1/docs', // Will be added with Swagger in next phases
    endpoints: [
      // 🔥 YOUR CODE (auth is NOT under /api/v1)
      { path: '/auth', description: 'Authentication endpoints (login, signup, OAuth)' },

      { path: '/api/v1/users', description: 'User management endpoints' },
      { path: '/api/v1/astrologers', description: 'Astrologer management endpoints' },
      { path: '/api/v1/pujas', description: 'Puja services endpoints' },
      { path: '/api/v1/puja-categories', description: 'Puja categories endpoints' },
      { path: '/api/v1/priest-availability', description: 'Priest availability management' },
      { path: '/api/v1/priest-assignments', description: 'Priest assignment management' },
      { path: '/api/v1/bookings', description: 'Puja booking endpoints' },
      { path: '/api/v1/payments', description: 'Payment processing endpoints' },
      { path: '/api/v1/ecommerce', description: 'E-commerce endpoints (products, categories, cart, orders)' },
      { path: '/api/v1/tours', description: 'Tour packages endpoints' },
      { path: '/api/v1/tour-bookings', description: 'Tour booking endpoints' },
      { path: '/api/v1/tour-reviews', description: 'Tour review endpoints' },
      { path: '/api/v1/notifications', description: 'Notification endpoints' },
      { path: '/api/v1/notification-preferences', description: 'Notification preference endpoints' }
    ]
  });
});

// 🔥 YOUR CODE (auth routes kept separate)
app.use('/auth', authRoutes);

// Define API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pujas', pujaRoutes);
app.use('/api/v1/puja-categories', pujaCategoryRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', express.json(), paymentRoutes);

// E-commerce routes
console.log('Mounting ecommerce routes...');
app.use('/api/v1/ecommerce', ecommerceRoutes);
console.log('E-commerce routes mounted successfully');

// Astrologer and Priest related routes
app.use('/api/v1/astrologers', astrologerRoutes);
app.use('/api/v1/priest-availability', priestAvailabilityRoutes);
app.use('/api/v1/priest-assignments', priestAssignmentRoutes);

// Tour related routes
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/tour-bookings', tourBookingRoutes);
app.use('/api/v1/tour-reviews', tourReviewRoutes);

// Notification related routes
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/notification-preferences', notificationPreferenceRoutes);

// Handle 404
app.use((req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;
