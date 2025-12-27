import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure a user can't add the same product to wishlist multiple times
wishlistItemSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual populate
wishlistItemSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

// Static method to get user's wishlist
wishlistItemSchema.statics.getUserWishlist = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    this.find({ user: userId })
      .populate('product', 'name price images slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ user: userId })
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    }
  };
};

// Method to check if product is in user's wishlist
wishlistItemSchema.statics.isInWishlist = async function(userId, productId) {
  const count = await this.countDocuments({
    user: userId,
    product: productId
  });
  return count > 0;
};

const Wishlist = mongoose.model('Wishlist', wishlistItemSchema);

export default Wishlist;
