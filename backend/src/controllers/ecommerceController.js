import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// ======================
// Category Controllers
// ======================

/**
 * @desc    Get all categories
 * @route   GET /api/ecommerce/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'name' } = req.query;
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [categories, total] = await Promise.all([
    ProductCategory.find()
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    ProductCategory.countDocuments()
  ]);
  
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: categories.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: categories
  });
});

/**
 * @desc    Get single category
 * @route   GET /api/ecommerce/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    data: category
  });
});

/**
 * @desc    Create a category
 * @route   POST /api/ecommerce/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  const category = new ProductCategory({
    ...req.body,
    createdBy: req.user.id
  });
  
  await category.save();
  
  res.status(201).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Update a category
 * @route   PUT /api/ecommerce/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id
    },
    { new: true, runValidators: true }
  );
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    data: category
  });
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/ecommerce/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productCount} associated products`);
  }
  
  await category.remove();
  
  res.json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get category tree
 * @route   GET /api/ecommerce/categories/tree
 * @access  Public
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  try {
    const categories = await ProductCategory.find({ isActive: true })
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
    
    const categoryTree = buildTree();
    
    res.json({
      success: true,
      count: categoryTree.length,
      data: categoryTree
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category tree',
      error: error.message
    });
  }
});

/**
 * @desc    Upload category image
 * @route   POST /api/ecommerce/categories/:id/image
 * @access  Private/Admin
 */
export const uploadCategoryImage = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const file = req.files.file;
  
  try {
    const result = await uploadToCloudinary(file, {
      folder: 'sankalpam/categories',
      public_id: `category_${category._id}_${Date.now()}`,
      width: 800,
      height: 600,
      crop: 'fill'
    });
    
    category.imageUrl = result.secure_url;
    category.updatedBy = req.user.id;
    
    await category.save();
    
    res.json({
      success: true,
      data: {
        imageUrl: category.imageUrl
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500);
    throw new Error('Error uploading image');
  }
});

// ======================
// Product Controllers
// ======================

/**
 * @desc    Get all products
 * @route   GET /api/ecommerce/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    inStock,
    featured,
    newArrival,
    bestSeller,
    search,
    rating
  } = req.query;
  
  // Build query
  const query = {};
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  // Filter by stock
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  } else if (inStock === 'false') {
    query.stock = { $lte: 0 };
  }
  
  // Filter by featured
  if (featured === 'true') {
    query.isFeatured = true;
  }
  
  // Filter by new arrival
  if (newArrival === 'true') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    query.createdAt = { $gte: oneMonthAgo };
  }
  
  // Filter by best seller
  if (bestSeller === 'true') {
    query.isBestSeller = true;
  }
  
  // Filter by rating
  if (rating) {
    query['rating.average'] = { $gte: parseFloat(rating) };
  }
  
  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'tags': { $regex: search, $options: 'i' } }
    ];
  }
  
  // Only show active products to non-admin users
  if (req.user?.role !== 'admin') {
    query.isActive = true;
  }
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  // Execute query with pagination
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select('-__v -updatedAt -createdAt')
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(query)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: products
  });
});

/**
 * @desc    Get single product
 * @route   GET /api/ecommerce/products/:id
 * @access  Public
 */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('relatedProducts', 'name price images rating');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Increment view count
  product.viewCount += 1;
  await product.save();
  
  res.json({
    success: true,
    data: product
  });
});

