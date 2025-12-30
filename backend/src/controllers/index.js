// Import all controllers
import * as productController from './productController.js';
import * as cartController from './cartController.js';
import * as orderController from './orderController.js';
import * as wishlistController from './wishlistController.js';
import * as ecommerceController from './ecommerceController.js';

// Export all controllers
export {
  // Product related controllers
  productController,
  
  // Cart related controllers
  cartController,
  
  // Order related controllers
  orderController,
  
  // Wishlist related controllers
  wishlistController,
  
  // Other ecommerce controllers
  ecommerceController
};

// Export a default object with all controllers for backward compatibility
export default {
  ...productController,
  ...cartController,
  ...orderController,
  ...wishlistController,
  ...ecommerceController
};
