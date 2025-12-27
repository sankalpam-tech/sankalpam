import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price images slug stock')
    .lean();
  
  if (!cart) {
    return res.json({
      success: true,
      data: {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0
      }
    });
  }
  
  // Calculate totals
  let subtotal = 0;
  let itemCount = 0;
  
  cart.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemCount += item.quantity;
  });
  
  const total = subtotal; // Add shipping, tax, etc. if needed
  
  res.json({
    success: true,
    data: {
      ...cart,
      subtotal,
      total,
      itemCount
    }
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, selectedVariant, selectedOptions } = req.body;
  
  // Get product
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if product is in stock
  if (!product.isInStock(quantity)) {
    res.status(400);
    throw new Error(`Only ${product.stock} items available in stock`);
  }
  
  // Get or create user's cart
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: []
    });
  }
  
  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );
  
  if (existingItemIndex > -1) {
    // Update quantity if already in cart
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      selectedVariant,
      selectedOptions
    });
  }
  
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images slug stock');
  
  // Calculate totals
  let subtotal = 0;
  let itemCount = 0;
  
  cart.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemCount += item.quantity;
  });
  
  const total = subtotal; // Add shipping, tax, etc. if needed
  
  res.status(201).json({
    success: true,
    data: {
      ...cart.toObject(),
      subtotal,
      total,
      itemCount
    }
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/items/:itemId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  
  if (quantity < 1) {
    return removeFromCart(req, res);
  }
  
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  const itemIndex = cart.items.findIndex(
    item => item._id.toString() === itemId
  );
  
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
  
  // Check if enough stock available
  if (quantity > product.stock + cart.items[itemIndex].quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items available in stock`);
  }
  
  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images slug stock');
  
  // Calculate totals
  let subtotal = 0;
  let itemCount = 0;
  
  cart.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemCount += item.quantity;
  });
  
  const total = subtotal; // Add shipping, tax, etc. if needed
  
  res.json({
    success: true,
    data: {
      ...cart.toObject(),
      subtotal,
      total,
      itemCount
    }
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  
  const itemIndex = cart.items.findIndex(
    item => item._id.toString() === itemId
  );
  
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }
  
  // Remove item from cart
  cart.items.splice(itemIndex, 1);
  await cart.save();
  
  // Populate product details
  await cart.populate('items.product', 'name price images slug stock');
  
  // Calculate totals
  let subtotal = 0;
  let itemCount = 0;
  
  cart.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemCount += item.quantity;
  });
  
  const total = subtotal; // Add shipping, tax, etc. if needed
  
  res.json({
    success: true,
    data: {
      ...cart.toObject(),
      subtotal,
      total,
      itemCount
    }
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return res.json({
      success: true,
      data: {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0
      }
    });
  }
  
  // Clear cart items
  cart.items = [];
  await cart.save();
  
  res.json({
    success: true,
    data: {
      items: [],
      subtotal: 0,
      total: 0,
      itemCount: 0
    }
  });
});

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