/**
 * @desc    Get product by slug
 * @route   GET /api/ecommerce/products/slug/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate('relatedProducts', 'name price images rating');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Increment view count
  product.viewCount += 1;
  await product.save();
  
  res.json({
    success: true,
    data: product
  });
});

/**
 * @desc    Create a product
 * @route   POST /api/ecommerce/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  const product = new Product({
    ...req.body,
    createdBy: req.user.id
  });
  
  await product.save();
  
  res.status(201).json({
    success: true,
    data: product
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/ecommerce/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id
    },
    { new: true, runValidators: true }
  );
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json({
    success: true,
    data: product
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/ecommerce/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if product has orders
  const orderCount = await Order.countDocuments({ 'items.product': product._id });
  
  if (orderCount > 0) {
    // Soft delete
    product.isActive = false;
    product.updatedBy = req.user.id;
    await product.save();
  } else {
    // Hard delete
    await product.remove();
  }
  
  res.json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Upload product images
 * @route   POST /api/ecommerce/products/:id/images
 * @access  Private/Admin
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const file = req.files.file;
  
  try {
    const result = await uploadToCloudinary(file, {
      folder: 'sankalpam/products',
      public_id: `product_${product._id}_${Date.now()}`,
      width: 1200,
      height: 1200,
      crop: 'fill'
    });
    
    const image = {
      url: result.secure_url,
      altText: `Image of ${product.name}`,
      isPrimary: product.images.length === 0,
      position: product.images.length
    };
    
    product.images.push(image);
    product.updatedBy = req.user.id;
    
    await product.save();
    
    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500);
    throw new Error('Error uploading image');
  }
});

/**
 * @desc    Get featured products
 * @route   GET /api/ecommerce/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  const products = await Product.find({ isFeatured: true, isActive: true })
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(parseInt(limit, 10))
    .select('name price compareAtPrice images slug rating stock')
    .lean();
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @desc    Get best selling products
 * @route   GET /api/ecommerce/products/bestsellers
 * @access  Public
 */
export const getBestSellers = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  const products = await Product.find({ isActive: true })
    .sort({ purchaseCount: -1, 'rating.average': -1 })
    .limit(parseInt(limit, 10))
    .select('name price compareAtPrice images slug rating stock')
    .lean();
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @desc    Get new arrival products
 * @route   GET /api/ecommerce/products/new-arrivals
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const products = await Product.find({
    isActive: true,
    createdAt: { $gte: oneMonthAgo }
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .select('name price compareAtPrice images slug rating stock')
    .lean();
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @desc    Get products by category
 * @route   GET /api/ecommerce/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  
  // Check if category exists
  const categoryExists = await ProductCategory.findById(category);
  
  if (!categoryExists) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Get all subcategories
  const subcategories = await ProductCategory.find({ parentCategory: category }, '_id');
  const categoryIds = [category, ...subcategories.map(cat => cat._id)];
  
  // Build query
  const query = {
    category: { $in: categoryIds },
    isActive: true
  };
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  // Execute query with pagination
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select('name price compareAtPrice images slug rating stock')
      .lean(),
    Product.countDocuments(query)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    category: categoryExists,
    data: products
  });
});

/**
 * @desc    Search products
 * @route   GET /api/ecommerce/products/search
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const searchQuery = {
    $text: { $search: q },
    isActive: true
  };
  
  const [products, total] = await Promise.all([
    Product.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(pageSize)
      .select('name price compareAtPrice images slug rating stock')
      .lean(),
    Product.countDocuments(searchQuery)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    query: q,
    data: products
  });
});

/**
 * @desc    Get similar products
 * @route   GET /api/ecommerce/products/:id/similar
 * @access  Public
 */
export const getSimilarProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;
  
  const product = await Product.findById(id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const similarProducts = await Product.find({
    _id: { $ne: id },
    category: product.category,
    isActive: true
  })
    .sort({ 'rating.average': -1 })
    .limit(parseInt(limit, 10))
    .select('name price compareAtPrice images slug rating stock')
    .lean();
  
  res.json({
    success: true,
    count: similarProducts.length,
    data: similarProducts
  });
});

/**
 * @desc    Toggle product status (active/inactive)
 * @route   PUT /api/ecommerce/products/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Toggle the status
  product.isActive = !product.isActive;
  product.updatedBy = req.user.id;
  
  await product.save();
  
  res.json({
    success: true,
    data: {
      _id: product._id,
      isActive: product.isActive
    }
  });
});

/**
 * @desc    Get product requirements
 * @route   GET /api/ecommerce/products/:id/requirements
 * @access  Public
 */
