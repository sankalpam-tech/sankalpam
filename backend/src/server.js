import dotenv from 'dotenv';
dotenv.config(); // ✅ YOUR CODE (env loading)

//YOUR CODE 
import './config/passport.js';   // 🔥 force execution
import passport from 'passport';
// ================== IMPORTS ==================
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
import { StatusCodes } from 'http-status-codes';

// DB & Error handler
import { connectDB } from './config/db.js';
// import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import pujaRoutes from './routes/pujaRoutes.js';
// import pujaCategoryRoutes from './routes/pujaCategoryRoutes.js';
// import bookingRoutes from './routes/bookingRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
// import tourRoutes from './routes/tourRoutes.js';
// import tourBookingRoutes from './routes/tourBookingRoutes.js';
// import tourReviewRoutes from './routes/tourReviewRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';
// import notificationPreferenceRoutes from './routes/notificationPreferenceRoutes.js';
// import ecommerceRoutes from './routes/ecommerceRoutes.js';
// import astrologerRoutes from './routes/astrologerRoutes.js';
// import priestAssignmentRoutes from './routes/priestAssignmentRoutes.js';
// import priestAvailabilityRoutes from './routes/priestAvailabilityRoutes.js';

// ================== APP INIT ==================
const app = express();

// dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== DATABASE ==================
connectDB(); // (existing developer code)

// ================== SECURITY ==================
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// ================== BODY PARSER ==================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ✅ YOUR CODE (cookie support for auth)
app.use(cookieParser());

// ================== PASSPORT ==================
// ✅ YOUR CODE (passport initialization)
app.use(passport.initialize());

// ================== SANITIZATION ==================
//app.use(mongoSanitize());
//app.use(xss());

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price']
  })
);

// ================== CORS ==================
// ✅ YOUR CODE (your frontend origins preserved)
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ================== PERFORMANCE ==================
app.use(compression());

// ================== STATIC ==================
app.use(express.static(path.join(__dirname, 'public')));

// ================== WEBHOOK ==================
app.use(
  '/api/v1/payments/webhook/razorpay',
  express.raw({ type: 'application/json' })
);

// ================== ROOT ==================
app.get('/api/v1', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to Sankalpam API',
    version: '1.0.0'
  });
});

// ================== ROUTES ==================

// ✅ YOUR CODE (kept EXACTLY as it is)
app.use('/auth', authRoutes);

// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/pujas', pujaRoutes);
// app.use('/api/v1/puja-categories', pujaCategoryRoutes);
// app.use('/api/v1/bookings', bookingRoutes);
// app.use('/api/v1/payments', express.json(), paymentRoutes);
// app.use('/api/v1/ecommerce', ecommerceRoutes);
// app.use('/api/v1/astrologers', astrologerRoutes);
// app.use('/api/v1/priest-availability', priestAvailabilityRoutes);
// app.use('/api/v1/priest-assignments', priestAssignmentRoutes);
// app.use('/api/v1/tours', tourRoutes);
// app.use('/api/v1/tour-bookings', tourBookingRoutes);
// app.use('/api/v1/tour-reviews', tourReviewRoutes);
// app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/notification-preferences', notificationPreferenceRoutes);

// ================== 404 ==================
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
});

// ================== ERROR HANDLER ==================
// app.use(errorHandler);

// ================== SERVER ==================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

process.on('unhandledRejection', err => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});

export default app;
