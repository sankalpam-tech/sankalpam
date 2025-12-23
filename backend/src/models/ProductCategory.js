import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
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
  displayOrder: {
    type: Number,
    default: 0
  },
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
  toObject: { virtuals: true }
});

// Virtual for child categories
productCategorySchema.virtual('subcategories', {
  ref: 'ProductCategory',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for product count
productCategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Create slug from name before saving
productCategorySchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  }
  
  // Ensure slug is unique
  if (this.isModified('slug') || this.isNew) {
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const categoriesWithSlug = await this.constructor.find({ slug: slugRegEx });
    
    if (categoriesWithSlug.length) {
      this.slug = `${this.slug}-${categoriesWithSlug.length + 1}`;
    }
  }
  
  next();
});

// Cascade delete subcategories when a category is deleted
productCategorySchema.pre('remove', async function(next) {
  await this.model('ProductCategory').deleteMany({ parentCategory: this._id });
  next();
});

// Indexes
productCategorySchema.index({ name: 'text', description: 'text' });
productCategorySchema.index({ slug: 1 });
productCategorySchema.index({ parentCategory: 1 });
productCategorySchema.index({ isActive: 1 });
productCategorySchema.index({ displayOrder: 1 });

// Static method to get category tree
productCategorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .select('name slug parentCategory displayOrder')
    .sort({ displayOrder: 1, name: 1 })
    .lean();
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => (cat.parentCategory ? cat.parentCategory.toString() : null) === (parentId ? parentId.toString() : null))
      .map(cat => ({
        ...cat,
        parentCategory: undefined, // Remove parentCategory from the output
        subcategories: buildTree(cat._id)
      }));
  };
  
  return buildTree();
};

// Method to get all descendant category IDs
productCategorySchema.methods.getDescendantIds = async function() {
  const categoryIds = [this._id];
  
  const getChildIds = async (parentId) => {
    const children = await this.model('ProductCategory').find({ parentCategory: parentId }, '_id');
    
    for (const child of children) {
      categoryIds.push(child._id);
      await getChildIds(child._id);
    }
  };
  
  await getChildIds(this._id);
  return categoryIds;
};

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

export default ProductCategory;