export const getProductRequirements = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .select('name requirements')
    .lean();
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json({
    success: true,
    data: {
      product: product.name,
      requirements: product.requirements || []
    }
  });
});

/**
 * @desc    Update product requirements
 * @route   PUT /api/ecommerce/products/:id/requirements
 * @access  Private/Admin
 */
export const updateProductRequirements = asyncHandler(async (req, res) => {
  const { requirements } = req.body;
  
  if (!Array.isArray(requirements)) {
    return res.status(400).json({
      success: false,
      error: 'Requirements must be an array'
    });
  }
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Update requirements
  product.requirements = requirements;
  product.updatedBy = req.user.id;
  
  await product.save();
  
  res.json({
    success: true,
    data: {
      _id: product._id,
      requirements: product.requirements
    }
  });
});

/**
 * @desc    Get product categories
 * @route   GET /api/ecommerce/products/categories
 * @access  Public
 */
export const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await ProductCategory.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({
    success: true,
    count: categories.length,
    data: categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }))
  });
});

// ======================
// Cart Controllers
// ======================

/**
 * @desc    Get user's cart
 * @route   GET /api/ecommerce/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price images stock')
    .lean();
  
  if (!cart) {
    // Create a new cart if it doesn't exist
    const newCart = new Cart({
      user: req.user.id,
      items: []
    });
    
    await newCart.save();
    
    return res.json({
      success: true,
      data: newCart
    });
  }
  
  res.json({
    success: true,
    data: cart
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/ecommerce/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, selectedVariant, selectedOptions } = req.body;
  
  // Get or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: []
    });
  }
  
  // Get product
  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if product is in stock
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }
  
  // Check if item already exists in cart with the same variant and options
  const existingItemIndex = cart.items.findIndex(item => {
    const sameProduct = item.product.toString() === productId;
    const sameVariant = JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant);
    const sameOptions = JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions || []);
    
    return sameProduct && sameVariant && sameOptions;
  });
  
  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      selectedVariant,
      selectedOptions: selectedOptions || []
    });
  }
  
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images stock');
  
  res.status(201).json({
    success: true,
    data: cart
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/ecommerce/cart/items/:id
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  
  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      error: 'Quantity must be at least 1'
    });
  }
  
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.id);
  
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }
  
  // Get product to check stock
  const product = await Product.findById(cart.items[itemIndex].product);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }
  
  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images stock');
  
  res.json({
    success: true,
    data: cart
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/ecommerce/cart/items/:id
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);
  
  if (cart.items.length === initialLength) {
    res.status(404);
    throw new Error('Item not found in cart');
  }
  
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images stock');
  
  res.json({
    success: true,
    data: cart
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/ecommerce/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return res.json({
      success: true,
      data: { items: [] }
    });
  }
  
  cart.items = [];
  cart.coupon = undefined;
  
  await cart.save();
  
  res.json({
    success: true,
    data: cart
  });
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/ecommerce/cart/apply-coupon
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Coupon code is required'
    });
  }
  
  // In a real application, you would validate the coupon against your database
  // This is a simplified example
  const coupon = {
    code: code.toUpperCase(),
    discount: 10, // 10% discount
    discountType: 'percentage',
    minPurchase: 1000, // Minimum purchase of ₹1000
    maxDiscount: 500 // Maximum discount of ₹500
  };
  
  // Find user's cart
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'price');
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  // Calculate subtotal
  const subtotal = cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
  // Check minimum purchase requirement
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return res.status(400).json({
      success: false,
      error: `Minimum purchase of ₹${coupon.minPurchase} required to apply this coupon`
    });
  }
  
  // Apply coupon to cart
  cart.coupon = coupon;
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images stock');
  
  res.json({
    success: true,
    data: cart,
    message: 'Coupon applied successfully'
  });
});

/**
 * @desc    Remove coupon from cart
 * @route   DELETE /api/ecommerce/cart/remove-coupon
 * @access  Private
 */
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  if (!cart.coupon) {
    return res.status(400).json({
      success: false,
      error: 'No coupon applied to this cart'
    });
  }
  
  cart.coupon = undefined;
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images stock');
  
  res.json({
    success: true,
    data: cart,
    message: 'Coupon removed successfully'
  });
});

