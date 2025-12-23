import mongoose from 'mongoose';

const astrologerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    
    // Basic Information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    
    // Professional Information
    specialization: [{
      type: String,
      required: [true, 'At least one specialization is required'],
      enum: {
        values: [
          'Vedic Astrology',
          'Numerology',
          'Palmistry',
          'Vastu Shastra',
          'Tarot Reading',
          'Birth Chart Analysis',
          'Muhurta',
          'Nadi Astrology',
          'KP Astrology',
          'Lal Kitab',
          'Prasna',
          'Remedial Astrology',
          'Horary Astrology',
          'Medical Astrology',
          'Mundane Astrology',
          'Electional Astrology',
          'Financial Astrology',
          'Relationship Astrology',
          'Career Astrology',
          'Spiritual Astrology'
        ],
        message: '{VALUE} is not a valid specialization'
      }
    }],
    
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [100, 'Experience seems too high']
    },
    
    languages: [{
      type: String,
      required: [true, 'At least one language is required'],
      trim: true
    }],
    
    // Profile Information
    bio: {
      type: String,
      maxlength: [2000, 'Bio cannot be more than 2000 characters'],
      trim: true
    },
    
    imageUrl: {
      type: String,
      match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
      trim: true
    },
    
    // Contact Information
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9\-\+]{8,15}$/, 'Please enter a valid phone number']
    },
    
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      lowercase: true,
      trim: true
    },
    
    // Availability
    isAvailable: {
      type: Boolean,
      default: true
    },
    
    workingHours: {
      monday: { 
        available: { type: Boolean, default: true },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      tuesday: { 
        available: { type: Boolean, default: true },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      wednesday: { 
        available: { type: Boolean, default: true },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      thursday: { 
        available: { type: Boolean, default: true },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      friday: { 
        available: { type: Boolean, default: true },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      saturday: { 
        available: { type: Boolean, default: false },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      sunday: { 
        available: { type: Boolean, default: false },
        slots: [{ 
          start: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
          end: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
        }]
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
        enum: Intl.supportedValuesOf('timeZone')
      }
    },
    
    // Session Settings
    sessionDuration: {
      type: Number,
      default: 30, // minutes
      min: [15, 'Minimum session duration is 15 minutes'],
      max: [120, 'Maximum session duration is 120 minutes']
    },
    
    bufferTime: {
      type: Number,
      default: 15, // minutes
      min: [0, 'Buffer time cannot be negative'],
      max: [60, 'Maximum buffer time is 60 minutes']
    },
    
    // Ratings and Reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative']
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    
    // Social Media and Links
    socialMedia: {
      website: {
        type: String,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
        trim: true
      },
      youtube: {
        type: String,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
        trim: true
      },
      facebook: {
        type: String,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
        trim: true
      },
      instagram: {
        type: String,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
        trim: true
      },
      twitter: {
        type: String,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
        trim: true
      },
      linkedin: {
        type: String,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
        trim: true
      }
    },
    
    // Verification and Approval
    isVerified: {
      type: Boolean,
      default: false
    },
    
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    // Additional Information
    documents: [{
      type: {
        type: String,
        enum: ['id_proof', 'certification', 'other'],
        required: true
      },
      url: {
        type: String,
        required: true,
        match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS']
      },
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    
    // Metadata
    metadata: {
      type: Map,
      of: String
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'inactive'],
      default: 'pending'
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
astrologerSchema.index({ name: 'text', specialization: 'text', bio: 'text' });
astrologerSchema.index({ rating: -1 });
astrologerSchema.index({ experience: -1 });
astrologerSchema.index({ isVerified: 1 });
astrologerSchema.index({ isFeatured: 1 });

// Virtual for upcoming sessions
astrologerSchema.virtual('upcomingSessions', {
  ref: 'AstrologyBooking',
  localField: '_id',
  foreignField: 'astrologer',
  match: { 
    status: { $in: ['scheduled', 'confirmed'] },
    startTime: { $gte: new Date() }
  },
  options: { sort: { startTime: 1 } }
});

// Virtual for past sessions
astrologerSchema.virtual('pastSessions', {
  ref: 'AstrologyBooking',
  localField: '_id',
  foreignField: 'astrologer',
  match: { 
    status: { $in: ['completed', 'cancelled'] },
    endTime: { $lt: new Date() }
  },
  options: { sort: { startTime: -1 } }
});

// Method to check availability for a time slot
astrologerSchema.methods.isAvailableForSlot = async function(startTime, endTime, excludeBookingId = null) {
  // Check if astrologer is available
  if (!this.isAvailable || this.status !== 'active') {
    return { available: false, reason: 'Astrologer is not available' };
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Check if the time slot is in the past
  if (start < new Date()) {
    return { available: false, reason: 'Cannot book a slot in the past' };
  }
  
  // Check if the session duration is valid
  const sessionDuration = (end - start) / (1000 * 60); // in minutes
  if (sessionDuration <= 0 || sessionDuration > 120) {
    return { available: false, reason: 'Invalid session duration' };
  }
  
  // Check day of week
  const dayOfWeek = start.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const workingDay = this.workingHours[dayOfWeek];
  
  if (!workingDay || !workingDay.available) {
    return { available: false, reason: 'Astrologer is not available on this day' };
  }
  
  // Check if the time slot is within working hours
  const startHour = start.getHours();
  const startMinute = start.getMinutes();
  const endHour = end.getHours();
  const endMinute = end.getMinutes();
  
  const isWithinWorkingHours = workingDay.slots.some(slot => {
    const [slotStartHour, slotStartMinute] = slot.start.split(':').map(Number);
    const [slotEndHour, slotEndMinute] = slot.end.split(':').map(Number);
    
    const slotStartTime = new Date(start);
    slotStartTime.setHours(slotStartHour, slotStartMinute, 0, 0);
    
    const slotEndTime = new Date(start);
    slotEndTime.setHours(slotEndHour, slotEndMinute, 0, 0);
    
    return start >= slotStartTime && end <= slotEndTime;
  });
  
  if (!isWithinWorkingHours) {
    return { available: false, reason: 'Time slot is outside working hours' };
  }
  
  // Check for conflicting bookings
  const AstrologyBooking = mongoose.model('AstrologyBooking');
  
  const query = {
    astrologer: this._id,
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      // New booking starts during existing booking
      {
        startTime: { $lt: end },
        endTime: { $gt: start }
      },
      // New booking ends during existing booking
      {
        startTime: { $lt: end },
        endTime: { $gt: start }
      },
      // New booking completely contains existing booking
      {
        startTime: { $gte: start },
        endTime: { $lte: end }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictingBookings = await AstrologyBooking.find(query);
  
  if (conflictingBookings.length > 0) {
    return { 
      available: false, 
      reason: 'Time slot is already booked',
      conflictingBookings
    };
  }
  
  return { available: true };
};

// Method to get available time slots for a date range
astrologerSchema.methods.getAvailableSlots = async function(startDate, endDate, duration = 30) {
  const slots = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  
  // Validate duration
  if (duration < 15 || duration > 120) {
    throw new Error('Duration must be between 15 and 120 minutes');
  }
  
  // Convert duration to milliseconds
  const durationMs = duration * 60 * 1000;
  
  // Get all bookings for the date range
  const AstrologyBooking = mongoose.model('AstrologyBooking');
  const bookings = await AstrologyBooking.find({
    astrologer: this._id,
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      { startTime: { $gte: startDate, $lt: endDate } },
      { endTime: { $gt: startDate, $lte: endDate } },
      { 
        startTime: { $lte: startDate },
        endTime: { $gte: endDate }
      }
    ]
  }).sort({ startTime: 1 });
  
  // Group bookings by date
  const bookingsByDate = {};
  bookings.forEach(booking => {
    const dateStr = booking.startTime.toISOString().split('T')[0];
    if (!bookingsByDate[dateStr]) {
      bookingsByDate[dateStr] = [];
    }
    bookingsByDate[dateStr].push(booking);
  });
  
  // Generate available slots for each day in the range
  while (currentDate <= lastDate) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingDay = this.workingHours[dayOfWeek];
    
    if (workingDay && workingDay.available) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = bookingsByDate[dateStr] || [];
      
      // For each time slot in the working day
      for (const slot of workingDay.slots) {
        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);
        
        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);
        
        // Generate slots of the requested duration
        let currentSlotStart = new Date(slotStart);
        
        while (currentSlotStart.getTime() + durationMs <= slotEnd.getTime()) {
          const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMs);
          
          // Check if the slot is available (no overlapping bookings)
          const isAvailable = !dayBookings.some(booking => {
            return (
              (currentSlotStart >= booking.startTime && currentSlotStart < booking.endTime) ||
              (currentSlotEnd > booking.startTime && currentSlotEnd <= booking.endTime) ||
              (currentSlotStart <= booking.startTime && currentSlotEnd >= booking.endTime)
            );
          });
          
          // Add buffer time between slots
          const nextSlotStart = new Date(currentSlotStart.getTime() + durationMs + (this.bufferTime * 60 * 1000));
          
          if (isAvailable) {
            slots.push({
              start: new Date(currentSlotStart),
              end: new Date(currentSlotEnd),
              duration: duration
            });
          }
          
          currentSlotStart = nextSlotStart;
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }
  
  return slots;
};

// Method to update rating when a new review is added
astrologerSchema.methods.updateRating = async function(newRating) {
  // Get all reviews for this astrologer
  const AstrologyReview = mongoose.model('AstrologyReview');
  const reviews = await AstrologyReview.find({ astrologer: this._id });
  
  // Calculate new average and distribution
  const totalRatings = reviews.length;
  const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
  
  // Update rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    distribution[review.rating]++;
  });
  
  // Update the astrologer's rating
  this.rating = {
    average: parseFloat(averageRating.toFixed(1)),
    count: totalRatings,
    distribution
  };
  
  await this.save();
  return this.rating;
};

// Pre-save hook to update timestamps
astrologerSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.isVerified) {
    this.isVerified = true;
  }
  
  if (this.isModified('documents')) {
    // Update document verification status if all required documents are uploaded and verified
    const requiredDocs = ['id_proof', 'certification'];
    const verifiedDocs = this.documents
      .filter(doc => doc.verified)
      .map(doc => doc.type);
    
    const hasAllRequiredDocs = requiredDocs.every(doc => verifiedDocs.includes(doc));
    
    if (hasAllRequiredDocs && this.status === 'pending') {
      this.status = 'active';
      this.isVerified = true;
    }
  }
  
  next();
});

const Astrologer = mongoose.model('Astrologer', astrologerSchema);

export default Astrologer;