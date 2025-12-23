/**
 * Custom ErrorResponse class to handle API errors
 * @extends Error
 */
class ErrorResponse extends Error {
  /**
   * Create a new ErrorResponse
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} [errors] - Additional error details
   */
  constructor(message, statusCode, errors = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // This is to distinguish operational errors from programming errors

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   * @param {string} message - Error message
   * @param {Object} errors - Additional error details
   * @returns {ErrorResponse}
   */
  static badRequest(message = 'Bad Request', errors = {}) {
    return new ErrorResponse(message, 400, errors);
  }

  /**
   * Create a 401 Unauthorized error
   * @param {string} message - Error message
   * @returns {ErrorResponse}
   */
  static unauthorized(message = 'Not authorized to access this route') {
    return new ErrorResponse(message, 401);
  }

  /**
   * Create a 403 Forbidden error
   * @param {string} message - Error message
   * @returns {ErrorResponse}
   */
  static forbidden(message = 'Forbidden') {
    return new ErrorResponse(message, 403);
  }

  /**
   * Create a 404 Not Found error
   * @param {string} resource - Name of the resource that was not found
   * @returns {ErrorResponse}
   */
  static notFound(resource = 'Resource') {
    return new ErrorResponse(`${resource} not found`, 404);
  }

  /**
   * Create a 409 Conflict error
   * @param {string} message - Error message
   * @returns {ErrorResponse}
   */
  static conflict(message = 'Conflict') {
    return new ErrorResponse(message, 409);
  }

  /**
   * Create a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @param {Object} errors - Validation errors
   * @returns {ErrorResponse}
   */
  static validationError(message = 'Validation failed', errors = {}) {
    return new ErrorResponse(message, 422, errors);
  }

  /**
   * Create a 500 Internal Server Error
   * @param {string} message - Error message
   * @returns {ErrorResponse}
   */
  static serverError(message = 'Internal Server Error') {
    return new ErrorResponse(message, 500);
  }

  /**
   * Format error response for API
   * @param {Error} err - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static handle(err, req, res, next) {
    // Default to 500 server error
    let error = { ...err };
    error.message = err.message;

    // Log to console for development
    console.error(err.stack.red);

    // Handle specific error types
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Resource not found with id of ${err.value}`;
      error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate field value: ${field}. Please use another value`;
      error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = 'Validation failed';
      const errors = {};
      
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
      
      error = new ErrorResponse(message, 400, { errors });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token';
      error = new ErrorResponse(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
      const message = 'Token expired';
      error = new ErrorResponse(message, 401);
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error',
      ...(error.errors && { errors: error.errors })
    });
  }
}

export default ErrorResponse;