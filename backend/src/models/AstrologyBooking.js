import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Reference to the user who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    
    // Reference to the astrologer
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: [true, 'Astrologer reference is required'],
      index: true
    },
    
    // Reference to the service
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AstrologyService',
      required: [true, 'Service reference is required'],
      index: true
    },
    
    // Reference to the slot (if booked from available slots)
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AstrologySlot',
      index: true
    },
    
    // Booking details
    bookingNumber: {
      type: String,
      unique: true,
      index: true
    },
    
    // Session timing
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true
    },
    
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function(value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time'
      }
    },
    
    // Timezone
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      enum: Intl.supportedValuesOf('timeZone')
    },
    
    // Booking status
    status: {
      type: String,
      enum: {
        values: [
          'pending',      // Booking is created but not confirmed
          'confirmed',    // Booking is confirmed
          'rescheduled',  // Booking was rescheduled
          'cancelled',    // Booking was cancelled
          'completed',    // Session was completed
          'no_show',      // User did not show up
          'rejected'      // Booking was rejected by astrologer
        ],
        message: '{VALUE} is not a valid status'
      },
      default: 'pending',
      index: true
    },
    
    // Payment information
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      index: true
    },
    
    paymentStatus: {
      type: String,
      enum: {
        values: [
          'pending',      // Payment initiated but not completed
          'paid',         // Payment completed successfully
          'failed',       // Payment failed
          'refunded',     // Payment was refunded
          'partially_refunded', // Partial refund was issued
          'cancelled'     // Payment was cancelled
        ],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending',
      index: true
    },
    
    // Amount details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
      uppercase: true
    },
    
    // Discount and tax
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
      },
      code: String,
      description: String
    },
    
    tax: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative']
      },
      rate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative']
      },
      name: {
        type: String,
        default: 'GST'
      }
    },
    
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    
    // Communication details
    communicationMethod: {
      type: String,
      enum: {
        values: ['audio', 'video', 'chat', 'in_person', 'phone'],
        message: '{VALUE} is not a valid communication method'
      },
      required: [true, 'Communication method is required']
    },
    
    meetingLink: {
      type: String,
      trim: true
    },
    
    // User details at the time of booking
    userDetails: {
      name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'User email is required'],
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        required: [true, 'User phone is required'],
        trim: true
      },
      dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required for astrological analysis']
      },
      timeOfBirth: {
        type: String,
        required: [true, 'Time of birth is required for astrological analysis'],
        match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Please provide a valid time in HH:MM format']
      },
      placeOfBirth: {
        city: {
          type: String,
          required: [true, 'City of birth is required'],
          trim: true
        },
        state: {
          type: String,
          trim: true
        },
        country: {
          type: String,
          required: [true, 'Country of birth is required'],
          trim: true
        },
        coordinates: {
          // GeoJSON Point
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
          },
          coordinates: {
            type: [Number],
            index: '2dsphere'
          }
        }
      },
      gender: {
        type: String,
        enum: {
          values: ['male', 'female', 'other', 'prefer_not_to_say'],
          message: '{VALUE} is not a valid gender'
        },
        required: [true, 'Gender is required for astrological analysis']
      },
      occupation: {
        type: String,
        trim: true
      },
      maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'other'],
        trim: true
      },
      // Additional custom fields that might be required for specific astrological services
      customFields: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        value: {
          type: mongoose.Schema.Types.Mixed,
          required: true
        },
        label: {
          type: String,
          trim: true
        },
        required: {
          type: Boolean,
          default: false
        }
      }]
    },
    
    // Questions or concerns
    questions: [{
      type: String,
      trim: true,
      maxlength: [500, 'Question cannot be more than 500 characters']
    }],
    
    // Session notes (for astrologer)
    notes: [{
      content: {
        type: String,
        required: true,
        trim: true
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      isPrivate: {
        type: Boolean,
        default: true
      }
    }],
    
    // Cancellation details
    cancellation: {
      reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      cancelledAt: {
        type: Date
      },
      refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative']
      },
      refundStatus: {
        type: String,
        enum: {
          values: ['pending', 'processed', 'failed', 'not_eligible'],
          message: '{VALUE} is not a valid refund status'
        }
      },
      refundNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Refund notes cannot be more than 500 characters']
      }
    },
    
    // Reschedule details
    rescheduleHistory: [{
      previousStartTime: {
        type: Date,
        required: true
      },
      previousEndTime: {
        type: Date,
        required: true
      },
      newStartTime: {
        type: Date,
        required: true
      },
      newEndTime: {
        type: Date,
        required: true
      },
      reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reschedule reason cannot be more than 500 characters']
      },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: {
          values: ['requested', 'approved', 'rejected', 'cancelled'],
          message: '{VALUE} is not a valid reschedule status'
        },
        default: 'requested'
      },
      processedAt: {
        type: Date
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Follow-up information
    followUp: {
      scheduled: {
        type: Boolean,
        default: false
      },
      scheduledDate: {
        type: Date
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Follow-up notes cannot be more than 1000 characters']
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date
      },
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    
    // Session completion details
    completedAt: {
      type: Date
    },
    
    duration: {
      actual: {
        type: Number, // in minutes
        min: [0, 'Duration cannot be negative']
      },
      billed: {
        type: Number, // in minutes
        min: [0, 'Billed duration cannot be negative']
      }
    },
    
    // Feedback and rating
    rating: {
      value: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
      },
      review: {
        type: String,
        trim: true,
        maxlength: [2000, 'Review cannot be more than 2000 characters']
      },
      submittedAt: {
        type: Date
      },
      isPublic: {
        type: Boolean,
        default: true
      }
    },
    
    // System fields
    source: {
      type: String,
      enum: ['web', 'mobile_app', 'admin', 'api', 'other'],
      default: 'web'
    },
    
    ipAddress: {
      type: String,
      trim: true
    },
    
    userAgent: {
      type: String,
      trim: true
    },
    
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    
    // Audit Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
      select: false
    },
    
    // Versioning
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
bookingSchema.index({ user: 1, startTime: -1 });
bookingSchema.index({ astrologer: 1, startTime: -1 });
bookingSchema.index({ service: 1, startTime: -1 });
bookingSchema.index({ status: 1, startTime: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ 'userDetails.email': 1 });
bookingSchema.index({ 'userDetails.phone': 1 });
bookingSchema.index({ bookingNumber: 1 }, { unique: true, sparse: true });

