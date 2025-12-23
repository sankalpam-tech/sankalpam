import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import * as ecommerceController from '../controllers/ecommerceController.js';
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
  paymentStatus: paymentStatusValidationRules
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
// Category Routes
// ======================
router.route('/categories')
  .get((req, res, next) => validate(queryValidationRules)(req, res, next), asyncHandler(ecommerceController.getCategories))
  .post(
    protect, 
    authorize('admin'), 
    (req, res, next) => validate(categoryValidationRules)(req, res, next), 
    asyncHandler(ecommerceController.createCategory)
  );

router.route('/categories/tree')
  .get((req, res, next) => validate([])(req, res, next), asyncHandler(ecommerceController.getCategoryTree));

router.route('/categories/:id')
  .get((req, res, next) => validate(idValidationRules)(req, res, next), asyncHandler(ecommerceController.getCategory))
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

// Export the router
export default router;