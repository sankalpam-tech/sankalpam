import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getUserNotifications,
  markAsRead,
  markMultipleAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationSettings,
  getUnreadCount,
  clearAllNotifications,
  sendTestNotification,
  registerPushToken,
  unregisterPushToken,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

export const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('read').optional().isIn(['read', 'unread']),
    query('type').optional().isString(),
  ],
  getUserNotifications
);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put(
  '/:id/read',
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  markAsRead
);

// @route   PUT /api/notifications/mark-read
// @desc    Mark multiple notifications as read
// @access  Private
router.put(
  '/mark-read',
  [
    body('notificationIds')
      .isArray()
      .withMessage('notificationIds must be an array')
      .notEmpty()
      .withMessage('At least one notification ID is required'),
    body('notificationIds.*')
      .isMongoId()
      .withMessage('Invalid notification ID'),
  ],
  markMultipleAsRead
);

// @route   GET /api/notification-preferences
// @desc    Get user notification preferences
// @access  Private
router.get('/notification-preferences', getNotificationPreferences);

// @route   PUT /api/notification-preferences
// @desc    Update user notification preferences
// @access  Private
router.put(
  '/notification-preferences',
  [
    body('globalSettings')
      .optional()
      .isObject()
      .withMessage('globalSettings must be an object'),
    body('notificationTypes')
      .optional()
      .isArray()
      .withMessage('notificationTypes must be an array'),
    body('notificationTypes.*.type')
      .optional()
      .isString()
      .withMessage('Notification type must be a string'),
    body('notificationTypes.*.enabled')
      .optional()
      .isBoolean()
      .withMessage('Enabled must be a boolean'),
    body('notificationTypes.*.channels')
      .optional()
      .isArray()
      .withMessage('Channels must be an array'),
    body('notificationTypes.*.channels.*')
      .isString()
      .withMessage('Channel must be a string'),
  ],
  updateNotificationPreferences
);

// @route   GET /api/notifications/settings
// @desc    Get notification settings (channels and types)
// @access  Public
router.get('/settings', getNotificationSettings);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   DELETE /api/notifications
// @desc    Clear all notifications
// @access  Private
router.delete('/', clearAllNotifications);

// @route   POST /api/notifications/test
// @desc    Send test notification
// @access  Private
router.post(
  '/test',
  [
    body('channel')
      .isString()
      .isIn(['email', 'sms', 'whatsapp', 'push', 'in_app'])
      .withMessage('Invalid notification channel'),
    body('type')
      .optional()
      .isString()
      .withMessage('Notification type must be a string'),
  ],
  sendTestNotification
);

// @route   POST /api/notifications/register-push-token
// @desc    Register push token
// @access  Private
router.post(
  '/register-push-token',
  [
    body('token')
      .isString()
      .notEmpty()
      .withMessage('Push token is required'),
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Device info must be an object'),
  ],
  registerPushToken
);

// @route   POST /api/notifications/unregister-push-token
// @desc    Unregister push token
// @access  Private
router.post(
  '/unregister-push-token',
  [
    body('token')
      .isString()
      .notEmpty()
      .withMessage('Push token is required'),
  ],
  unregisterPushToken
);

export default router;