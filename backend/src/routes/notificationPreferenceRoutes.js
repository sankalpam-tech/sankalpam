import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationSettings,
  updateNotificationSetting,
  getNotificationPreferenceById,
  updateNotificationPreferenceById,
} from '../controllers/notificationPreferenceController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.route('/my-preferences')
  .get(getNotificationPreferences)
  .put(updateNotificationPreferences);

router.route('/settings')
  .get(getNotificationSettings);

router.route('/settings/:type')
  .put(updateNotificationSetting);

// Admin routes (if needed)
router.route('/user/:userId')
  .get(getNotificationPreferenceById)
  .put(updateNotificationPreferenceById);

export default router;
