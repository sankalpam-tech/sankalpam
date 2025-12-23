import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    // Reference to the astrologer
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: [true, 'Astrologer reference is required'],
      index: true
    },
    
    // Reference to the service (optional, if slot is specific to a service)
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AstrologyService',
      index: true
    },
    
    // Slot timing
    date: {
      type: Date,
      required: [true, 'Slot date is required'],
      index: true
    },
    
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
    
    // Slot status
    status: {
      type: String,
      enum: {
        values: ['available', 'booked', 'reserved', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'available',
      index: true
    },
    
    // Booking reference (if slot is booked)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AstrologyBooking',
      index: true
    },
    
    // Recurring slot settings (if applicable)
    isRecurring: {
      type: Boolean,
      default: false
    },
    
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
        required: function() {
          return this.isRecurring === true;
        }
      },
      daysOfWeek: [{
        type: Number, // 0-6 (Sunday-Saturday)
        min: 0,
        max: 6
      }],
      endDate: {
        type: Date,
        required: function() {
          return this.isRecurring === true;
        }
      },
      excludeDates: [{
        type: Date
      }]
    },
    
    // Slot settings
    isPrivate: {
      type: Boolean,
      default: false
    },
    
    maxParticipants: {
      type: Number,
      default: 1,
      min: [1, 'Maximum participants must be at least 1'],
      max: [100, 'Maximum participants cannot exceed 100']
    },
    
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative']
    },
    
    // Pricing (can override service pricing)
    price: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    
    // Timezone
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      enum: Intl.supportedValuesOf('timeZone')
    },
    
    // Metadata
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters']
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
slotSchema.index({ startTime: 1, endTime: 1 });
slotSchema.index({ status: 1, startTime: 1 });
slotSchema.index({ astrologer: 1, startTime: 1 });
slotSchema.index({ astrologer: 1, date: 1 });
slotSchema.index({ 'recurringPattern.endDate': 1 });

// Virtual for duration in minutes
slotSchema.virtual('duration').get(function() {
  return (this.endTime - this.startTime) / (1000 * 60);
});

// Virtual for checking if slot is in the past
slotSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

// Virtual for checking if slot is available
slotSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && 
         !this.isPast && 
         this.currentParticipants < this.maxParticipants;
});

