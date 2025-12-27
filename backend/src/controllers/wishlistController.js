import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const { items, pagination } = await Wishlist.getUserWishlist(req.user.id, page, limit);
  
  res.json({
    success: true,
    count: items.length,
    pagination,
    data: items
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, notes } = req.body;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if already in wishlist
  const existingItem = await Wishlist.findOne({
    user: req.user.id,
    product: productId
  });
  
  if (existingItem) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }
  
  // Add to wishlist
  const wishlistItem = await Wishlist.create({
    user: req.user.id,
    product: productId,
    notes
  });
  
  // Populate product details
  await wishlistItem.populate('product', 'name price images slug');
  
  res.status(201).json({
    success: true,
    data: wishlistItem
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const deletedItem = await Wishlist.findOneAndDelete({
    user: req.user.id,
    product: productId
  });
  
  if (!deletedItem) {
    res.status(404);
    throw new Error('Item not found in wishlist');
  }
  
  res.json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/wishlist/:productId
 * @access  Private
 */
export const checkInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const isInWishlist = await Wishlist.isInWishlist(req.user.id, productId);
  
  res.json({
    success: true,
    data: {
      isInWishlist
    }
  });
});

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist
};
