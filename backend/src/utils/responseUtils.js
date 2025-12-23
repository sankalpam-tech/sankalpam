import { StatusCodes } from 'http-status-codes';

/**
 * Success Response Handler
 * @param {Object} res - Express response object
 * @param {Object} data - Data to be sent in response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (
  res,
  data = {},
  message = 'Success',
  statusCode = StatusCodes.OK
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response Handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Additional error details
 */
export const errorResponse = (
  res,
  message = 'Internal Server Error',
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  errors = {}
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(errors).length === 0 ? undefined : errors,
  });
};

/**
 * Not Found Response Handler
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
export const notFoundResponse = (res, resource = 'Resource') => {
  errorResponse(
    res,
    `${resource} not found`,
    StatusCodes.NOT_FOUND
  );
};

/**
 * Validation Error Response Handler
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 */
export const validationErrorResponse = (res, errors) => {
  errorResponse(
    res,
    'Validation Error',
    StatusCodes.UNPROCESSABLE_ENTITY,
    errors
  );
};