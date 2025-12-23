import { body, param, query } from 'express-validator';
import Product from '../../models/Product.js';
import ProductCategory from '../../models/ProductCategory.js';
import Cart from '../../models/Cart.js';
import Order from '../../models/Order.js';

// Product Category Validation
export const categoryValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name cannot be more than 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
    
  body('parentCategory')
    .optional()
    .isMongoId().withMessage('Invalid parent category ID')
    .custom(async (value) => {
      if (value) {
        const category = await ProductCategory.findById(value);
        if (!category) {
          throw new Error('Parent category not found');
        }
      }
      return true;
    }),
    
  body('isActive')
    .optional()
    .isBoolean().withMessage('Active status must be a boolean value'),
    
  body('seoTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('SEO title cannot be more than 100 characters'),
    
  body('seoDescription')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('SEO description cannot be more than 200 characters'),
    
  body('seoKeywords')
    .optional()
    .isArray().withMessage('SEO keywords must be an array'),
    
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

// Product Validation
export const productValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot be more than 200 characters'),
    
  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required'),
    
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Short description cannot be more than 500 characters'),
    
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),
    
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Compare at price must be a positive number')
    .toFloat(),
    
  body('costPerItem')
    .optional()
    .isFloat({ min: 0 }).withMessage('Cost per item must be a positive number')
    .toFloat(),
    
  body('category')
    .isMongoId().withMessage('Invalid category ID')
    .custom(async (value) => {
      const category = await ProductCategory.findById(value);
      if (!category) {
        throw new Error('Category not found');
      }
      return true;
    }),
    
  body('subcategory')
    .optional()
    .isMongoId().withMessage('Invalid subcategory ID')
    .custom(async (value, { req }) => {
      if (value) {
        const subcategory = await ProductCategory.findOne({
          _id: value,
          parentCategory: req.body.category
        });
        if (!subcategory) {
          throw new Error('Subcategory not found or does not belong to the selected category');
        }
      }
      return true;
    }),
    
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),
    
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('SKU cannot be more than 50 characters'),
    
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Barcode cannot be more than 50 characters'),
    
  body('weight.value')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    
  body('weight.unit')
    .optional()
    .isIn(['g', 'kg', 'lb', 'oz']).withMessage('Invalid weight unit'),
    
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 }).withMessage('Length must be a positive number'),
    
  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 }).withMessage('Width must be a positive number'),
    
  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 }).withMessage('Height must be a positive number'),
    
  body('dimensions.unit')
    .optional()
    .isIn(['mm', 'cm', 'm', 'in', 'ft']).withMessage('Invalid dimension unit'),
    
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),
    
  body('images.*.url')
    .if((value, { req }) => req.body.images && req.body.images.length > 0)
    .notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Invalid image URL'),
    
  body('images.*.altText')
    .optional()
    .trim()
    .isLength({ max: 125 }).withMessage('Alt text cannot be more than 125 characters'),
    
  body('variants')
    .optional()
    .isArray().withMessage('Variants must be an array'),
    
  body('variants.*.name')
    .if((value, { req }) => req.body.variants && req.body.variants.length > 0)
    .notEmpty().withMessage('Variant name is required')
    .trim(),
    
  body('variants.*.values')
    .if((value, { req }) => req.body.variants && req.body.variants.length > 0)
    .isArray({ min: 1 }).withMessage('Variant must have at least one value')
    .custom(values => {
      if (values.some(val => typeof val !== 'string' || val.trim() === '')) {
        throw new Error('Variant values must be non-empty strings');
      }
      return true;
    }),
    
  body('options')
    .optional()
    .isArray().withMessage('Options must be an array'),
    
  body('options.*.name')
    .if((value, { req }) => req.body.options && req.body.options.length > 0)
    .notEmpty().withMessage('Option name is required')
    .trim(),
    
  body('options.*.values')
    .if((value, { req }) => req.body.options && req.body.options.length > 0)
    .isArray({ min: 1 }).withMessage('Option must have at least one value')
    .custom(values => {
      if (values.some(val => typeof val !== 'string' || val.trim() === '')) {
        throw new Error('Option values must be non-empty strings');
      }
      return true;
    }),
    
  body('isActive')
    .optional()
    .isBoolean().withMessage('Active status must be a boolean value'),
    
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('Featured status must be a boolean value'),
    
  body('isBestSeller')
    .optional()
    .isBoolean().withMessage('Best seller status must be a boolean value'),
    
  body('isNewArrival')
    .optional()
    .isBoolean().withMessage('New arrival status must be a boolean value'),
    
  body('isDigital')
    .optional()
    .isBoolean().withMessage('Digital status must be a boolean value'),
    
  body('isService')
    .optional()
    .isBoolean().withMessage('Service status must be a boolean value'),
    
  body('requiresShipping')
    .optional()
    .isBoolean().withMessage('Requires shipping must be a boolean value'),
    
  body('isTaxable')
    .optional()
    .isBoolean().withMessage('Taxable status must be a boolean value'),
    
  body('taxCode')
    .optional()
    .trim(),
    
  body('seoTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('SEO title cannot be more than 100 characters'),
    
  body('seoDescription')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('SEO description cannot be more than 200 characters'),
    
  body('seoKeywords')
    .optional()
    .isArray().withMessage('SEO keywords must be an array'),
    
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
    
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Each tag must be between 1 and 50 characters')
];

