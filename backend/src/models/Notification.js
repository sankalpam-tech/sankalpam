import mongoose from 'mongoose';

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

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(notificationTypes),
      required: [true, 'Notification type is required'],
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    data: {
      // Flexible field to store additional data like bookingId, tourId, etc.
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      // For storing technical details like email sent status, etc.
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false, // Don't include in query results by default
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      index: { expires: '30d' }, // Auto-delete after 30 days
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for formatted date
notificationSchema.virtual('date').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Static method to create a new notification
notificationSchema.statics.createNotification = async function(userId, data) {
  const {
    title,
    message,
    type,
    data: notificationData = {},
    metadata = {},
    expiresInDays = 30,
  } = data;

  const notification = new this({
    user: userId,
    title,
    message,
    type,
    data: notificationData,
    metadata,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
  });

  await notification.save();
  return notification;
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(notificationIds, userId) {
  const result = await this.updateMany(
    {
      _id: { $in: notificationIds },
      user: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = async function(
  userId,
  { page = 1, limit = 20, readStatus, type } = {}
) {
  const query = { user: userId };
  
  if (readStatus !== undefined) {
    query.isRead = readStatus === 'read';
  }
  
  if (type) {
    query.type = type;
  }
  
  const skip = (page - 1) * limit;
  
  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);
  
  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Pre-save hook to update readAt when isRead changes
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export { notificationTypes };
export default Notification;