// ======================
// Order Controllers
// ======================

/**
 * @desc    Create a new order
 * @route   POST /api/ecommerce/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    customerNote,
    createAccount
  } = req.body;
  
  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price stock');
  
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('No items in cart');
  }
  
  // Check product stock and calculate totals
  let subtotal = 0;
  const items = [];
  
  for (const item of cart.items) {
    const product = item.product;
    
    // Check stock
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    
    // Calculate line total
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    
    // Add to order items
    items.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      subtotal: lineTotal,
      selectedVariant: item.selectedVariant,
      selectedOptions: item.selectedOptions
    });
  }
  
  // Calculate shipping (simplified example)
  const shipping = subtotal > 1000 ? 0 : 100; // Free shipping for orders over ₹1000
  
  // Calculate tax (simplified example: 18% GST)
  const tax = subtotal * 0.18;
  
  // Calculate discount (from coupon if any)
  let discount = 0;
  let coupon = null;
  
  if (cart.coupon) {
    if (cart.coupon.discountType === 'percentage') {
      discount = (subtotal * cart.coupon.discount) / 100;
      
      // Apply maximum discount if set
      if (cart.coupon.maxDiscount && discount > cart.coupon.maxDiscount) {
        discount = cart.coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discount = Math.min(cart.coupon.discount, subtotal);
    }
    
    coupon = {
      code: cart.coupon.code,
      discount: cart.coupon.discount,
      discountType: cart.coupon.discountType
    };
  }
  
  // Calculate total
  const total = Math.max(0, subtotal + shipping + tax - discount);
  
  // Create order
  const order = new Order({
    user: req.user.id,
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    coupon,
    paymentMethod,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    customerNote,
    createdBy: req.user.id
  });
  
  await order.save();
  
  // Update product stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { stock: -item.quantity, purchaseCount: item.quantity } }
    );
  }
  
  // Clear cart
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();
  
  // In a real application, you would integrate with a payment gateway here
  // and handle the payment processing
  
  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully. Redirecting to payment...'
  });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/ecommerce/orders
 * @access  Private
 */
/**
 * @desc    Get order history for the logged in user
 * @route   GET /api/ecommerce/orders/history
 * @access  Private
 */
export const getOrderHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;

  // Build query
  const query = { user: req.user.id };
  
  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.product', 'name price image')
      .sort('-createdAt')
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Order.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: orders
  });
});

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/ecommerce/orders
 * @access  Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  // Build query
  const query = { user: req.user.id };
  
  if (status) {
    query.status = status;
  }
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(pageSize)
      .select('-__v -updatedAt')
      .lean(),
    Order.countDocuments(query)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: orders
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/ecommerce/orders/:id
 * @access  Private
 */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images')
    .lean();
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is authorized to view this order
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  
  res.json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/ecommerce/orders/:id/status
 * @access  Private/Admin
 */
/**
 * @desc    Get order status by ID
 * @route   GET /api/ecommerce/orders/status/:id
 * @access  Private
 */
export const getOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    $or: [
      { user: req.user.id },
      { 'shippingAddress.email': req.user.email }
    ]
  }).select('status statusHistory orderNumber');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found or you are not authorized to view this order'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      statusHistory: order.statusHistory || []
    }
  });
});

