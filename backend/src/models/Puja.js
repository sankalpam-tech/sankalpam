import mongoose from 'mongoose';

const pujaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a puja name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  slug: String, // URL-friendly version of the name
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  detailedDescription: {
    type: String,
    maxlength: [5000, 'Detailed description cannot be more than 5000 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PujaCategory',
    required: [true, 'Please select a category'],
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add duration in minutes'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be a positive number'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Price must be a positive number'],
  },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  saleEndDate: Date,
  featuredImage: {
    type: String,
    default: 'default.jpg',
  },
  images: [{
    type: String,
  }],
  benefits: [{
    type: String,
    maxlength: [200, 'Benefit cannot be more than 200 characters'],
  }],
  requirements: [{
    type: String,
    maxlength: [200, 'Requirement cannot be more than 200 characters'],
  }],
  samagri: [{
    item: {
      type: String,
      required: [true, 'Please add an item name'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please add quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    isIncluded: {
      type: Boolean,
      default: true,
    },
  }],
  procedure: [{
    step: Number,
    title: {
      type: String,
      required: [true, 'Please add a step title'],
      maxlength: [200, 'Step title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a step description'],
      maxlength: [1000, 'Step description cannot be more than 1000 characters'],
    },
  }],
  isPopular: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metaTitle: {
    type: String,
    maxlength: [100, 'Meta title cannot be more than 100 characters'],
  },
  metaDescription: {
    type: String,
    maxlength: [300, 'Meta description cannot be more than 300 characters'],
  },
  metaKeywords: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create puja slug from the name
pujaSchema.pre('save', function(next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  next();
});

// Cascade delete bookings when a puja is deleted
pujaSchema.pre('remove', async function(next) {
  await this.model('Booking').deleteMany({ puja: this._id });
  next();
});

// Reverse populate with virtuals
pujaSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'puja',
  justOne: false,
});

// Static method to get average price of pujas
pujaSchema.statics.getAveragePrice = async function(categoryId) {
  const obj = await this.aggregate([
    {
      $match: { category: categoryId },
    },
    {
      $group: {
        _id: '$category',
        averagePrice: { $avg: '$price' },
      },
    },
  ]);

  try {
    await this.model('PujaCategory').findByIdAndUpdate(categoryId, {
      averagePrice: Math.ceil(obj[0].averagePrice / 100) * 100,
    });
  } catch (err) {
    console.error(err);
  }
};

// Calculate average price when puja is saved
pujaSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('price')) {
    await this.constructor.calculateAveragePrice(this.category);
  }
  next();
});

// Calculate average price when puja is removed
pujaSchema.pre('remove', async function(next) {
  await this.constructor.calculateAveragePrice(this.category);
  next();
});

// Calculate average rating for a puja
pujaSchema.statics.calculateAverageRating = async function(pujaId) {
  const stats = await this.model('Booking').aggregate([
    {
      $match: { puja: pujaId, rating: { $gt: 0 } }
    },
    {
      $group: {
        _id: '$puja',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(pujaId, {
      rating: stats[0].avgRating,
      ratingCount: stats[0].nRating
    });
  } else {
    await this.findByIdAndUpdate(pujaId, {
      rating: 0,
      ratingCount: 0
    });
  }
};

// Call getAveragePrice after save
pujaSchema.post('save', function() {
  this.constructor.getAveragePrice(this.category);
});

// Call getAveragePrice after remove
pujaSchema.post('remove', function() {
  this.constructor.getAveragePrice(this.category);
});

const Puja = mongoose.model('Puja', pujaSchema);

export default Puja;
