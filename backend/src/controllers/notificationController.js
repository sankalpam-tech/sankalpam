import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Notification, { notificationTypes } from '../models/Notification.js';
import NotificationPreference, { notificationChannels } from '../models/NotificationPreference.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';
import { sendWhatsApp } from '../services/whatsappService.js';
import { sendPushNotification } from '../services/pushNotificationService.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, read, type } = req.query;
  const userId = req.user._id;

  const result = await Notification.getUserNotifications(userId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    readStatus: read,
    type,
  });

  res.json({
    success: true,
    data: result.notifications,
    pagination: result.pagination,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const count = await Notification.markAsRead([id], userId);

  if (count === 0) {
    res.status(404);
    throw new Error('Notification not found or already marked as read');
  }

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
export const markMultipleAsRead = asyncHandler(async (req, res) => {
  const { notificationIds = [] } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of notification IDs');
  }

  const count = await Notification.markAsRead(notificationIds, userId);

  res.json({
    success: true,
    message: `${count} notification(s) marked as read`,
  });
});

// @desc    Get user notification preferences
// @route   GET /api/notification-preferences
// @access  Private
export const getNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const preferences = await NotificationPreference.getOrCreateUserPreferences(userId);
  
  res.json({
    success: true,
    data: preferences,
  });
});

// @desc    Update user notification preferences
// @route   PUT /api/notification-preferences
// @access  Private
export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const userId = req.user._id;
  const { globalSettings, notificationTypes } = req.body;
  
  const preferences = await NotificationPreference.getOrCreateUserPreferences(userId);
  
  // Update preferences
  await preferences.updatePreferences({
    globalSettings,
    notificationTypes,
  });
  
  // Update user's email and phone preferences if provided
  const update = {};
  
  if (globalSettings.email !== undefined) {
    update.receiveEmails = globalSettings.email;
  }
  
  if (globalSettings.sms !== undefined) {
    update.receiveSMS = globalSettings.sms;
  }
  
  if (globalSettings.whatsapp !== undefined) {
    update.receiveWhatsApp = globalSettings.whatsapp;
  }
  
  if (globalSettings.marketingEmails !== undefined) {
    update.receiveMarketingEmails = globalSettings.marketingEmails;
  }
  
  if (globalSettings.marketingSms !== undefined) {
    update.receiveMarketingSMS = globalSettings.marketingSms;
  }
  
  if (globalSettings.marketingWhatsapp !== undefined) {
    update.receiveMarketingWhatsApp = globalSettings.marketingWhatsapp;
  }
  
  if (Object.keys(update).length > 0) {
    await User.findByIdAndUpdate(userId, { $set: update });
  }
  
  res.json({
    success: true,
    message: 'Notification preferences updated successfully',
    data: preferences,
  });
});

// @desc    Get notification settings (channels and types)
// @route   GET /api/notifications/settings
// @access  Public
export const getNotificationSettings = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      channels: Object.values(notificationChannels),
      types: Object.entries(notificationTypes).map(([key, value]) => ({
        id: value,
        name: key.split('_').map(word => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' '),
        description: `Notifications for ${key.toLowerCase().replace(/_/g, ' ')}`,
      })),
    },
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });
  
  res.json({
    success: true,
    data: { count },
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.user._id,
  });
  
  res.json({
    success: true,
    message: `Successfully deleted ${result.deletedCount} notifications`,
  });
});

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
export const sendTestNotification = asyncHandler(async (req, res) => {
  const { channel, type = 'SYSTEM' } = req.body;
  const userId = req.user._id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const testData = {
    title: 'Test Notification',
    message: 'This is a test notification to verify your notification settings.',
    type,
    data: {
      test: true,
      timestamp: new Date().toISOString(),
    },
  };
  
  let result;
  
  switch (channel) {
    case notificationChannels.EMAIL:
      if (!user.email) {
        res.status(400);
        throw new Error('User email not found');
      }
      result = await sendEmail({
        to: user.email,
        subject: testData.title,
        text: testData.message,
        html: `<p>${testData.message}</p>`,
      });
      break;
      
    case notificationChannels.SMS:
      if (!user.phone) {
        res.status(400);
        throw new Error('User phone number not found');
      }
      result = await sendSMS({
        to: user.phone,
        body: `${testData.title}: ${testData.message}`,
      });
      break;
      
    case notificationChannels.WHATSAPP:
      if (!user.phone) {
        res.status(400);
        throw new Error('User phone number not found');
      }
      result = await sendWhatsApp({
        to: user.phone,
        body: `${testData.title}: ${testData.message}`,
      });
      break;
      
    case notificationChannels.PUSH:
      if (!user.pushTokens || user.pushTokens.length === 0) {
        res.status(400);
        throw new Error('No push tokens found for user');
      }
      result = await sendPushNotification({
        tokens: user.pushTokens,
        title: testData.title,
        body: testData.message,
        data: testData.data,
      });
      break;
      
    case notificationChannels.IN_APP:
      // For in-app, we'll just create a notification
      result = await Notification.createNotification(userId, testData);
      break;
      
    default:
      res.status(400);
      throw new Error(`Unsupported notification channel: ${channel}`);
  }
  
  res.json({
    success: true,
    message: `Test ${channel} notification sent successfully`,
    result,
  });
});