// Virtual for booking (if any)
slotSchema.virtual('bookingDetails', {
  ref: 'AstrologyBooking',
  localField: 'booking',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to set date from startTime
slotSchema.pre('save', function(next) {
  if (this.isModified('startTime') || !this.date) {
    this.date = new Date(
      this.startTime.getFullYear(),
      this.startTime.getMonth(),
      this.startTime.getDate()
    );
  }
  
  // Ensure endTime is after startTime
  if (this.isModified('startTime') || this.isModified('endTime')) {
    if (this.endTime <= this.startTime) {
      throw new Error('End time must be after start time');
    }
  }
  
  // If this is a recurring slot, ensure required fields are present
  if (this.isRecurring) {
    if (!this.recurringPattern || 
        !this.recurringPattern.frequency || 
        !this.recurringPattern.endDate) {
      throw new Error('Recurring slots require frequency and end date');
    }
    
    // Set default days of week for weekly patterns
    if (this.recurringPattern.frequency === 'weekly' && 
        (!this.recurringPattern.daysOfWeek || this.recurringPattern.daysOfWeek.length === 0)) {
      // Default to the same day of the week as the start time
      this.recurringPattern.daysOfWeek = [this.startTime.getDay()];
    }
  }
  
  next();
});

// Method to check if slot is available for booking
slotSchema.methods.canBook = function(participants = 1) {
  return (
    this.status === 'available' && 
    !this.isPast && 
    (this.currentParticipants + participants) <= this.maxParticipants
  );
};

// Method to book the slot
slotSchema.methods.book = async function(bookingId, participants = 1) {
  if (!this.canBook(participants)) {
    throw new Error('Slot is not available for booking');
  }
  
  this.status = 'booked';
  this.booking = bookingId;
  this.currentParticipants += participants;
  
  await this.save();
  return this;
};

// Method to cancel booking
slotSchema.methods.cancelBooking = async function() {
  if (this.status !== 'booked' || !this.booking) {
    throw new Error('No active booking to cancel');
  }
  
  this.status = 'available';
  this.currentParticipants = Math.max(0, this.currentParticipants - 1);
  this.booking = undefined;
  
  await this.save();
  return this;
};

// Static method to find available slots for an astrologer
slotSchema.statics.findAvailableSlots = async function({
  astrologerId,
  serviceId,
  startDate,
  endDate,
  duration,
  timezone = 'Asia/Kolkata'
}) {
  // Validate input
  if (!astrologerId) {
    throw new Error('Astrologer ID is required');
  }
  
  // Set default date range if not provided
  const now = new Date();
  const defaultStartDate = new Date(now);
  defaultStartDate.setHours(0, 0, 0, 0);
  
  const defaultEndDate = new Date(defaultStartDate);
  defaultEndDate.setDate(defaultStartDate.getDate() + 30); // Default to next 30 days
  
  const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
  const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;
  
  // Build the query
  const query = {
    astrologer: astrologerId,
    status: 'available',
    startTime: { $gte: queryStartDate },
    endTime: { $lte: queryEndDate },
    $expr: { $gt: ['$maxParticipants', '$currentParticipants'] } // Available capacity
  };
  
  // Add service filter if provided
  if (serviceId) {
    query.$or = [
      { service: serviceId },
      { service: { $exists: false } } // Slots not specific to any service
    ];
  }
  
  // Add duration filter if provided
  if (duration) {
    const durationMs = duration * 60 * 1000; // Convert minutes to milliseconds
    query.$expr = {
      $and: [
        query.$expr, // Keep existing conditions
        { $gte: [{ $subtract: ['$endTime', '$startTime'] }, durationMs] }
      ]
    };
  }
  
  // Find and return available slots
  const slots = await this.find(query)
    .sort({ startTime: 1 })
    .lean();
  
  return slots;
};

// Static method to generate recurring slots
slotSchema.statics.generateRecurringSlots = async function({
  astrologerId,
  serviceId,
  startTime,
  endTime,
  timezone = 'Asia/Kolkata',
  recurringPattern,
  createdBy
}) {
  // Validate input
  if (!astrologerId || !startTime || !endTime || !recurringPattern) {
    throw new Error('Missing required fields for generating recurring slots');
  }
  
  const startDate = new Date(startTime);
  const endDate = new Date(recurringPattern.endDate);
  const slots = [];
  
  // Generate slots based on recurrence pattern
  if (recurringPattern.frequency === 'daily') {
    // Generate daily slots
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip excluded dates
      if (recurringPattern.excludeDates && 
          recurringPattern.excludeDates.some(d => d.toDateString() === date.toDateString())) {
        continue;
      }
      
      const slotStart = new Date(date);
      slotStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
      
      slots.push({
        astrologer: astrologerId,
        service: serviceId,
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
        isRecurring: true,
        recurringPattern: {
          frequency: 'daily',
          endDate: endDate,
          excludeDates: recurringPattern.excludeDates || []
        },
        timezone,
        createdBy,
        updatedBy: createdBy
      });
    }
  } else if (recurringPattern.frequency === 'weekly') {
    // Generate weekly slots
    const daysOfWeek = recurringPattern.daysOfWeek || [startDate.getDay()];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip excluded dates
      if (recurringPattern.excludeDates && 
          recurringPattern.excludeDates.some(d => d.toDateString() === date.toDateString())) {
        continue;
      }
      
      // Only create slots for specified days of the week
      if (daysOfWeek.includes(date.getDay())) {
        const slotStart = new Date(date);
        slotStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
        
        const slotEnd = new Date(date);
        slotEnd.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
        
        slots.push({
          astrologer: astrologerId,
          service: serviceId,
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
          isRecurring: true,
          recurringPattern: {
            frequency: 'weekly',
            daysOfWeek: daysOfWeek,
            endDate: endDate,
            excludeDates: recurringPattern.excludeDates || []
          },
          timezone,
          createdBy,
          updatedBy: createdBy
        });
      }
    }
  } else if (recurringPattern.frequency === 'bi-weekly') {
    // Generate bi-weekly slots (every 2 weeks)
    const daysOfWeek = recurringPattern.daysOfWeek || [startDate.getDay()];
    let weekCount = 0;
    let currentWeek = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip excluded dates
      if (recurringPattern.excludeDates && 
          recurringPattern.excludeDates.some(d => d.toDateString() === date.toDateString())) {
        continue;
      }
      
      // Check if this is the correct week (every 2 weeks)
      const week = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (week % 2 !== 0) {
        continue;
      }
      
      // Only create slots for specified days of the week
      if (daysOfWeek.includes(date.getDay())) {
        const slotStart = new Date(date);
        slotStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
        
        const slotEnd = new Date(date);
        slotEnd.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
        
        slots.push({
          astrologer: astrologerId,
          service: serviceId,
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
          isRecurring: true,
          recurringPattern: {
            frequency: 'bi-weekly',
            daysOfWeek: daysOfWeek,
            endDate: endDate,
            excludeDates: recurringPattern.excludeDates || []
          },
          timezone,
          createdBy,
          updatedBy: createdBy
        });
      }
    }
  } else if (recurringPattern.frequency === 'monthly') {
    // Generate monthly slots (same day of the month)
    const dayOfMonth = startDate.getDate();
    
    for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
      // Adjust for months with fewer days
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
      
      date.setDate(targetDay);
      
      // Skip if we've gone past the end date
      if (date > endDate) {
        break;
      }
      
      // Skip excluded dates
      if (recurringPattern.excludeDates && 
          recurringPattern.excludeDates.some(d => d.toDateString() === date.toDateString())) {
        continue;
      }
      
      const slotStart = new Date(date);
      slotStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
      
      slots.push({
        astrologer: astrologerId,
        service: serviceId,
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
        isRecurring: true,
        recurringPattern: {
          frequency: 'monthly',
          endDate: endDate,
          excludeDates: recurringPattern.excludeDates || []
        },
        timezone,
        createdBy,
        updatedBy: createdBy
      });
    }
  }
  
  // Save all generated slots
  if (slots.length > 0) {
    return await this.insertMany(slots);
  }
  
  return [];
};

// Pre-find hooks to exclude inactive slots
slotSchema.pre(/^find/, function(next) {
  if (this.getFilter().isActive === undefined) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

const AstrologySlot = mongoose.model('AstrologySlot', slotSchema);

export default AstrologySlot;