// Cart Validation
export const cartValidationRules = [
  body('items')
    .optional()
    .isArray().withMessage('Items must be an array'),
    
  body('items.*.product')
    .if((value, { req }) => req.body.items && req.body.items.length > 0)
    .isMongoId().withMessage('Invalid product ID')
    .custom(async (value) => {
      const product = await Product.findOne({ _id: value, isActive: true });
      if (!product) {
        throw new Error('Product not found or inactive');
      }
      return true;
    }),
    
  body('items.*.quantity')
    .if((value, { req }) => req.body.items && req.body.items.length > 0)
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt(),
    
  body('items.*.selectedVariant')
    .optional()
    .isObject().withMessage('Selected variant must be an object'),
    
  body('items.*.selectedOptions')
    .optional()
    .isArray().withMessage('Selected options must be an array'),
    
  body('coupon')
    .optional()
    .isString().withMessage('Coupon must be a string')
    .trim(),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot be more than 500 characters')
];

// Order Validation
export const orderValidationRules = [
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required')
    .custom((value, { req }) => {
      const requiredFields = ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'postalCode', 'country'];
      const missingFields = requiredFields.filter(field => !value[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required shipping address fields: ${missingFields.join(', ')}`);
      }
      
      return true;
    }),
    
  body('billingAddress')
    .optional()
    .isObject().withMessage('Billing address must be an object'),
    
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .trim(),
    
  body('customerNote')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Customer note cannot be more than 500 characters'),
    
  body('createAccount')
    .optional()
    .isBoolean().withMessage('Create account must be a boolean value'),
    
  body('terms')
    .optional()
    .isBoolean({ strict: true }).withMessage('You must accept the terms and conditions')
    .isIn([true]).withMessage('You must accept the terms and conditions')
];

// Query Parameters Validation
export const queryValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
    
  query('sort')
    .optional()
    .trim()
    .matches(/^(-?[a-zA-Z]+\s?(?:,[a-zA-Z]+\s?)*)$/).withMessage('Invalid sort parameter format. Use: field1,field2,-field3'),
    
  query('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
    
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number')
    .toFloat(),
    
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minPrice && value < req.query.minPrice) {
        throw new Error('Maximum price must be greater than or equal to minimum price');
      }
      return true;
    }),
    
  query('inStock')
    .optional()
    .isBoolean().withMessage('In stock must be a boolean value'),
    
  query('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean value'),
    
  query('newArrival')
    .optional()
    .isBoolean().withMessage('New arrival must be a boolean value'),
    
  query('bestSeller')
    .optional()
    .isBoolean().withMessage('Best seller must be a boolean value'),
    
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot be more than 100 characters'),
    
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
    .toInt()
];

// ID Parameter Validation
export const idValidationRules = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
    .custom(async (value, { req }) => {
      const model = req.baseUrl.includes('categories') ? 'Category' : 
                   req.baseUrl.includes('products') ? 'Product' :
                   req.baseUrl.includes('orders') ? 'Order' : null;
      
      if (!model) return true;
      
      const Model = {
        'Category': ProductCategory,
        'Product': Product,
        'Order': Order
      }[model];
      
      const doc = await Model.findById(value);
      
      if (!doc) {
        throw new Error(`${model} not found`);
      }
      
      // Attach document to request for later use in controller
      req[model.toLowerCase()] = doc;
      
      return true;
    })
];

// Cart Item Validation
export const cartItemValidationRules = [
  param('id')
    .isMongoId().withMessage('Invalid cart item ID')
    .custom(async (value, { req }) => {
      const cart = await Cart.findOne({ user: req.user.id });
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      const item = cart.items.id(value);
      
      if (!item) {
        throw new Error('Item not found in cart');
      }
      
      // Attach cart and item to request for later use in controller
      req.cart = cart;
      req.cartItem = item;
      
      return true;
    })
];

// Order Status Update Validation
export const orderStatusValidationRules = [
  param('id')
    .isMongoId().withMessage('Invalid order ID')
    .custom(async (value, { req }) => {
      const order = await Order.findById(value);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if user is authorized to update this order
      if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
        throw new Error('Not authorized to update this order');
      }
      
      // Attach order to request for later use in controller
      req.order = order;
      
      return true;
    }),
    
  body('status')
    .isIn([
      'pending',
      'processing',
      'on_hold',
      'completed',
      'cancelled',
      'refunded',
      'failed',
      'trash'
    ]).withMessage('Invalid order status'),
    
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Admin note cannot be more than 500 characters')
];

// Payment Status Update Validation
export const paymentStatusValidationRules = [
  param('id')
    .isMongoId().withMessage('Invalid order ID')
    .custom(async (value, { req }) => {
      const order = await Order.findById(value);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if user is authorized to update this order
      if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
        throw new Error('Not authorized to update this order');
      }
      
      // Attach order to request for later use in controller
      req.order = order;
      
      return true;
    }),
    
  body('paymentStatus')
    .isIn([
      'pending',
      'authorized',
      'paid',
      'partially_refunded',
      'refunded',
      'voided',
      'failed'
    ]).withMessage('Invalid payment status'),
    
  body('transactionId')
    .optional()
    .trim(),
    
  body('paymentDetails')
    .optional()
    .isObject().withMessage('Payment details must be an object')
];

// File Upload Validation
export const fileUploadValidation = (req, res, next) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }
  
  const file = req.files.file;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    });
  }
  
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: 'File size must be less than 5MB'
    });
  }
  
  next();
};

// Export all validations
export default {
  category: categoryValidationRules,
  product: productValidationRules,
  cart: cartValidationRules,
  order: orderValidationRules,
  query: queryValidationRules,
  id: idValidationRules,
  cartItem: cartItemValidationRules,
  orderStatus: orderStatusValidationRules,
  paymentStatus: paymentStatusValidationRules,
  fileUpload: fileUploadValidation
};