import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/responseUtils.js';
import { StatusCodes } from 'http-status-codes';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return errorResponse(
      res,
      'Not authorized to access this route',
      StatusCodes.UNAUTHORIZED
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(
        res,
        'The user belonging to this token no longer exists',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(
        res,
        'User account has been deactivated',
        StatusCodes.FORBIDDEN
      );
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Not authorized to access this route',
      StatusCodes.UNAUTHORIZED
    );
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `User role ${req.user.role} is not authorized to access this route`,
        StatusCodes.FORBIDDEN
      );
    }
    next();
  };
};

// Check if user is logged in (for optional authentication)
export const optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const user = await User.findOne({ _id: decoded.id, isActive: true });
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error(error);
    next();
  }
};