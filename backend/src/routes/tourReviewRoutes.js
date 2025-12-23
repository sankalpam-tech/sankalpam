import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getTourReviews,
  getTourReview,
  createTourReview,
  updateTourReview,
  deleteTourReview,
  getMyTourReviews,
  getReviewsByTour,
  getReviewsByUser,
  getTourReviewStats,
} from '../controllers/tourReviewController.js';

const router = express.Router();

// Public routes
router.get('/', getTourReviews);
router.get('/:id', getTourReview);
router.get('/tour/:tourId', getReviewsByTour);

// Protected routes
router.use(protect);

// User routes
router.post('/', createTourReview);
router.get('/my-reviews', getMyTourReviews);
router.put('/:id', updateTourReview);
router.delete('/:id', deleteTourReview);

// Admin routes
router.get('/user/:userId', protect, authorize('admin'), getReviewsByUser);
router.get('/stats/tour/:tourId', protect, authorize('admin'), getTourReviewStats);

export default router;