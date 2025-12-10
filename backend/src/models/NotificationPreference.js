import mongoose from 'mongoose';

const notificationChannels = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
  IN_APP: 'in_app',
};

const notificationTypes = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_UPDATE: 'booking_update',
  BOOKING_CANCELLATION: 'booking_cancellation',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  PAYMENT_FAILED: 'payment_failed',
  ACCOUNT_UPDATE: 'account_update',
  PROMOTIONAL: 'promotional',
  SYSTEM: 'system',
  TOUR_REMINDER: 'tour_reminder',
  REVIEW_REQUEST: 'review_request',
};

// Define the schema for notification type preferences
const notificationTypePreferenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(notificationTypes),
      required: true,
    },
    channels: [{
      type: String,
      enum: Object.values(notificationChannels),
      required: true,
    }],
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false } // Prevent automatic _id creation for subdocuments
);

// Main notification preference schema
const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },
    globalSettings: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      whatsapp: {
        type: Boolean,
        default: true,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: true,
      },
      marketingSms: {
        type: Boolean,
        default: true,
      },
      marketingWhatsapp: {
        type: Boolean,
        default: true,
      },
      quietHoursEnabled: {
        type: Boolean,
        default: false,
      },
      quietHoursStart: {
        type: String, // Format: 'HH:MM' in 24-hour format
        default: '22:00',
      },
      quietHoursEnd: {
        type: String, // Format: 'HH:MM' in 24-hour format
        default: '08:00',
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
    },
    notificationTypes: [notificationTypePreferenceSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
notificationPreferenceSchema.index({ user: 1 }, { unique: true });

// Pre-save hook to ensure all notification types exist
notificationPreferenceSchema.pre('save', function(next) {
  // If notificationTypes is empty or not set, initialize with all types
  if (!this.notificationTypes || this.notificationTypes.length === 0) {
    this.notificationTypes = Object.values(notificationTypes).map(type => ({
      type,
      channels: [
        notificationChannels.EMAIL,
        notificationChannels.IN_APP,
      ],
      enabled: true,
    }));
  } else {
    // Ensure all notification types exist
    const existingTypes = this.notificationTypes.map(nt => nt.type);
    const missingTypes = Object.values(notificationTypes).filter(
      type => !existingTypes.includes(type)
    );

    if (missingTypes.length > 0) {
      missingTypes.forEach(type => {
        this.notificationTypes.push({
          type,
          channels: [
            notificationChannels.EMAIL,
            notificationChannels.IN_APP,
          ],
          enabled: true,
        });
      });
    }
  }
  
  this.lastUpdated = new Date();
  next();
});

// Static method to get or create user preferences
notificationPreferenceSchema.statics.getOrCreateUserPreferences = async function(userId) {
  let preferences = await this.findOne({ user: userId });
  
  if (!preferences) {
    preferences = new this({ user: userId });
    await preferences.save();
  }
  
  return preferences;
};

// Method to update notification preferences
notificationPreferenceSchema.methods.updatePreferences = async function(updates) {
  const { globalSettings, notificationTypes } = updates;
  
  if (globalSettings) {
    this.globalSettings = { ...this.globalSettings, ...globalSettings };
  }
  
  if (notificationTypes && Array.isArray(notificationTypes)) {
    notificationTypes.forEach(update => {
      const existingType = this.notificationTypes.find(
        nt => nt.type === update.type
      );
      
      if (existingType) {
        if ('enabled' in update) {
          existingType.enabled = update.enabled;
        }
        if (update.channels && Array.isArray(update.channels)) {
          existingType.channels = update.channels;
        }
      }
    });
  }
  
  this.lastUpdated = new Date();
  await this.save();
  return this;
};

// Method to check if a notification type is enabled for a channel
notificationPreferenceSchema.methods.isNotificationEnabled = function(type, channel) {
  // Check global settings first
  if (!this.globalSettings[channel]) {
    return false;
  }
  
  // Check quiet hours
  if (this.globalSettings.quietHoursEnabled) {
    const now = new Date();
    const [startHour, startMinute] = this.globalSettings.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = this.globalSettings.quietHoursEnd.split(':').map(Number);
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const quietStart = startHour * 60 + startMinute;
    const quietEnd = endHour * 60 + endMinute;
    
    // Handle overnight quiet hours
    if (quietStart < quietEnd) {
      if (currentTime >= quietStart && currentTime < quietEnd) {
        return false; // Currently in quiet hours
      }
    } else {
      if (currentTime >= quietStart || currentTime < quietEnd) {
        return false; // Currently in quiet hours (overnight)
      }
    }
  }
  
  // Check notification type settings
  const notificationType = this.notificationTypes.find(nt => nt.type === type);
  
  if (!notificationType || !notificationType.enabled) {
    return false;
  }
  
  return notificationType.channels.includes(channel);
};

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

export { notificationChannels, notificationTypes };
export default NotificationPreference;
