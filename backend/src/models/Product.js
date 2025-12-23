import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'SKU cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number'],
    set: val => Math.round(val * 100) / 100 // Round to 2 decimal places
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price must be a positive number'],
    validate: {
      validator: function(val) {
        return val === undefined || val > this.price;
      },
      message: 'Compare at price must be greater than regular price'
    },
    set: val => val ? Math.round(val * 100) / 100 : undefined
  },
  costPerItem: {
    type: Number,
    min: [0, 'Cost per item must be a positive number'],
    set: val => val ? Math.round(val * 100) / 100 : undefined
  },
  profit: {
    type: Number,
    default: function() {
      return this.price - (this.costPerItem || 0);
    }
  },
  margin: {
    type: Number,
    default: function() {
      if (!this.costPerItem) return undefined;
      return Math.round(((this.price - this.costPerItem) / this.price) * 100);
    },
    min: [0, 'Margin cannot be negative'],
    max: [100, 'Margin cannot exceed 100%']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot be more than 100 characters']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  barcode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Barcode cannot be more than 50 characters']
  },
  weight: {
    value: {
      type: Number,
      min: [0, 'Weight must be a positive number']
    },
    unit: {
      type: String,
      enum: ['g', 'kg', 'lb', 'oz'],
      default: 'g'
    }
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length must be a positive number']
    },
    width: {
      type: Number,
      min: [0, 'Width must be a positive number']
    },
    height: {
      type: Number,
      min: [0, 'Height must be a positive number']
    },
    unit: {
      type: String,
      enum: ['mm', 'cm', 'm', 'in', 'ft'],
      default: 'cm'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [125, 'Alt text cannot be more than 125 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      min: 0
    }
  }],
  variants: [{
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true
    },
    values: [{
      type: String,
      trim: true,
      required: [true, 'Variant value is required']
    }]
  }],
  options: [{
    name: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true
    },
    values: [{
      type: String,
      trim: true,
      required: [true, 'Option value is required']
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: true
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  isService: {
    type: Boolean,
    default: false
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },
  isTaxable: {
    type: Boolean,
    default: true
  },
  taxCode: {
    type: String,
    trim: true
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'SEO title cannot be more than 100 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'SEO description cannot be more than 200 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    average: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  purchaseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  wishlistCount: {
    type: Number,
    default: 0,
    min: 0
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false
});

// Virtual for product URL
productSchema.virtual('url').get(function() {
  return `/products/${this.slug}`;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for in-stock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for low stock status (less than 10 items)
productSchema.virtual('lowStock').get(function() {
  return this.stock > 0 && this.stock <= 10;
});

// Create slug from name before saving
productSchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()\'"!:@]/g
    });
  }
  
  // Generate SKU if not provided
  if (!this.sku) {
    const prefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'PRD';
    const random = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${prefix}-${random}`;
  }
  
  // Ensure slug is unique
  if (this.isModified('slug') || this.isNew) {
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const productsWithSlug = await this.constructor.find({ slug: slugRegEx });
    
    if (productsWithSlug.length) {
      this.slug = `${this.slug}-${productsWithSlug.length + 1}`;
    }
  }
  
  // Set SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.name.substring(0, 100);
  }
  
  if (!this.seoDescription && this.shortDescription) {
    this.seoDescription = this.shortDescription.substring(0, 200);
  }
  
  next();
});

// Update product rating when a new review is added
productSchema.methods.updateRating = async function(newRating) {
  // Update rating distribution
  this.rating.distribution[newRating] = (this.rating.distribution[newRating] || 0) + 1;
  
  // Calculate new average rating
  let total = 0;
  let count = 0;
  
  for (let i = 1; i <= 5; i++) {
    total += i * (this.rating.distribution[i] || 0);
    count += this.rating.distribution[i] || 0;
  }
  
  this.rating.average = total / count;
  this.rating.count = count;
  
  await this.save();
};

// Check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity;
};

// Decrease stock
productSchema.methods.decreaseStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  this.stock -= quantity;
  this.purchaseCount += quantity;
  
  await this.save();
};

// Increase stock
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  await this.save();
};

// Static method to get featured products
productSchema.statics.getFeaturedProducts = async function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(limit)
    .select('name price compareAtPrice images slug rating stock')
    .lean();
};

// Static method to get best sellers
productSchema.statics.getBestSellers = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ purchaseCount: -1, 'rating.average': -1 })
    .limit(limit)
    .select('name price compareAtPrice images slug rating stock')
    .lean();
};

// Static method to get new arrivals
productSchema.statics.getNewArrivals = async function(limit = 10) {
  return this.find({ isActive: true, isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name price compareAtPrice images slug rating stock')
    .lean();
};

// Indexes
productSchema.index({ name: 'text', description: 'text', 'tags': 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ 'tags': 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;