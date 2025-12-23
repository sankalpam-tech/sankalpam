/**
 * Async handler to wrap around async route handlers
 * This eliminates the need for try/catch blocks in async route handlers
 * and ensures that errors are passed to the Express error handling middleware
 * 
 * @param {Function} fn - The async route handler function
 * @returns {Function} A new function that handles async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Return a new function that wraps the original async function
  // and catches any errors, passing them to the next middleware
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;