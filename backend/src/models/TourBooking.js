import mongoose from 'mongoose';

const bookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
};

const paymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

const tourBookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    tourPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourPackage',
      required: [true, 'Tour package is required'],
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    travelers: {
      adults: {
        count: {
          type: Number,
          required: [true, 'Number of adults is required'],
          min: [1, 'At least one adult is required'],
        },
        names: [String],
      },
      children: {
        count: {
          type: Number,
          default: 0,
          min: [0, 'Number of children cannot be negative'],
        },
        names: [String],
        ages: [Number],
      },
      infants: {
        count: {
          type: Number,
          default: 0,
          min: [0, 'Number of infants cannot be negative'],
        },
        names: [String],
      },
    },
    contactInfo: {
      fullName: {
        type: String,
        required: [true, 'Contact full name is required'],
      },
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
      },
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    specialRequirements: {
      dietary: [String],
      medical: [String],
      other: String,
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      fees: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    payment: {
      status: {
        type: String,
        enum: Object.values(paymentStatus),
        default: paymentStatus.PENDING,
      },
      method: String,
      transactionId: String,
      paymentDate: Date,
      paymentDetails: {},
    },
    status: {
      type: String,
      enum: Object.values(bookingStatus),
      default: bookingStatus.PENDING,
    },
    cancellationReason: String,
    cancellationDate: Date,
    cancellationRefund: Number,
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
tourBookingSchema.index({ bookingNumber: 1 }, { unique: true });
tourBookingSchema.index({ user: 1 });
tourBookingSchema.index({ tourPackage: 1 });
tourBookingSchema.index({ 'payment.status': 1 });
tourBookingSchema.index({ status: 1 });
tourBookingSchema.index({ travelDate: 1 });

// Virtual for total travelers
tourBookingSchema.virtual('totalTravelers').get(function () {
  return (
    this.travelers.adults.count +
    this.travelers.children.count +
    this.travelers.infants.count
  );
});

// Virtual for booking status text
tourBookingSchema.virtual('statusText').get(function () {
  const statusMap = {
    [bookingStatus.PENDING]: 'Pending',
    [bookingStatus.CONFIRMED]: 'Confirmed',
    [bookingStatus.CANCELLED]: 'Cancelled',
    [bookingStatus.COMPLETED]: 'Completed',
    [bookingStatus.REFUNDED]: 'Refunded',
  };
  return statusMap[this.status] || this.status;
});

// Pre-save hook to generate booking number
tourBookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const count = await this.constructor.countDocuments();
    this.bookingNumber = `TOUR-${Date.now()}-${(count + 1).toString().padStart(5, '0')}`;
  }
  
  // Ensure travel date is in the future
  if (this.isModified('travelDate') && this.travelDate <= new Date()) {
    throw new Error('Travel date must be in the future');
  }
  
  next();
});

// Post-save hook to update tour package stats
tourBookingSchema.post('save', async function (doc) {
  if (doc.status === bookingStatus.CONFIRMED) {
    // Update tour package booking count
    await mongoose.model('TourPackage').updateOne(
      { _id: doc.tourPackage },
      { $inc: { 'bookingCount': 1 } }
    );
  }
});

// Static method to get booking stats
tourBookingSchema.statics.getBookingStats = async function (userId = null) {
  const match = userId ? { user: mongoose.Types.ObjectId(userId) } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.total' }
      }
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' },
        byStatus: {
          $push: {
            status: '$_id',
            count: '$count',
            amount: '$totalAmount'
          }
        }
      }
    }
  ]);
};

const TourBooking = mongoose.model('TourBooking', tourBookingSchema);

export { bookingStatus, paymentStatus };
export default TourBooking;