// @desc    Register push token
// @route   POST /api/notifications/register-push-token
// @access  Private
export const registerPushToken = asyncHandler(async (req, res) => {
  const { token, deviceInfo = {} } = req.body;
  
  if (!token) {
    res.status(400);
    throw new Error('Push token is required');
  }
  
  const userId = req.user._id;
  
  // Check if token already exists for this user
  const user = await User.findById(userId);
  
  if (!user.pushTokens) {
    user.pushTokens = [];
  }
  
  // Check if token already exists
  const tokenExists = user.pushTokens.some(t => t.token === token);
  
  if (!tokenExists) {
    user.pushTokens.push({
      token,
      device: deviceInfo.device || 'unknown',
      os: deviceInfo.os || 'unknown',
      browser: deviceInfo.browser || 'unknown',
      lastUsed: new Date(),
    });
    
    await user.save();
  } else {
    // Update last used timestamp
    await User.updateOne(
      { _id: userId, 'pushTokens.token': token },
      { $set: { 'pushTokens.$.lastUsed': new Date() } }
    );
  }
  
  res.json({
    success: true,
    message: 'Push token registered successfully',
  });
});

// @desc    Unregister push token
// @route   POST /api/notifications/unregister-push-token
// @access  Private
export const unregisterPushToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    res.status(400);
    throw new Error('Push token is required');
  }
  
  const userId = req.user._id;
  
  await User.updateOne(
    { _id: userId },
    { $pull: { pushTokens: { token } } }
  );
  
  res.json({
    success: true,
    message: 'Push token unregistered successfully',
  });
});

// Helper function to send notification to user
// This is used by other services to send notifications
export const sendNotification = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId).select('email phone pushTokens');
    
    if (!user) {
      console.error(`User ${userId} not found`);
      return null;
    }
    
    // Get user's notification preferences
    const preferences = await NotificationPreference.getOrCreateUserPreferences(userId);
    
    // Create in-app notification by default
    const notification = await Notification.createNotification(userId, {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || notificationTypes.SYSTEM,
      data: notificationData.data || {},
    });
    
    // Check if email notification is enabled
    if (
      preferences.isNotificationEnabled(notification.type, notificationChannels.EMAIL) &&
      user.email
    ) {
      try {
        await sendEmail({
          to: user.email,
          subject: notificationData.title,
          text: notificationData.message,
          html: `<p>${notificationData.message}</p>`,
          template: notificationData.template,
          context: notificationData.context,
        });
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }
    
    // Check if SMS notification is enabled
    if (
      preferences.isNotificationEnabled(notification.type, notificationChannels.SMS) &&
      user.phone
    ) {
      try {
        await sendSMS({
          to: user.phone,
          body: `${notificationData.title}: ${notificationData.message}`,
        });
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
      }
    }
    
    // Check if WhatsApp notification is enabled
    if (
      preferences.isNotificationEnabled(notification.type, notificationChannels.WHATSAPP) &&
      user.phone
    ) {
      try {
        await sendWhatsApp({
          to: user.phone,
          body: `${notificationData.title}: ${notificationData.message}`,
        });
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }
    
    // Check if push notification is enabled
    if (
      preferences.isNotificationEnabled(notification.type, notificationChannels.PUSH) &&
      user.pushTokens &&
      user.pushTokens.length > 0
    ) {
      try {
        await sendPushNotification({
          tokens: user.pushTokens.map(t => t.token),
          title: notificationData.title,
          body: notificationData.message,
          data: notificationData.data || {},
        });
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    throw error;
  }
};