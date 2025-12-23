import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { successResponse, errorResponse, notFoundResponse } from '../utils/responseUtils.js';

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return successResponse(
      res,
      { count: users.length, users },
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving users',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('profile');
    
    if (!user) {
      return notFoundResponse(res, 'User');
    }

    return successResponse(
      res,
      user,
      'User retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving user',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Build profile fields
    const profileFields = {};
    const { dateOfBirth, gender, gotram, nakshatra, rashi, bio, address, social } = req.body;
    
    if (dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
    if (gender) profileFields.gender = gender;
    if (gotram) profileFields.gotram = gotram;
    if (nakshatra) profileFields.nakshatra = nakshatra;
    if (rashi) profileFields.rashi = rashi;
    if (bio) profileFields.bio = bio;
    if (address) profileFields.address = address;
    if (social) profileFields.social = social;

    // Update user
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;

    // Update user
    if (Object.keys(userFields).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userFields },
        { new: true, runValidators: true }
      );
      
      if (!updatedUser) {
        return notFoundResponse(res, 'User');
      }
    }

    // Update or create profile
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = new Profile({
        user: req.user.id,
        ...profileFields
      });
      await profile.save();
    }

    // Get updated user with profile
    const user = await User.findById(req.user.id).select('-password').populate('profile');

    return successResponse(
      res,
      user,
      'Profile updated successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while updating profile',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Upload profile photo
// @route   PUT /api/v1/users/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(
        res,
        'Please upload a file',
        StatusCodes.BAD_REQUEST
      );
    }

    const file = req.file;
    
    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return errorResponse(
        res,
        'Please upload an image file',
        StatusCodes.BAD_REQUEST
      );
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return errorResponse(
        res,
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Update profile photo
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { profilePhoto: file.filename },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return notFoundResponse(res, 'Profile');
    }

    return successResponse(
      res,
      { profilePhoto: file.filename },
      'Profile photo updated successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while uploading photo',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return notFoundResponse(res, 'User');
    }

    return successResponse(
      res,
      user,
      'User updated successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while updating user',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return notFoundResponse(res, 'User');
    }

    // This will trigger the pre('remove') middleware to delete the profile
    await user.remove();

    return successResponse(
      res,
      {},
      'User removed successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while deleting user',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
