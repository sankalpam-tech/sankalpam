import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { 
    shippingAddress, 
    billingAddress, 
    paymentMethod, 
    shippingMethod,
    notes 
  } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price stock');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('No items in cart');
  }

  // Calculate order total and validate stock
  let subtotal = 0;
  const orderItems = [];
  const outOfStockItems = [];
  const insufficientStockItems = [];

  // Process each cart item
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    
    if (!product) {
      res.status(400);
      throw new Error(`Product not found: ${item.product.name}`);
    }

    // Check stock
    if (product.stock === 0) {
      outOfStockItems.push(product.name);
      continue;
    }

    if (product.stock < item.quantity) {
      insufficientStockItems.push({
        name: product.name,
        requested: item.quantity,
        available: product.stock
      });
      continue;
    }

    // Calculate item total
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Add to order items
    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: itemTotal,
      selectedVariant: item.selectedVariant,
      selectedOptions: item.selectedOptions
    });

    // Update product stock
    product.stock -= item.quantity;
    product.salesCount += item.quantity;
    await product.save();
  }

  // Check for out of stock or insufficient stock items
  if (outOfStockItems.length > 0 || insufficientStockItems.length > 0) {
    res.status(400);
    throw new Error('Some items are out of stock or have insufficient quantity', {
      outOfStockItems,
      insufficientStockItems
    });
  }

  // Calculate shipping and tax (simplified)
  const shipping = 0; // TODO: Calculate based on shipping method
  const tax = subtotal * 0.1; // 10% tax (example)
  const total = subtotal + shipping + tax;

  // Create order
  const order = new Order({
    orderNumber: `ORD-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`,
    user: req.user.id,
    items: orderItems,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingMethod,
    notes,
    status: 'pending',
    paymentStatus: 'pending'
  });

  await order.save();

  // Clear the cart after successful order
  await Cart.findOneAndDelete({ user: req.user.id });

  res.status(201).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images'),
    Order.countDocuments({ user: req.user.id })
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: orders
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('items.product', 'name images slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Update status
  order.status = status;
  order.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: req.user.id,
    notes: req.body.notes || ''
  });
  
  await order.save();
  
  // TODO: Send status update email to customer
  
  res.json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update payment status
 * @route   PUT /api/orders/:id/payment-status
 * @access  Private/Admin
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, transactionId, paymentMethod } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Update payment status
  order.paymentStatus = status;
  order.paymentDetails = {
    ...order.paymentDetails,
    transactionId,
    paymentMethod,
    updatedAt: new Date()
  };
  
  // If payment is completed, update order status to processing
  if (status === 'paid' && order.status === 'pending') {
    order.status = 'processing';
    order.statusHistory.push({
      status: 'processing',
      changedAt: new Date(),
      changedBy: req.user.id,
      notes: 'Payment received, order is now being processed.'
    });
  }
  
  await order.save();
  
  // TODO: Send payment confirmation email to customer
  
  res.json({
    success: true,
    data: order
  });
});

/**
 * @desc    Cancel order
 * @route   DELETE /api/orders/:id
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Only allow cancellation if order is not already shipped or delivered
  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }
  
  // Update order status
  order.status = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    changedAt: new Date(),
    changedBy: req.user.id,
    notes: 'Order cancelled by customer.'
  });
  
  // Restock products
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity, salesCount: -item.quantity } }
    );
  }
  
  await order.save();
  
  // TODO: Send cancellation confirmation email
  
  res.json({
    success: true,
    data: order
  });
});

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
};
