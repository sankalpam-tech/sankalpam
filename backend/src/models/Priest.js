import mongoose from 'mongoose';

const priestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: [100, 'Specialization cannot be more than 100 characters']
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  languages: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: [{
    type: String, // URLs to uploaded documents
  }],
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puja'
  }],
  workingHours: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
  },
  breakTime: {
    startTime: { type: String, default: '13:00' },
    endTime: { type: String, default: '14:00' },
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting upcoming bookings
priestSchema.virtual('upcomingBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'priest',
  match: { 
    status: { $in: ['confirmed', 'in-progress'] },
    bookingDate: { $gte: new Date() }
  },
  options: { sort: { bookingDate: 1 } }
});

// Virtual for getting past bookings
priestSchema.virtual('pastBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'priest',
  match: { 
    status: 'completed',
    bookingDate: { $lt: new Date() }
  },
  options: { sort: { bookingDate: -1 } }
});

// Calculate average rating when a booking is completed
priestSchema.statics.calculateAverageRating = async function(priestId) {
  const stats = await this.model('Booking').aggregate([
    {
      $match: { 
        priest: priestId, 
        status: 'completed',
        rating: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$priest',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(priestId, {
      rating: parseFloat(stats[0].avgRating.toFixed(1)),
      ratingCount: stats[0].nRating
    });
  } else {
    await this.findByIdAndUpdate(priestId, {
      rating: 0,
      ratingCount: 0
    });
  }
};

// Check priest availability for a time slot
priestSchema.methods.isAvailableForSlot = async function(date, startTime, endTime, excludeBookingId = null) {
  // Check if priest is marked as available
  if (!this.isAvailable) return false;

  // Parse the date and times
  const bookingDate = new Date(date);
  const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  // Check if priest works on this day
  if (!this.workingHours[dayOfWeek]) return false;

  // Check if time is within working hours
  const [workStartHour, workStartMinute] = this.workingHours.startTime.split(':').map(Number);
  const [workEndHour, workEndMinute] = this.workingHours.endTime.split(':').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const workStart = workStartHour * 60 + workStartMinute;
  const workEnd = workEndHour * 60 + workEndMinute;
  const slotStart = startHour * 60 + startMinute;
  const slotEnd = endHour * 60 + endMinute;

  if (slotStart < workStart || slotEnd > workEnd) return false;

  // Check break time
  const [breakStartHour, breakStartMinute] = this.breakTime.startTime.split(':').map(Number);
  const [breakEndHour, breakEndMinute] = this.breakTime.endTime.split(':').map(Number);
  const breakStart = breakStartHour * 60 + breakStartMinute;
  const breakEnd = breakEndHour * 60 + breakEndMinute;

  if ((slotStart >= breakStart && slotStart < breakEnd) || 
      (slotEnd > breakStart && slotEnd <= breakEnd)) {
    return false;
  }

  // Check for overlapping bookings
  const query = {
    priest: this._id,
    status: { $in: ['confirmed', 'in-progress'] },
    bookingDate: {
      $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
      $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
    },
    $or: [
      // New booking starts during existing booking
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
      // New booking ends during existing booking
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
      // New booking completely contains existing booking
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime },
      },
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await this.model('Booking').find(query);
  return existingBookings.length === 0;
};

// Find available priests for a time slot
priestSchema.statics.findAvailablePriests = async function(date, startTime, endTime, pujaId = null, excludeBookingId = null) {
  const query = {
    isAvailable: true,
    isActive: true,
    isVerified: true
  };

  // If pujaId is provided, only find priests who can perform this puja
  if (pujaId) {
    query.services = pujaId;
  }

  const priests = await this.find(query);
  
  const availablePriests = [];
  
  for (const priest of priests) {
    const isAvailable = await priest.isAvailableForSlot(date, startTime, endTime, excludeBookingId);
    if (isAvailable) {
      availablePriests.push(priest);
    }
  }

  // Sort by rating (highest first)
  return availablePriests.sort((a, b) => b.rating - a.rating);
};

// Auto-assign priest to a booking
priestSchema.statics.autoAssignPriest = async function(booking) {
  const { bookingDate, startTime, endTime, puja } = booking;
  
  // Find available priests for this time slot and puja
  const availablePriests = await this.findAvailablePriests(
    bookingDate, 
    startTime, 
    endTime, 
    puja,
    booking._id
  );

  if (availablePriests.length === 0) {
    return null; // No available priests
  }

  // Get the least busy priest (with fewest upcoming bookings)
  const priestsWithBookings = await Promise.all(
    availablePriests.map(async (priest) => {
      const upcomingCount = await mongoose.model('Booking').countDocuments({
        priest: priest._id,
        status: { $in: ['confirmed', 'in-progress'] },
        bookingDate: { $gte: new Date() }
      });
      return { priest, upcomingCount };
    })
  );

  // Sort by number of upcoming bookings (ascending)
  priestsWithBookings.sort((a, b) => a.upcomingCount - b.upcomingCount);
  
  return priestsWithBookings[0].priest;
};

// Update priest's working hours
priestSchema.methods.updateWorkingHours = async function(workingHours) {
  this.workingHours = { ...this.workingHours, ...workingHours };
  await this.save();
  return this;
};

// Update priest's break time
priestSchema.methods.updateBreakTime = async function(breakTime) {
  this.breakTime = { ...this.breakTime, ...breakTime };
  await this.save();
  return this;
};

// Toggle priest availability
priestSchema.methods.toggleAvailability = async function(isAvailable) {
  this.isAvailable = isAvailable;
  await this.save();
  return this;
};

const Priest = mongoose.model('Priest', priestSchema);

export default Priest;