// Virtual for duration in minutes
bookingSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    return (this.endTime - this.startTime) / (1000 * 60);
  }
  return null;
});

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date() && 
         ['pending', 'confirmed', 'rescheduled'].includes(this.status);
});

// Virtual for checking if booking is completed
bookingSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || 
         (this.endTime < new Date() && this.status !== 'cancelled' && this.status !== 'rejected');
});

// Virtual for checking if booking is cancelled
bookingSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled' || this.status === 'rejected';
});

// Virtual for checking if booking can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const hoursUntilSession = (this.startTime - now) / (1000 * 60 * 60);
  
  return this.isUpcoming && 
         this.paymentStatus === 'paid' && 
         hoursUntilSession > 1; // Allow cancellation up to 1 hour before session
});

// Virtual for checking if booking can be rescheduled
bookingSchema.virtual('canBeRescheduled').get(function() {
  const now = new Date();
  const hoursUntilSession = (this.startTime - now) / (1000 * 60 * 60);
  
  return this.isUpcoming && 
         this.paymentStatus === 'paid' && 
         hoursUntilSession > 2; // Allow rescheduling up to 2 hours before session
});

// Pre-save hook to generate booking number
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingNumber) {
    // Generate a unique booking number (e.g., AB-20231210-XXXXX)
    const date = new Date();
    const prefix = 'AB';
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
    
    let isUnique = false;
    let attempt = 0;
    const maxAttempts = 5;
    
    while (!isUnique && attempt < maxAttempts) {
      this.bookingNumber = `${prefix}-${dateStr}-${randomStr}`;
      
      // Check if the booking number already exists
      const existing = await this.constructor.findOne({ bookingNumber: this.bookingNumber });
      
      if (!existing) {
        isUnique = true;
      } else {
        attempt++;
      }
    }
    
    if (!isUnique) {
      throw new Error('Failed to generate a unique booking number');
    }
  }
  
  // Ensure endTime is after startTime
  if (this.isModified('startTime') || this.isModified('endTime')) {
    if (this.endTime <= this.startTime) {
      throw new Error('End time must be after start time');
    }
  }
  
  // If this is a reschedule, update the status and add to history
  if (this.isModified('startTime') && !this.isNew) {
    const original = await this.constructor.findById(this._id);
    
    if (original) {
      this.rescheduleHistory = this.rescheduleHistory || [];
      
      this.rescheduleHistory.push({
        previousStartTime: original.startTime,
        previousEndTime: original.endTime,
        newStartTime: this.startTime,
        newEndTime: this.endTime,
        status: 'approved',
        requestedBy: this.updatedBy || this.createdBy,
        processedBy: this.updatedBy || this.createdBy,
        processedAt: new Date(),
        notes: 'Rescheduled by system'
      });
      
      this.status = 'rescheduled';
    }
  }
  
  // If booking is being cancelled, update the slot status if it exists
  if (this.isModified('status') && this.status === 'cancelled' && this.slot) {
    const AstrologySlot = mongoose.model('AstrologySlot');
    await AstrologySlot.findByIdAndUpdate(this.slot, { 
      $set: { 
        status: 'available',
        booking: null,
        $inc: { currentParticipants: -1 }
      } 
    });
  }
  
  next();
});

