import { validationResult } from 'express-validator';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    if (typeof next === 'function') {
      return next();
    }
    // If next is not a function but res is available, send success response
    if (res && typeof res.status === 'function') {
      return res.status(200).json({ success: true });
    }
    // If neither next nor res is available, just return
    return;
  }
  
  // Format errors
  const extractedErrors = [];
  errors.array().forEach(err => {
    if (err && err.path) {
      extractedErrors.push({ [err.path]: err.msg });
    }
  });
  
  const error = new ErrorResponse('Validation failed', 422, {
    errors: extractedErrors
  });
  
  if (typeof next === 'function') {
    return next(error);
  }
  
  // If next is not a function but res is available, send error response
  if (res && typeof res.status === 'function') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  // If we can't handle the error, log it and throw
  console.error('Validation failed but no way to handle error:', error);
  throw error;
};

/**
 * Middleware to validate request body against a schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
export const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message.replace(/"/g, '')
    }));

    return next(
      new ErrorResponse('Validation failed', 400, { errors })
    );
  }

  // Replace req.body with the validated value
  req.body = value;
  next();
};

/**
 * Middleware to validate request query parameters against a schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
export const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message.replace(/"/g, '')
    }));

    return next(
      new ErrorResponse('Invalid query parameters', 400, { errors })
    );
  }

  // Replace req.query with the validated value
  req.query = value;
  next();
};

/**
 * Middleware to validate request params against a schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
export const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message.replace(/"/g, '')
    }));

    return next(
      new ErrorResponse('Invalid URL parameters', 400, { errors })
    );
  }

  // Replace req.params with the validated value
  req.params = value;
  next();
};