/**
 * @desc    Update order status (admin)
 * @route   PUT /api/ecommerce/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Update status
  order.status = status;
  
  // Add admin note if provided
  if (adminNote) {
    order.adminNote = adminNote;
  }
  
  // Update updatedBy
  order.updatedBy = req.user.id;
  
  await order.save();
  
  // In a real application, you would send status update notifications to the user
  
  res.json({
    success: true,
    data: order,
    message: 'Order status updated successfully'
  });
});

/**
 * @desc    Update payment status
 * @route   PUT /api/ecommerce/orders/:id/payment
 * @access  Private/Admin
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId, paymentDetails } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Update payment status
  order.paymentStatus = paymentStatus;
  
  // Update transaction ID if provided
  if (transactionId) {
    order.paymentTransactionId = transactionId;
  }
  
  // Update payment details if provided
  if (paymentDetails) {
    order.paymentDetails = paymentDetails;
  }
  
  // Update updatedBy
  order.updatedBy = req.user.id;
  
  await order.save();
  
  // In a real application, you would send payment status update notifications to the user
  
  res.json({
    success: true,
    data: order,
    message: 'Payment status updated successfully'
  });
});

/**
 * @desc    Cancel order
 * @route   POST /api/ecommerce/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is authorized to cancel this order
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }
  
  // Check if order can be cancelled
  const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
  
  if (nonCancellableStatuses.includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }
  
  // Update order status
  order.status = 'cancelled';
  order.updatedBy = req.user.id;
  
  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }
  
  await order.save();
  
  // In a real application, you would process refund if payment was made
  // and send cancellation confirmation to the user
  
  res.json({
    success: true,
    data: order,
    message: 'Order cancelled successfully'
  });
});

/**
 * @desc    Request order return
 * @route   POST /api/ecommerce/orders/:id/return
 * @access  Private
 */