// Method to cancel the booking
bookingSchema.methods.cancel = async function(reason, cancelledBy) {
  if (this.status === 'cancelled' || this.status === 'rejected') {
    throw new Error('Booking is already cancelled or rejected');
  }
  
  if (this.status === 'completed') {
    throw new Error('Cannot cancel a completed booking');
  }
  
  // Update booking status
  this.status = 'cancelled';
  this.cancellation = {
    reason: reason || 'Cancelled by user',
    cancelledBy: cancelledBy || this.updatedBy || this.createdBy,
    cancelledAt: new Date()
  };
  
  // If payment was made, mark for refund
  if (this.paymentStatus === 'paid') {
    this.paymentStatus = 'refund_pending';
    this.cancellation.refundStatus = 'pending';
    this.cancellation.refundAmount = this.totalAmount; // Full refund by default
  }
  
  await this.save();
  
  // Free up the slot if it exists
  if (this.slot) {
    const AstrologySlot = mongoose.model('AstrologySlot');
    await AstrologySlot.findByIdAndUpdate(this.slot, { 
      $set: { 
        status: 'available',
        booking: null,
        $inc: { currentParticipants: -1 }
      } 
    });
  }
  
  return this;
};

// Method to reschedule the booking
bookingSchema.methods.reschedule = async function(newStartTime, newEndTime, reason, requestedBy) {
  if (!this.canBeRescheduled) {
    throw new Error('This booking cannot be rescheduled');
  }
  
  // Validate new times
  const now = new Date();
  if (newStartTime < now) {
    throw new Error('Cannot reschedule to a past time');
  }
  
  if (newEndTime <= newStartTime) {
    throw new Error('End time must be after start time');
  }
  
  // Add to reschedule history
  this.rescheduleHistory = this.rescheduleHistory || [];
  
  this.rescheduleHistory.push({
    previousStartTime: this.startTime,
    previousEndTime: this.endTime,
    newStartTime,
    newEndTime,
    reason: reason || 'Rescheduled by user',
    requestedBy: requestedBy || this.updatedBy || this.createdBy,
    status: 'requested',
    createdAt: new Date()
  });
  
  // Update booking status
  this.status = 'rescheduled';
  
  await this.save();
  
  return this;
};

