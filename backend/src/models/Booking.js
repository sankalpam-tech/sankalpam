import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  puja: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puja',
    required: [true, 'Please select a puja'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  priest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bookingDate: {
    type: Date,
    required: [true, 'Please provide booking date'],
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time'],
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time'],
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in hours'],
  },
  numberOfPeople: {
    type: Number,
    required: [true, 'Please specify number of people'],
    min: [1, 'Number of people must be at least 1'],
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'in-person'],
      default: 'in-person',
    },
    address: {
      type: String,
      required: [
        function() { return this.location === 'in-person'; },
        'Please provide address for in-person puja'
      ],
    },
    city: String,
    state: String,
    country: String,
    pincode: String,
    coordinates: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Please provide contact person name'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please provide contact email'],
      lowercase: true,
    },
    relationship: {
      type: String,
      enum: ['self', 'family', 'friend', 'other'],
      default: 'self',
    },
  },
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional information cannot be more than 1000 characters'],
  },
  requirements: [{
    name: String,
    description: String,
    isProvided: {
      type: Boolean,
      default: false,
    },
    cost: {
      type: Number,
      default: 0,
    },
  }],
  status: {
    type: String,
    enum: [
      'pending',        // Initial status when booking is created
      'confirmed',      // Admin/priest has confirmed the booking
      'in-progress',    // Puja is currently being performed
      'completed',      // Puja has been completed
      'cancelled',      // Booking was cancelled
      'rejected',       // Booking was rejected by admin/priest
    ],
    default: 'pending',
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters'],
  },
  payment: {
    type: {
      type: String,
      enum: ['full', 'partial', 'pending'],
      default: 'pending',
    },
    amount: {
      type: Number,
      required: [true, 'Please provide total amount'],
    },
    advancePaid: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi', 'bank-transfer'],
    },
    transactionId: String,
    paymentDate: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially-refunded'],
      default: 'pending',
    },
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot be more than 1000 characters'],
  },
  reviewDate: Date,
  adminNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
bookingSchema.index({ puja: 1, bookingDate: 1, startTime: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ priest: 1, status: 1 });
bookingSchema.index({ 'location.coordinates': '2dsphere' });

// Document middleware to update related puja's booking count
bookingSchema.post('save', async function(doc) {
  // Update puja's booking count
  await this.model('Puja').findByIdAndUpdate(doc.puja, {
    $inc: { bookingCount: 1 }
  });
});

// Query middleware to only show active bookings by default
bookingSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Virtual populate for puja details
bookingSchema.virtual('pujaDetails', {
  ref: 'Puja',
  localField: 'puja',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for user details
bookingSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  select: 'name email phone',
});

// Virtual populate for priest details
bookingSchema.virtual('priestDetails', {
  ref: 'User',
  localField: 'priest',
  foreignField: '_id',
  justOne: true,
  select: 'name email phone',
});

// Calculate total amount before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const puja = await this.model('Puja').findById(this.puja);
    if (puja) {
      // Calculate total amount based on puja price and duration
      this.payment.amount = puja.price * this.duration;
      
      // Add any additional requirements cost
      if (this.requirements && this.requirements.length > 0) {
        const requirementsCost = this.requirements.reduce(
          (acc, req) => acc + (req.cost || 0), 0
        );
        this.payment.amount += requirementsCost;
      }
    }
  }
  next();
});

// Method to check time slot availability
bookingSchema.statics.checkAvailability = async function(
  pujaId,
  bookingDate,
  startTime,
  endTime,
  excludeBookingId = null
) {
  const query = {
    puja: pujaId,
    bookingDate: new Date(bookingDate),
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
    ],
    status: { $nin: ['cancelled', 'rejected'] }, // Don't count cancelled/rejected bookings
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await this.find(query);
  return existingBookings.length === 0;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