export const requestReturn = asyncHandler(async (req, res) => {
  const { reason, items } = req.body;
  
  if (!reason || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Reason and items are required for return request'
    });
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is authorized to request return for this order
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to request return for this order');
  }
  
  // Check if order is eligible for return
  const nonReturnableStatuses = ['pending', 'processing', 'cancelled', 'refunded'];
  
  if (nonReturnableStatuses.includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot request return for order with status: ${order.status}`);
  }
  
  // Check if return is already requested
  if (order.returnRequested) {
    res.status(400);
    throw new Error('Return already requested for this order');
  }
  
  // Validate return items
  const returnItems = [];
  let returnAmount = 0;
  
  for (const item of items) {
    const orderItem = order.items.id(item.itemId);
    
    if (!orderItem) {
      return res.status(400).json({
        success: false,
        error: `Item with ID ${item.itemId} not found in order`
      });
    }
    
    if (item.quantity > orderItem.quantity) {
      return res.status(400).json({
        success: false,
        error: `Return quantity cannot be greater than ordered quantity for item: ${orderItem.name}`
      });
    }
    
    returnItems.push({
      itemId: item.itemId,
      quantity: item.quantity,
      reason: item.reason || reason,
      status: 'requested',
      requestedAt: new Date()
    });
    
    // Calculate return amount
    returnAmount += (orderItem.price * item.quantity);
  }
  
  // Update order with return request
  order.returnRequested = true;
  order.returnRequestDate = new Date();
  order.returnReason = reason;
  order.returnItems = returnItems;
  order.returnAmount = returnAmount;
  order.updatedBy = req.user.id;
  
  await order.save();
  
  // In a real application, you would notify the admin about the return request
  // and send a confirmation to the user
  
  res.json({
    success: true,
    data: order,
    message: 'Return request submitted successfully. We will process your request shortly.'
  });
});

/**
 * @desc    Get order statistics
 * @route   GET /api/ecommerce/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.getOrderStats();
  
  res.json({
    success: true,
    data: stats
  });
});

// ======================
// Wishlist Controllers (Placeholder implementations)
// ======================

export const getWishlist = asyncHandler(async (req, res) => {
  // Implementation for getting user's wishlist
  res.json({
    success: true,
    data: [],
    message: 'Wishlist retrieved successfully'
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  // Implementation for adding item to wishlist
  res.status(201).json({
    success: true,
    data: {},
    message: 'Item added to wishlist'
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  // Implementation for removing item from wishlist
  res.json({
    success: true,
    data: {},
    message: 'Item removed from wishlist'
  });
});

// ======================
// Review Controllers (Placeholder implementations)
// ======================

export const createReview = asyncHandler(async (req, res) => {
  // Implementation for creating a product review
  res.status(201).json({
    success: true,
    data: {},
    message: 'Review submitted successfully'
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  // Implementation for updating a review
  res.json({
    success: true,
    data: {},
    message: 'Review updated successfully'
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  // Implementation for deleting a review
  res.json({
    success: true,
    data: {},
    message: 'Review deleted successfully'
  });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  // Implementation for getting reviews for a product
  res.json({
    success: true,
    count: 0,
    data: [],
    message: 'Product reviews retrieved successfully'
  });
});

export const getMyReviews = asyncHandler(async (req, res) => {
  // Implementation for getting authenticated user's reviews
  res.json({
    success: true,
    count: 0,
    data: [],
    message: 'Your reviews retrieved successfully'
  });
});

// ======================
// Coupon Controllers (Placeholder implementations)
// ======================

export const validateCoupon = asyncHandler(async (req, res) => {
  // Implementation for validating a coupon
  res.json({
    success: true,
    data: {},
    message: 'Coupon is valid'
  });
});

export const getCoupons = asyncHandler(async (req, res) => {
  // Implementation for getting all coupons (admin only)
  res.json({
    success: true,
    count: 0,
    data: [],
    message: 'Coupons retrieved successfully'
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  // Implementation for creating a coupon (admin only)
  res.status(201).json({
    success: true,
    data: {},
    message: 'Coupon created successfully'
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  // Implementation for updating a coupon (admin only)
  res.json({
    success: true,
    data: {},
    message: 'Coupon updated successfully'
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  // Implementation for deleting a coupon (admin only)
  res.json({
    success: true,
    data: {},
    message: 'Coupon deleted successfully'
  });
});

// ======================
// Shipping Controllers (Placeholder implementations)
// ======================

export const calculateShipping = asyncHandler(async (req, res) => {
  // Implementation for calculating shipping cost
  res.json({
    success: true,
    data: {
      shippingMethods: [],
      estimatedDelivery: ''
    },
    message: 'Shipping calculated successfully'
  });
});

export const getShippingMethods = asyncHandler(async (req, res) => {
  // Implementation for getting available shipping methods
  res.json({
    success: true,
    data: [],
    message: 'Shipping methods retrieved successfully'
  });
});

// ======================
// Payment Controllers (Placeholder implementations)
// ======================

export const createPaymentIntent = asyncHandler(async (req, res) => {
  // Implementation for creating a payment intent
  res.json({
    success: true,
    data: {
      clientSecret: 'pi_3NkXWm2eZvKYlo2C0sXrYgqT_secret_abcdefghijklmnopqrstuvwxyz'
    },
    message: 'Payment intent created successfully'
  });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  // Implementation for confirming a payment
  res.json({
    success: true,
    data: {},
    message: 'Payment confirmed successfully'
  });
});

// ======================
// Analytics Controllers (Placeholder implementations)
// ======================

export const getSalesAnalytics = asyncHandler(async (req, res) => {
  // Implementation for getting sales analytics (admin only)
  res.json({
    success: true,
    data: {},
    message: 'Sales analytics retrieved successfully'
  });
});

export const getProductAnalytics = asyncHandler(async (req, res) => {
  // Implementation for getting product analytics (admin only)
  res.json({
    success: true,
    data: {},
    message: 'Product analytics retrieved successfully'
  });
});

export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  // Implementation for getting customer analytics (admin only)
  res.json({
    success: true,
    data: {},
    message: 'Customer analytics retrieved successfully'
  });
});