// Method to approve a reschedule request
bookingSchema.methods.approveReschedule = async function(rescheduleId, approvedBy, notes = '') {
  if (!this.rescheduleHistory || this.rescheduleHistory.length === 0) {
    throw new Error('No reschedule requests found');
  }
  
  // Find the reschedule request
  const request = this.rescheduleHistory.id(rescheduleId);
  
  if (!request) {
    throw new Error('Reschedule request not found');
  }
  
  if (request.status !== 'requested') {
    throw new Error('This reschedule request has already been processed');
  }
  
  // Update the request
  request.status = 'approved';
  request.processedBy = approvedBy;
  request.processedAt = new Date();
  request.notes = notes;
  
  // Update the booking times
  this.startTime = request.newStartTime;
  this.endTime = request.newEndTime;
  
  // If this was a slot-based booking, update the slot
  if (this.slot) {
    const AstrologySlot = mongoose.model('AstrologySlot');
    
    // Find an available slot for the new time
    const newSlot = await AstrologySlot.findOne({
      astrologer: this.astrologer,
      startTime: request.newStartTime,
      endTime: request.newEndTime,
      status: 'available',
      $or: [
        { service: this.service },
        { service: { $exists: false } }
      ]
    });
    
    if (!newSlot) {
      throw new Error('No available slot found for the requested time');
    }
    
    // Free up the old slot
    await AstrologySlot.findByIdAndUpdate(this.slot, { 
      $set: { 
        status: 'available',
        booking: null,
        $inc: { currentParticipants: -1 }
      } 
    });
    
    // Book the new slot
    newSlot.status = 'booked';
    newSlot.booking = this._id;
    newSlot.currentParticipants += 1;
    await newSlot.save();
    
    // Update the booking with the new slot
    this.slot = newSlot._id;
  }
  
  await this.save();
  
  return this;
};

// Method to reject a reschedule request
bookingSchema.methods.rejectReschedule = function(rescheduleId, rejectedBy, reason = '') {
  if (!this.rescheduleHistory || this.rescheduleHistory.length === 0) {
    throw new Error('No reschedule requests found');
  }
  
  // Find the reschedule request
  const request = this.rescheduleHistory.id(rescheduleId);
  
  if (!request) {
    throw new Error('Reschedule request not found');
  }
  
  if (request.status !== 'requested') {
    throw new Error('This reschedule request has already been processed');
  }
  
  // Update the request
  request.status = 'rejected';
  request.processedBy = rejectedBy;
  request.processedAt = new Date();
  request.notes = reason || 'Reschedule request was rejected';
  
  // Save the changes
  return this.save();
};

// Method to add a note to the booking
bookingSchema.methods.addNote = function(content, userId, isPrivate = true) {
  this.notes = this.notes || [];
  
  this.notes.push({
    content,
    createdBy: userId,
    isPrivate
  });
  
  return this.save();
};

// Method to add a rating and review
bookingSchema.methods.addRating = async function(rating, review, isPublic = true) {
  if (this.status !== 'completed') {
    throw new Error('Cannot rate a booking that is not completed');
  }
  
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Update the booking with the rating
  this.rating = {
    value: rating,
    review: review || '',
    submittedAt: new Date(),
    isPublic: !!isPublic
  };
  
  await this.save();
  
  // Update the astrologer's rating
  const Astrologer = mongoose.model('Astrologer');
  const astrologer = await Astrologer.findById(this.astrologer);
  
  if (astrologer) {
    await astrologer.updateRating(rating);
  }
  
  return this;
};

// Static method to get booking statistics
bookingSchema.statics.getStats = async function(astrologerId = null, startDate = null, endDate = null) {
  const match = {};
  
  if (astrologerId) {
    match.astrologer = mongoose.Types.ObjectId(astrologerId);
  }
  
  if (startDate || endDate) {
    match.startTime = {};
    
    if (startDate) {
      match.startTime.$gte = new Date(startDate);
    }
    
    if (endDate) {
      match.startTime.$lte = new Date(endDate);
    }
  }
  
  const stats = await this.aggregate([
    {
      $match: match
    },
    {
      $group: {
        _id: {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' },
          status: '$status'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgRating: { $avg: '$rating.value' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.status': 1 }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month'
        },
        totalBookings: { $sum: '$count' },
        totalRevenue: { $sum: '$totalRevenue' },
        byStatus: {
          $push: {
            status: '$_id.status',
            count: '$count',
            revenue: '$totalRevenue'
          }
        },
        avgRating: { $avg: '$avgRating' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  return stats;
};

// Pre-find hooks to exclude inactive bookings
bookingSchema.pre(/^find/, function(next) {
  if (this.getFilter().isActive === undefined) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

const AstrologyBooking = mongoose.model('AstrologyBooking', bookingSchema);

export default AstrologyBooking;
