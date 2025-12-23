import mongoose from 'mongoose';

const tourPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour package name is required'],
      trim: true,
      maxlength: [100, 'Tour package name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    durationUnit: {
      type: String,
      enum: ['days', 'weeks'],
      default: 'days',
    },
    price: {
      adult: {
        type: Number,
        required: [true, 'Adult price is required'],
        min: [0, 'Price cannot be negative'],
      },
      child: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative'],
      },
      infant: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative'],
      },
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    maxPeople: {
      type: Number,
      required: [true, 'Maximum people capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required'],
    },
    availableTo: {
      type: Date,
      required: [true, 'Available to date is required'],
    },
    images: [
      {
        url: String,
        altText: String,
        isPrimary: Boolean,
      },
    ],
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
        activities: [String],
        meals: [String],
        accommodation: String,
      },
    ],
    inclusions: [String],
    exclusions: [String],
    highlights: [String],
    requirements: [String],
    cancellationPolicy: {
      type: String,
      default: 'Standard cancellation policy applies',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    destinations: [
      {
        type: String,
        trim: true,
      },
    ],
    startLocation: {
      type: String,
      required: [true, 'Start location is required'],
    },
    endLocation: {
      type: String,
      required: [true, 'End location is required'],
    },
    transport: {
      type: String,
      enum: ['flight', 'train', 'bus', 'cruise', 'self-drive', 'other'],
      required: [true, 'Transport type is required'],
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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
tourPackageSchema.index({ name: 'text', description: 'text', 'destinations': 'text' });
tourPackageSchema.index({ isActive: 1 });
tourPackageSchema.index({ price: 1 });
tourPackageSchema.index({ duration: 1 });
tourPackageSchema.index({ availableFrom: 1, availableTo: 1 });

// Virtual for duration text
tourPackageSchema.virtual('durationText').get(function () {
  return `${this.duration} ${this.durationUnit}${this.duration > 1 ? 's' : ''}`;
});

// Virtual for discounted price
tourPackageSchema.virtual('discountedPrice').get(function () {
  if (!this.discount) return this.price;
  
  return {
    adult: this.price.adult * (1 - this.discount / 100),
    child: this.price.child * (1 - this.discount / 100),
    infant: this.price.infant * (1 - this.discount / 100),
  };
});

// Virtual for available dates
tourPackageSchema.virtual('availableDates').get(function () {
  const dates = [];
  let currentDate = new Date(this.availableFrom);
  const endDate = new Date(this.availableTo);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
});

// Pre-save hook to generate slug
tourPackageSchema.pre('save', async function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  }
  
  // Ensure availableTo is after availableFrom
  if (this.availableTo <= this.availableFrom) {
    throw new Error('Available to date must be after available from date');
  }
  
  next();
});

// Static method to get featured tours
tourPackageSchema.statics.getFeaturedTours = async function (limit = 5) {
  return this.find({ isActive: true })
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(limit)
    .select('name slug price discount duration images rating')
    .lean();
};

// Static method to get tour stats
tourPackageSchema.statics.getTourStats = async function () {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalTours: { $sum: 1 },
        avgRating: { $avg: '$rating.average' },
        minPrice: { $min: '$price.adult' },
        maxPrice: { $max: '$price.adult' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

const TourPackage = mongoose.model('TourPackage', tourPackageSchema);

export default TourPackage;
