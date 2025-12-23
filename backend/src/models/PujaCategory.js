import mongoose from 'mongoose';

const pujaCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  image: {
    type: String,
    default: 'default.jpg',
  },
  averagePrice: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metaTitle: String,
  metaDescription: String,
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

// Create category slug from the name
pujaCategorySchema.pre('save', function(next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  next();
});

// Cascade delete pujas when a category is deleted
pujaCategorySchema.pre('remove', async function(next) {
  await this.model('Puja').deleteMany({ category: this._id });
  next();
});

// Reverse populate with virtuals
pujaCategorySchema.virtual('pujas', {
  ref: 'Puja',
  localField: '_id',
  foreignField: 'category',
  justOne: false,
});

const PujaCategory = mongoose.model('PujaCategory', pujaCategorySchema);

export default PujaCategory;