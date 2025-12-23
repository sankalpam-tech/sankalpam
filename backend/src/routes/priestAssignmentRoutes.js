import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  autoAssignPriest,
  manualAssignPriest,
  removePriestAssignment,
  getAvailablePriests,
  getPriestUpcomingBookings
} from '../controllers/priestAssignmentController.js';

const router = express.Router({ mergeParams: true });

// Protected routes (require authentication)
router.use(protect);

// Priest assignment routes
router.post('/assign-priest', authorize('admin'), autoAssignPriest);
router.put('/assign-priest/:priestId', authorize('admin'), manualAssignPriest);
router.delete('/assign-priest', authorize('admin'), removePriestAssignment);
router.get('/available-priests', authorize('admin'), getAvailablePriests);

// Priest's upcoming bookings
router.get('/upcoming-bookings', getPriestUpcomingBookings);

// Nested under /api/priests/:id
const priestRouter = express.Router({ mergeParams: true });
priestRouter.get('/upcoming-bookings', getPriestUpcomingBookings);

// Export both routers
export { router as bookingPriestRoutes };
export { priestRouter as priestRoutes };

// Default export for backward compatibility
export default router;
