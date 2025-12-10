import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String, // Format: 'HH:MM' in 24-hour format
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String, // Format: 'HH:MM' in 24-hour format
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format'],
    validate: {
      validator: function(value) {
        // Convert start and end times to minutes for comparison
        const [startH, startM] = this.startTime.split(':').map(Number);
        const [endH, endM] = value.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        return endMinutes > startMinutes;
      },
      message: 'End time must be after start time'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Reason cannot be more than 200 characters']
  }
}, { _id: false });

const dailyAvailabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Reason cannot be more than 200 characters']
  },
  timeSlots: [timeSlotSchema],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  },
  recurringEndDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!this.recurringPattern) return true; // Not required if not recurring
        return value > this.date;
      },
      message: 'Recurring end date must be after the start date'
    }
  },
  excludeDates: [{
    type: Date
  }]
}, { _id: false });

const priestAvailabilitySchema = new mongoose.Schema({
  priest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Priest',
    required: [true, 'Priest reference is required'],
    index: true
  },
  defaultAvailability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' }
      }]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' }
      }]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' }
      }]
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' }
      }]
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' }
      }]
    },
    saturday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' }
      }]
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '13:00' }
      }]
    },
    breakTime: {
      startTime: { type: String, default: '13:00' },
      endTime: { type: String, default: '14:00' }
    }
  },
  customAvailability: [dailyAvailabilitySchema],
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
    enum: Intl.supportedValuesOf('timeZone')
  },
  bufferTime: {
    type: Number, // in minutes
    default: 15,
    min: 0,
    max: 120
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
priestAvailabilitySchema.index({ priest: 1, 'customAvailability.date': 1 });

// Method to check priest availability for a specific time slot
priestAvailabilitySchema.methods.checkAvailability = async function(date, startTime, endTime, excludeBookingId = null) {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if there's a custom availability for this date
  const customAvailability = this.customAvailability.find(avail => {
    const availDate = new Date(avail.date);
    return availDate.toDateString() === dateObj.toDateString();
  });

  // If there's custom availability for this date
  if (customAvailability) {
    if (!customAvailability.isAvailable) {
      return { available: false, reason: customAvailability.reason || 'Not available on this date' };
    }

    // Check if the requested time slot is within any of the available time slots
    const isInTimeSlot = customAvailability.timeSlots.some(slot => {
      if (!slot.isAvailable) return false;
      
      const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number);
      const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const slotStart = slotStartH * 60 + slotStartM;
      const slotEnd = slotEndH * 60 + slotEndM;
      const requestedStart = startH * 60 + startM;
      const requestedEnd = endH * 60 + endM;
      
      return requestedStart >= slotStart && requestedEnd <= slotEnd;
    });

    if (!isInTimeSlot) {
      return { available: false, reason: 'Not available during the requested time slot' };
    }
  } else {
    // Use default availability for this day of the week
    const dayAvailability = this.defaultAvailability[dayOfWeek];
    
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return { available: false, reason: `Not available on ${dayOfWeek}s` };
    }

    // Check if the requested time slot is within any of the default time slots
    const isInTimeSlot = dayAvailability.timeSlots.some(slot => {
      const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number);
      const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const slotStart = slotStartH * 60 + slotStartM;
      const slotEnd = slotEndH * 60 + slotEndM;
      const requestedStart = startH * 60 + startM;
      const requestedEnd = endH * 60 + endM;
      
      return requestedStart >= slotStart && requestedEnd <= slotEnd;
    });

    if (!isInTimeSlot) {
      return { 
        available: false, 
        reason: `Available time slots: ${dayAvailability.timeSlots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}` 
      };
    }
  }

  // Check for any existing bookings that overlap with the requested time slot
  const query = {
    priest: this.priest,
    status: { $in: ['confirmed', 'in-progress'] },
    bookingDate: {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lt: new Date(dateObj.setHours(23, 59, 59, 999))
    },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      { startTime: { $gte: startTime, $lt: endTime } },
      { endTime: { $gt: startTime, $lte: endTime } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await mongoose.model('Booking').find(query);
  
  if (existingBookings.length > 0) {
    return { 
      available: false, 
      reason: 'Time slot already booked',
      conflictingBookings: existingBookings
    };
  }

  return { available: true };
};

// Method to get available time slots for a specific date
priestAvailabilitySchema.methods.getAvailableSlots = async function(date, duration = 60) {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check for custom availability first
  const customAvailability = this.customAvailability.find(avail => {
    const availDate = new Date(avail.date);
    return availDate.toDateString() === dateObj.toDateString();
  });

  let timeSlots = [];
  
  if (customAvailability) {
    if (!customAvailability.isAvailable) {
      return [];
    }
    timeSlots = customAvailability.timeSlots.filter(slot => slot.isAvailable);
  } else {
    const dayAvailability = this.defaultAvailability[dayOfWeek];
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return [];
    }
    timeSlots = dayAvailability.timeSlots;
  }

  // Generate slots based on duration and buffer time
  const slots = [];
  const bufferMinutes = this.bufferTime || 0;
  
  for (const slot of timeSlots) {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    
    let currentTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    
    while (currentTime + duration <= endTime) {
      const slotStartH = Math.floor((currentTime) / 60);
      const slotStartM = (currentTime) % 60;
      const slotEndH = Math.floor((currentTime + duration) / 60);
      const slotEndM = (currentTime + duration) % 60;
      
      const slotStart = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
      const slotEnd = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;
      
      // Check if this slot is available
      const isAvailable = await this.checkAvailability(
        dateObj,
        slotStart,
        slotEnd
      );
      
      if (isAvailable.available) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          duration: duration
        });
      }
      
      // Move to next slot with buffer time
      currentTime += duration + bufferMinutes;
    }
  }
  
  return slots;
};

// Method to set custom availability
priestAvailabilitySchema.methods.setCustomAvailability = async function(date, timeSlots, isAvailable = true, reason = '') {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  
  // Find existing custom availability for this date
  const existingIndex = this.customAvailability.findIndex(avail => {
    const availDate = new Date(avail.date);
    return availDate.toDateString() === dateObj.toDateString();
  });
  
  const customAvailability = {
    date: dateObj,
    isAvailable,
    reason: isAvailable ? '' : reason,
    timeSlots: isAvailable ? timeSlots : []
  };
  
  if (existingIndex >= 0) {
    this.customAvailability[existingIndex] = customAvailability;
  } else {
    this.customAvailability.push(customAvailability);
  }
  
  this.lastSynced = Date.now();
  return this.save();
};

// Method to set default availability for a day of the week
priestAvailabilitySchema.methods.setDefaultAvailability = function(dayOfWeek, timeSlots, isAvailable = true) {
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  if (!validDays.includes(dayOfWeek.toLowerCase())) {
    throw new Error('Invalid day of week');
  }
  
  this.defaultAvailability[dayOfWeek] = {
    isAvailable,
    timeSlots: isAvailable ? timeSlots : []
  };
  
  this.lastSynced = Date.now();
  return this.save();
};

// Method to set break time
priestAvailabilitySchema.methods.setBreakTime = function(breakTime) {
  this.defaultAvailability.breakTime = breakTime;
  this.lastSynced = Date.now();
  return this.save();
};

// Pre-save hook to clean up old custom availability
priestAvailabilitySchema.pre('save', function(next) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  this.customAvailability = this.customAvailability.filter(avail => {
    return new Date(avail.date) >= thirtyDaysAgo;
  });
  
  next();
});

const PriestAvailability = mongoose.model('PriestAvailability', priestAvailabilitySchema);

export default PriestAvailability;
