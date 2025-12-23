import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPriestAvailability,
  updatePriestAvailability,
  setCustomAvailability,
  checkPriestAvailability,
  getAvailableSlots
} from '../controllers/priestAvailabilityController.js';

const router = express.Router({ mergeParams: true });

// Public routes (read-only)
router.get('/', getPriestAvailability);
router.get('/check', checkPriestAvailability);
router.get('/slots', getAvailableSlots);

// Protected routes (require authentication)
router.use(protect);

// Priest can manage their own availability, admin can manage any
router.put('/', updatePriestAvailability);
router.post('/date', setCustomAvailability);

// Admin-only routes
router.use(authorize('admin'));
// Add any admin-specific routes here

export default router;