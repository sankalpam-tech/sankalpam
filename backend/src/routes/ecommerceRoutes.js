import express from 'express';
import { validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validator.js';
import { 
  productController,
  cartController,
  orderController,
  wishlistController,
  ecommerceController 
} from '../controllers/index.js';
import ecommerceValidator, { fileUploadValidation } from '../middleware/validators/ecommerceValidator.js';

const {
  query: queryValidationRules,
  category: categoryValidationRules,
  id: idValidationRules,
  product: productValidationRules,
  cart: cartValidationRules,
  order: orderValidationRules,
  cartItem: cartItemValidationRules,
  orderStatus: orderStatusValidationRules,
  paymentStatus: paymentStatusValidationRules,
  wishlist: wishlistValidationRules
} = ecommerceValidator;

const router = express.Router();

// Log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Helper function to wrap async handlers with error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ======================
// Product Routes
// ======================
router.route('/products')
  .get(
    queryValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(productController.getProducts)
  )
  .post(
    protect,
    authorize('admin'),
    productValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(productController.createProduct)
  );

router.route('/products/search')
  .get(
    queryValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(productController.searchProducts)
  );

router.route('/products/category/:category')
  .get(
    queryValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(productController.getProductsByCategory)
  );

router.route('/products/featured')
  .get(
    asyncHandler(productController.getFeaturedProducts)
  );

router.route('/products/new-arrivals')
  .get(
    asyncHandler(productController.getNewArrivals)
  );

router.route('/products/best-sellers')
  .get(
    asyncHandler(productController.getBestSellers)
  );

router.route('/products/:id')
  .get(
    idValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(productController.getProductById)
  )
  .put(
    protect,
    authorize('admin'),
    [...idValidationRules, ...productValidationRules],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(productController.updateProduct)
  )
  .delete(
    protect,
    authorize('admin'),
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(productController.deleteProduct)
  );

// Product Images
router.route('/products/:id/images')
  .post(
    protect,
    authorize('admin'),
    (req, res, next) => validate(idValidationRules)(req, res, next),
    fileUploadValidation,
    asyncHandler(productController.uploadProductImages)
  )
  .delete(
    protect,
    authorize('admin'),
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(productController.deleteProductImage)
  );

// ======================
// Category Routes
// ======================
router.route('/categories')
  .get(
    queryValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(ecommerceController.getCategories)
  )
  .post(
    protect, 
    authorize('admin'), 
    categoryValidationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    asyncHandler(ecommerceController.createCategory)
  );

router.route('/categories/tree')
  .get(
    // (req, res, next) => validate([])(req, res, next), 
    asyncHandler(ecommerceController.getCategoryTree)
  );

router.route('/categories/:id')
  .get(
    (req, res, next) => validate(idValidationRules)(req, res, next), 
    asyncHandler(ecommerceController.getCategory)
  )
  .put(
    protect, 
    authorize('admin'), 
    (req, res, next) => validate([...idValidationRules, ...categoryValidationRules])(req, res, next), 
    asyncHandler(ecommerceController.updateCategory)
  )
  .delete(
    protect, 
    authorize('admin'), 
    (req, res, next) => validate(idValidationRules)(req, res, next), 
    asyncHandler(ecommerceController.deleteCategory)
  );

router.route('/categories/:id/image')
  .post(
    protect, 
    authorize('admin'), 
    (req, res, next) => validate(idValidationRules)(req, res, next),
    fileUploadValidation,
    asyncHandler(ecommerceController.uploadCategoryImage)
  );

// ======================
// Cart Routes
// ======================
router.route('/cart')
  .get(
    protect,
    asyncHandler(cartController.getCart)
  )
  .post(
    protect,
    (req, res, next) => validate(cartValidationRules)(req, res, next),
    asyncHandler(cartController.addToCart)
  )
  .delete(
    protect,
    asyncHandler(cartController.clearCart)
  );

router.route('/cart/items/:itemId')
  .put(
    protect,
    (req, res, next) => validate([...idValidationRules, ...cartItemValidationRules])(req, res, next),
    asyncHandler(cartController.updateCartItem)
  )
  .delete(
    protect,
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(cartController.removeFromCart)
  );

// ======================
// Wishlist Routes
// ======================
router.route('/wishlist')
  .get(
    protect,
    (req, res, next) => validate(queryValidationRules)(req, res, next),
    asyncHandler(wishlistController.getWishlist)
  )
  .post(
    protect,
    (req, res, next) => validate(wishlistValidationRules)(req, res, next),
    asyncHandler(wishlistController.addToWishlist)
  );

router.route('/wishlist/:productId')
  .delete(
    protect,
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(wishlistController.removeFromWishlist)
  )
  .get(
    protect,
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(wishlistController.checkInWishlist)
  );

// ======================
// Order Routes
// ======================
router.route('/orders')
  .get(
    protect,
    (req, res, next) => validate(queryValidationRules)(req, res, next),
    asyncHandler(orderController.getOrders)
  )
  .post(
    protect,
    (req, res, next) => validate(orderValidationRules)(req, res, next),
    asyncHandler(orderController.createOrder)
  );

router.route('/orders/:id')
  .get(
    protect,
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(orderController.getOrderById)
  )
  .put(
    protect,
    (req, res, next) => validate([...idValidationRules, ...orderStatusValidationRules])(req, res, next),
    asyncHandler(orderController.updateOrderStatus)
  )
  .delete(
    protect,
    (req, res, next) => validate(idValidationRules)(req, res, next),
    asyncHandler(orderController.cancelOrder)
  );

router.route('/orders/:id/payment-status')
  .put(
    protect,
    (req, res, next) => validate([...idValidationRules, ...paymentStatusValidationRules])(req, res, next),
    asyncHandler(orderController.updatePaymentStatus)
  );

// ======================
// Checkout Routes
// ======================
router.route('/checkout/shipping-methods')
  .get(
    protect,
    asyncHandler(orderController.getShippingMethods)
  );

router.route('/checkout/calculate-shipping')
  .post(
    protect,
    asyncHandler(orderController.calculateShipping)
  );

// Export the router
export default router;