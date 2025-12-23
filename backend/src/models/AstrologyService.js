import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot be more than 100 characters'],
      unique: true,
      index: true
    },
    
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true
    },
    
    // Service Details
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    
    category: {
      type: String,
      required: [true, 'Category is required'],
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
          'Spiritual Astrology',
          'Other'
        ],
        message: '{VALUE} is not a valid category'
      },
      index: true
    },
    
    // Pricing and Duration
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      min: [15, 'Minimum duration is 15 minutes'],
      max: [240, 'Maximum duration is 240 minutes']
    },
    
    isCustomDurationAllowed: {
      type: Boolean,
      default: false
    },
    
    minDuration: {
      type: Number,
      min: [15, 'Minimum duration is 15 minutes'],
      max: [240, 'Maximum duration is 240 minutes']
    },
    
    maxDuration: {
      type: Number,
      min: [15, 'Minimum duration is 15 minutes'],
      max: [240, 'Maximum duration is 240 minutes']
    },
    
    // Service Requirements
    requirements: [{
      type: String,
      trim: true,
      maxlength: [200, 'Requirement cannot be more than 200 characters']
    }],
    
    // Media
    imageUrl: {
      type: String,
      match: [/^https?:\/\//, 'Please use a valid URL with HTTP or HTTPS'],
      trim: true
    },
    
    // Service Settings
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    isPopular: {
      type: Boolean,
      default: false,
      index: true
    },
    
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Scheduling
    advanceBookingDays: {
      type: Number,
      default: 30,
      min: [1, 'Minimum advance booking is 1 day'],
      max: [365, 'Maximum advance booking is 365 days']
    },
    
    bufferTime: {
      type: Number, // in minutes
      default: 15,
      min: [0, 'Buffer time cannot be negative'],
      max: [60, 'Maximum buffer time is 60 minutes']
    },
    
    // Metadata
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Meta title cannot be more than 100 characters']
    },
    
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Meta description cannot be more than 300 characters']
    },
    
    metaKeywords: [{
      type: String,
      trim: true
    }],
    
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
    isDeleted: {
      type: Boolean,
      default: false,
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
serviceSchema.index({ name: 'text', description: 'text', category: 'text' });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ duration: 1 });
serviceSchema.index({ isActive: 1, isFeatured: 1, isPopular: 1 });

// Virtual for astrologers offering this service
serviceSchema.virtual('astrologers', {
  ref: 'Astrologer',
  localField: '_id',
  foreignField: 'services.service',
  options: { 
    match: { 
      status: 'active',
      isVerified: true,
      isActive: true 
    },
    sort: { 'rating.average': -1 }
  }
});

// Virtual for service reviews
serviceSchema.virtual('reviews', {
  ref: 'AstrologyReview',
  localField: '_id',
  foreignField: 'service',
  options: { 
    sort: { createdAt: -1 },
    limit: 10
  }
});

// Virtual for service bookings
serviceSchema.virtual('bookings', {
  ref: 'AstrologyBooking',
  localField: '_id',
  foreignField: 'service',
  options: { 
    sort: { startTime: -1 },
    limit: 10
  }
});

// Pre-save hook to generate slug
serviceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/\s+/g, '-') // replace spaces with -
      .replace(/--+/g, '-') // replace multiple - with single -
      .trim();
  }
  
  // Set default min/max duration if not provided
  if (this.isNew || this.isModified('duration')) {
    if (!this.minDuration) {
      this.minDuration = this.duration;
    }
    if (!this.maxDuration) {
      this.maxDuration = this.duration;
    }
  }
  
  // Ensure minDuration is not greater than maxDuration
  if (this.minDuration > this.maxDuration) {
    [this.minDuration, this.maxDuration] = [this.maxDuration, this.minDuration];
  }
  
  // Ensure duration is within min/max range
  if (this.duration < this.minDuration) {
    this.duration = this.minDuration;
  } else if (this.duration > this.maxDuration) {
    this.duration = this.maxDuration;
  }
  
  next();
});

// Method to calculate price for a given duration
serviceSchema.methods.calculatePrice = function(duration = null) {
  const serviceDuration = duration || this.duration;
  
  // If custom duration is not allowed, return base price
  if (!this.isCustomDurationAllowed || serviceDuration === this.duration) {
    return this.basePrice;
  }
  
  // Ensure duration is within allowed range
  const actualDuration = Math.max(
    this.minDuration,
    Math.min(serviceDuration, this.maxDuration)
  );
  
  // Calculate proportional price
  const pricePerMinute = this.basePrice / this.duration;
  const calculatedPrice = pricePerMinute * actualDuration;
  
  // Round to 2 decimal places
  return Math.round(calculatedPrice * 100) / 100;
};

// Static method to get service stats
serviceSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true, isDeleted: { $ne: true } }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$basePrice' },
        minPrice: { $min: '$basePrice' },
        maxPrice: { $max: '$basePrice' },
        totalDuration: { $sum: '$duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  return stats;
};

// Pre-find hooks to exclude deleted services
serviceSchema.pre(/^find/, function(next) {
  if (this.getFilter().isDeleted === undefined) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

const AstrologyService = mongoose.model('AstrologyService', serviceSchema);

export default AstrologyService;