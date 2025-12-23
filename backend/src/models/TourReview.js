import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourBooking',
      required: [true, 'Booking reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    photos: [
      {
        url: String,
        caption: String,
      },
    ],
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    response: {
      text: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ tourPackage: 1, user: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save hook to update tour package rating
reviewSchema.pre('save', async function (next) {
  // Only run this hook if the rating is modified
  if (!this.isModified('rating')) return next();
  
  // Ensure user has a booking for this tour
  const booking = await mongoose.model('TourBooking').findOne({
    _id: this.booking,
    user: this.user,
    tourPackage: this.tourPackage,
    status: 'completed',
  });
  
  if (!booking) {
    throw new Error('You can only review tours you have completed');
  }
  
  // Prevent duplicate reviews
  const existingReview = await this.constructor.findOne({
    user: this.user,
    tourPackage: this.tourPackage,
    _id: { $ne: this._id },
  });
  
  if (existingReview) {
    throw new Error('You have already reviewed this tour');
  }
  
  next();
});

// Post-save hook to update tour package rating
reviewSchema.post('save', async function (doc) {
  await updateTourPackageRating(doc.tourPackage);
});

// Post-remove hook to update tour package rating
reviewSchema.post('remove', async function (doc) {
  await updateTourPackageRating(doc.tourPackage);
});

// Helper function to update tour package rating
async function updateTourPackageRating(tourPackageId) {
  const stats = await mongoose.model('TourReview').aggregate([
    {
      $match: { 
        tourPackage: tourPackageId,
        status: 'approved' 
      }
    },
    {
      $group: {
        _id: '$tourPackage',
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('TourPackage').findByIdAndUpdate(tourPackageId, {
      'rating.average': stats[0].average,
      'rating.count': stats[0].count
    });
  } else {
    await mongoose.model('TourPackage').findByIdAndUpdate(tourPackageId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
}

// Static method to get reviews by tour package
reviewSchema.statics.getTourReviews = async function (tourPackageId, options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt', rating } = options;
  
  const query = { 
    tourPackage: tourPackageId,
    status: 'approved' 
  };
  
  if (rating) {
    query.rating = parseInt(rating);
  }
  
  const skip = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    reviews,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit)
  };
};

// Static method to get user's reviews
reviewSchema.statics.getUserReviews = async function (userId, options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    this.find({ user: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('tourPackage', 'name slug images')
      .lean(),
    this.countDocuments({ user: userId })
  ]);
  
  return {
    reviews,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit)
  };
};

const TourReview = mongoose.model('TourReview', reviewSchema);

export default TourReview;