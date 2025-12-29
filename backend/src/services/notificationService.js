import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import { sendWhatsApp } from './whatsappService.js';
import { sendPushNotification, sendMulticastPushNotification } from './pushNotificationService.js';
import NotificationPreference from '../models/NotificationPreference.js';
import User from '../models/User.js';
import { notificationChannels, notificationTypes } from '../models/Notification.js';

/**
 * Send a notification to a user through their preferred channels
 * @param {Object} options - Notification options
 * @param {string|Object} options.user - User ID or user object
 * @param {string} options.type - Notification type (from notificationTypes)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {Object} [options.data] - Additional data to include in the notification
 * @param {string[]} [options.channels] - Specific channels to use (overrides user preferences)
 * @returns {Promise<Object>} - Result of sending the notifications
 */
export const sendNotification = async ({
  user: userOrId,
  type = notificationTypes.SYSTEM,
  title,
  message,
  data = {},
  channels,
  force = false, // Force send even if user has disabled notifications
}) => {
  try {
    // Get user and preferences
    const userId = typeof userOrId === 'string' ? userOrId : userOrId._id || userOrId.id;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user data if only ID was provided
    const user = typeof userOrId === 'string' 
      ? await User.findById(userId).select('email phone pushTokens notificationSettings')
      : userOrId;

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's notification preferences
    const preferences = await NotificationPreference.getOrCreateUserPreferences(userId);
    
    // Determine which channels to use
    let channelsToUse = [];
    
    if (channels && channels.length > 0) {
      // Use specified channels if provided
      channelsToUse = channels.filter(channel => 
        Object.values(notificationChannels).includes(channel)
      );
    } else if (!force) {
      // Otherwise, use user's preferred channels for this notification type
      const notificationType = preferences.notificationTypes.find(nt => nt.type === type);
      
      if (notificationType && notificationType.enabled) {
        channelsToUse = notificationType.channels.filter(channel => 
          preferences.globalSettings[channel] !== false
        );
      }
    } else {
      // If force is true, use all available channels
      channelsToUse = Object.values(notificationChannels);
    }

    // If no channels are enabled and we're not forcing, don't send any notifications
    if (channelsToUse.length === 0 && !force) {
      return {
        success: false,
        message: 'No notification channels enabled for this user and notification type',
        channels: [],
      };
    }

    // Prepare notification data
    const notificationData = {
      title,
      message,
      type,
      data: {
        ...data,
        notificationType: type,
        timestamp: new Date().toISOString(),
      },
    };

    // Send notifications through each channel
    const results = {
      success: true,
      channels: {},
      errors: [],
    };

    // Send email if enabled and user has an email
    if (channelsToUse.includes(notificationChannels.EMAIL) && user.email) {
      try {
        const emailResult = await sendEmail({
          to: user.email,
          subject: title,
          text: message,
          template: type.toLowerCase().replace(/_/g, '-'),
          context: {
            ...notificationData,
            user,
          },
        });
        
        results.channels.email = {
          success: true,
          ...emailResult,
        };
      } catch (error) {
        results.success = false;
        results.errors.push({
          channel: 'email',
          error: error.message,
        });
        results.channels.email = {
          success: false,
          error: error.message,
        };
      }
    }

    // Send SMS if enabled and user has a phone number
    if (channelsToUse.includes(notificationChannels.SMS) && user.phone) {
      try {
        const smsResult = await sendSMS({
          to: user.phone,
          body: `${title}: ${message}`,
        });
        
        results.channels.sms = {
          success: true,
          ...smsResult,
        };
      } catch (error) {
        results.success = false;
        results.errors.push({
          channel: 'sms',
          error: error.message,
        });
        results.channels.sms = {
          success: false,
          error: error.message,
        };
      }
    }

    // Send WhatsApp if enabled and user has a phone number
    if (channelsToUse.includes(notificationChannels.WHATSAPP) && user.phone) {
      try {
        const whatsappResult = await sendWhatsApp({
          to: user.phone,
          body: `*${title}*\n\n${message}`,
        });
        
        results.channels.whatsapp = {
          success: true,
          ...whatsappResult,
        };
      } catch (error) {
        results.success = false;
        results.errors.push({
          channel: 'whatsapp',
          error: error.message,
        });
        results.channels.whatsapp = {
          success: false,
          error: error.message,
        };
      }
    }

    // Send push notification if enabled and user has push tokens
    if (channelsToUse.includes(notificationChannels.PUSH) && user.pushTokens && user.pushTokens.length > 0) {
      try {
        const tokens = user.pushTokens.map(t => t.token);
        const pushResult = await sendMulticastPushNotification({
          tokens,
          title,
          body: message,
          data: notificationData.data,
        });
        
        results.channels.push = {
          success: pushResult.success,
          successCount: pushResult.successCount,
          failureCount: pushResult.failureCount,
          errors: pushResult.errors,
        };
        
        if (pushResult.failureCount > 0) {
          results.success = false;
          results.errors.push({
            channel: 'push',
            error: `${pushResult.failureCount} push notifications failed to send`,
            details: pushResult.errors,
          });
        }
      } catch (error) {
        results.success = false;
        results.errors.push({
          channel: 'push',
          error: error.message,
        });
        results.channels.push = {
          success: false,
          error: error.message,
        };
      }
    }

    // Save the notification in the database (in-app notification)
    if (channelsToUse.includes(notificationChannels.IN_APP)) {
      try {
        // This would typically be saved to the database
        // const notification = await Notification.create({
        //   user: userId,
        //   title,
        //   message,
        //   type,
        //   data,
        // });
        
        results.channels.inApp = {
          success: true,
          // notificationId: notification._id,
        };
      } catch (error) {
        results.success = false;
        results.errors.push({
          channel: 'inApp',
          error: error.message,
        });
        results.channels.inApp = {
          success: false,
          error: error.message,
        };
      }
    }

    return results;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};

/**
 * Send a notification to multiple users
 * @param {Object} options - Notification options
 * @param {string[]|Object[]} options.users - Array of user IDs or user objects
 * @param {string} options.type - Notification type (from notificationTypes)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {Object} [options.data] - Additional data to include in the notification
 * @param {string[]} [options.channels] - Specific channels to use (overrides user preferences)
 * @returns {Promise<Object>} - Results of sending the notifications
 */
export const sendBulkNotification = async ({
  users,
  type = notificationTypes.SYSTEM,
  title,
  message,
  data = {},
  channels,
}) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new Error('At least one user is required');
  }

  const results = {
    total: users.length,
    successCount: 0,
    failureCount: 0,
    results: [],
    errors: [],
  };

  // Process each user
  for (const user of users) {
    try {
      const result = await sendNotification({
        user,
        type,
        title,
        message,
        data,
        channels,
      });

      if (result.success) {
        results.successCount++;
      } else {
        results.failureCount++;
        results.errors.push({
          userId: typeof user === 'string' ? user : user._id || user.id,
          error: result.error,
          details: result.errors,
        });
      }

      results.results.push({
        userId: typeof user === 'string' ? user : user._id || user.id,
        success: result.success,
        channels: result.channels || {},
      });
    } catch (error) {
      results.failureCount++;
      results.errors.push({
        userId: typeof user === 'string' ? user : user._id || user.id,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
      
      results.results.push({
        userId: typeof user === 'string' ? user : user._id || user.id,
        success: false,
        error: error.message,
      });
    }
  }

  results.success = results.failureCount === 0;
  return results;
};

/**
 * Send a notification to users who match a specific query
 * @param {Object} query - MongoDB query to find users
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} - Results of sending the notifications
 */
export const sendNotificationToQuery = async (query, {
  type = notificationTypes.SYSTEM,
  title,
  message,
  data = {},
  channels,
  limit = 1000,
  skip = 0,
}) => {
  try {
    // Find users matching the query
    const users = await User.find(query)
      .select('email phone pushTokens notificationSettings')
      .limit(limit)
      .skip(skip)
      .lean();

    if (users.length === 0) {
      return {
        success: true,
        message: 'No users match the query',
        total: 0,
        successCount: 0,
        failureCount: 0,
        results: [],
      };
    }

    // Send notifications to all matching users
    return sendBulkNotification({
      users,
      type,
      title,
      message,
      data,
      channels,
    });
  } catch (error) {
    console.error('Error in sendNotificationToQuery:', error);
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};

/**
 * Get available notification channels
 * @returns {Object} - Available notification channels
 */
export const getAvailableChannels = () => {
  return {
    channels: Object.values(notificationChannels),
    types: Object.entries(notificationTypes).map(([key, value]) => ({
      id: value,
      name: key.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
      description: `Notifications for ${key.toLowerCase().replace(/_/g, ' ')}`,
    })),
  };
};

export default {
  sendNotification,
  sendBulkNotification,
  sendNotificationToQuery,
  getAvailableChannels,
  notificationChannels,
  notificationTypes,
};
