import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/responseUtils.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(
        res,
        'User already exists with this email',
        StatusCodes.BAD_REQUEST
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
    });

    // Create profile for the user
    await Profile.create({ user: user._id });

    // Get token
    const token = user.getSignedJwtToken();

    // Create cookie options
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    // Send response with token
    return successResponse(
      res,
      { token },
      'User registered successfully',
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error during registration',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return errorResponse(
        res,
        'Please provide an email and password',
        StatusCodes.BAD_REQUEST
      );
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(
        res,
        'Invalid credentials',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(
        res,
        'Invalid credentials',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(
        res,
        'Your account has been deactivated. Please contact support.',
        StatusCodes.FORBIDDEN
      );
    }

    // Create token
    const token = user.getSignedJwtToken();

    // Create cookie options
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    // Send response with token
    return successResponse(
      res,
      { token },
      'User logged in successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error during login',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('profile');
    
    if (!user) {
      return errorResponse(
        res,
        'User not found',
        StatusCodes.NOT_FOUND
      );
    }

    return successResponse(
      res,
      user,
      'User profile retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while fetching user profile',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return errorResponse(
        res,
        'No user found with that email',
        StatusCodes.NOT_FOUND
      );
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    // TODO: Send email with reset URL
    console.log(`Password reset token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);

    return successResponse(
      res,
      { email: user.email },
      'Password reset email sent',
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    
    // Reset token and expire
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return errorResponse(
      res,
      'Email could not be sent',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(
        res,
        'Invalid token or token has expired',
        StatusCodes.BAD_REQUEST
      );
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    return successResponse(
      res,
      { token },
      'Password reset successful',
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while resetting password',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    return successResponse(
      res,
      user,
      'User details updated successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while updating user details',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return errorResponse(
        res,
        'Current password is incorrect',
        StatusCodes.UNAUTHORIZED
      );
    }

    user.password = req.body.newPassword;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    return successResponse(
      res,
      { token },
      'Password updated successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while updating password',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
    });

    return successResponse(
      res,
      {},
      'User logged out successfully',
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error during logout',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};