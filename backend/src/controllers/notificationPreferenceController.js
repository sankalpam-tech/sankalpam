import { StatusCodes } from 'http-status-codes';
import NotificationPreference from '../models/NotificationPreference.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get notification preferences for logged in user
// @route   GET /api/v1/notification-preferences/my-preferences
// @access  Private
export const getNotificationPreferences = asyncHandler(async (req, res, next) => {
  let preferences = await NotificationPreference.findOne({ user: req.user.id });

  // If no preferences exist, create default ones
  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: req.user.id,
      email: true,
      push: true,
      sms: false,
      whatsapp: false,
      inApp: true,
      marketing: false,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      timezone: 'Asia/Kolkata',
      notificationTypes: {
        bookingConfirmation: { email: true, push: true, inApp: true },
        bookingUpdate: { email: true, push: true, inApp: true },
        paymentConfirmation: { email: true, push: true, inApp: true },
        accountActivity: { email: true, push: false, inApp: true },
        promotions: { email: false, push: false, inApp: false, whatsapp: false },
        systemUpdates: { email: true, push: false, inApp: true }
      }
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: preferences
  });
});

// @desc    Update notification preferences
// @route   PUT /api/v1/notification-preferences/my-preferences
// @access  Private
export const updateNotificationPreferences = asyncHandler(async (req, res, next) => {
  let preferences = await NotificationPreference.findOne({ user: req.user.id });

  if (!preferences) {
    // Create new preferences if they don't exist
    req.body.user = req.user.id;
    preferences = await NotificationPreference.create(req.body);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: preferences
    });
  }

  // Update only the fields that are passed in
  const {
    email,
    push,
    sms,
    whatsapp,
    inApp,
    marketing,
    quietHours,
    timezone,
    notificationTypes
  } = req.body;

  if (email !== undefined) preferences.email = email;
  if (push !== undefined) preferences.push = push;
  if (sms !== undefined) preferences.sms = sms;
  if (whatsapp !== undefined) preferences.whatsapp = whatsapp;
  if (inApp !== undefined) preferences.inApp = inApp;
  if (marketing !== undefined) preferences.marketing = marketing;
  if (quietHours) preferences.quietHours = { ...preferences.quietHours, ...quietHours };
  if (timezone) preferences.timezone = timezone;
  
  // Update notification types
  if (notificationTypes) {
    preferences.notificationTypes = {
      ...preferences.notificationTypes,
      ...notificationTypes
    };
  }

  await preferences.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: preferences
  });
});

// @desc    Get notification settings
// @route   GET /api/v1/notification-preferences/settings
// @access  Private
export const getNotificationSettings = asyncHandler(async (req, res, next) => {
  const preferences = await NotificationPreference.findOne({ user: req.user.id });
  
  if (!preferences) {
    return next(
      new ErrorResponse('Notification preferences not found', 404)
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      email: preferences.email,
      push: preferences.push,
      sms: preferences.sms,
      whatsapp: preferences.whatsapp,
      inApp: preferences.inApp,
      marketing: preferences.marketing,
      quietHours: preferences.quietHours,
      timezone: preferences.timezone
    }
  });
});

// @desc    Update specific notification setting
// @route   PUT /api/v1/notification-preferences/settings/:type
// @access  Private
export const updateNotificationSetting = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return next(
      new ErrorResponse('Please provide a valid enabled status (boolean)', 400)
    );
  }

  const validTypes = ['email', 'push', 'sms', 'whatsapp', 'inApp', 'marketing'];
  
  if (!validTypes.includes(type)) {
    return next(
      new ErrorResponse(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`, 400)
    );
  }

  let preferences = await NotificationPreference.findOne({ user: req.user.id });

  if (!preferences) {
    // Create new preferences with default values if they don't exist
    preferences = await NotificationPreference.create({
      user: req.user.id,
      [type]: enabled
    });
  } else {
    // Update the specific setting
    preferences[type] = enabled;
    await preferences.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      [type]: enabled
    }
  });
});

// @desc    Get notification preferences by user ID (Admin)
// @route   GET /api/v1/notification-preferences/user/:userId
// @access  Private/Admin
export const getNotificationPreferenceById = asyncHandler(async (req, res, next) => {
  const preferences = await NotificationPreference.findOne({
    user: req.params.userId
  });

  if (!preferences) {
    return next(
      new ErrorResponse(
        `No notification preferences found for user ${req.params.userId}`,
        404
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: preferences
  });
});

// @desc    Update notification preferences by user ID (Admin)
// @route   PUT /api/v1/notification-preferences/user/:userId
// @access  Private/Admin
export const updateNotificationPreferenceById = asyncHandler(async (req, res, next) => {
  let preferences = await NotificationPreference.findOne({
    user: req.params.userId
  });

  if (!preferences) {
    // Create new preferences if they don't exist
    req.body.user = req.params.userId;
    preferences = await NotificationPreference.create(req.body);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: preferences
    });
  }

  // Update only the fields that are passed in
  const {
    email,
    push,
    sms,
    whatsapp,
    inApp,
    marketing,
    quietHours,
    timezone,
    notificationTypes
  } = req.body;

  if (email !== undefined) preferences.email = email;
  if (push !== undefined) preferences.push = push;
  if (sms !== undefined) preferences.sms = sms;
  if (whatsapp !== undefined) preferences.whatsapp = whatsapp;
  if (inApp !== undefined) preferences.inApp = inApp;
  if (marketing !== undefined) preferences.marketing = marketing;
  if (quietHours) preferences.quietHours = { ...preferences.quietHours, ...quietHours };
  if (timezone) preferences.timezone = timezone;
  
  // Update notification types if provided
  if (notificationTypes) {
    preferences.notificationTypes = {
      ...preferences.notificationTypes,
      ...notificationTypes
    };
  }

  await preferences.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: preferences
  });
});
