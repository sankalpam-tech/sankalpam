import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  // Build query
  const query = {};
  
  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = parseFloat(req.query.maxPrice);
    }
  }
  
  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Sort
  let sort = {};
  switch (req.query.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'popular':
      sort = { rating: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: products
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('relatedProducts', 'name price images slug');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Increment view count
  product.views += 1;
  await product.save();
  
  res.json({
    success: true,
    data: product
  });
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, sku } = req.body;
  
  // Check if category exists
  const categoryExists = await ProductCategory.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Category not found');
  }
  
  // Generate SKU if not provided
  let productSku = sku;
  if (!productSku) {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    productSku = `${prefix}-${random}`;
  }
  
  // Create product
  const product = new Product({
    name,
    description,
    price,
    category,
    stock: stock || 0,
    sku: productSku,
    slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().substring(0, 6)}`,
    createdBy: req.user._id 
  });
  
  await product.save();
  
  res.status(201).json({
    success: true,
    data: product
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Update fields
  const { name, description, price, category, stock, sku } = req.body;
  
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (stock !== undefined) product.stock = stock;
  if (sku) product.sku = sku;
  
  // If name changed, update slug
  if (name && name !== product.name) {
    product.slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().substring(0, 6)}`;
  }
  
  await product.save();
  
  res.json({
    success: true,
    data: product
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // TODO: Check if product is in any orders before deleting
  
  await product.deleteOne();
  
  res.json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  
  const products = await Product.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @desc    Get new arrivals
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const products = await Product.find({
    createdAt: { $gte: oneMonthAgo }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @desc    Get best sellers
 * @route   GET /api/products/best-sellers
 * @access  Public
 */
export const getBestSellers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  
  const products = await Product.find({})
    .sort({ 'salesCount': -1 })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  
  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }
  
  const query = { $text: { $search: q } };
  
  // Apply filters
  if (category) {
    query.category = category;
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  // Sort
  let sortOption = {};
  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'popular':
      sortOption = { rating: -1 };
      break;
    default:
      sortOption = { score: { $meta: 'textScore' } };
  }
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: products
  });
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  // Find category by slug or ID
  const categoryDoc = await ProductCategory.findOne({
    $or: [
      { _id: category },
      { slug: category }
    ]
  });
  
  if (!categoryDoc) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Build query
  const query = {
    $or: [
      { category: categoryDoc._id },
      { 'categoryTree': categoryDoc._id }
    ]
  };
  
  // Apply price filter if provided
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }
  
  // Sort
  let sort = {};
  switch (req.query.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'popular':
      sort = { rating: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  res.json({
    success: true,
    category: categoryDoc,
    count: products.length,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: products
  });
});

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  searchProducts,
  getProductsByCategory
};
