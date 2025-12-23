import PujaCategory from '../models/PujaCategory.js';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '../utils/responseUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all puja categories
// @route   GET /api/v1/puja-categories
// @access  Public
export const getPujaCategories = async (req, res) => {
  try {
    const categories = await PujaCategory.find({ isActive: true })
      .sort('name')
      .populate({
        path: 'pujas',
        select: 'name price duration featuredImage',
        match: { isActive: true },
        options: { limit: 5 },
      });

    return successResponse(
      res,
      { count: categories.length, data: categories },
      'Puja categories retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving puja categories',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get single puja category
// @route   GET /api/v1/puja-categories/:id
// @access  Public
export const getPujaCategory = async (req, res) => {
  try {
    const category = await PujaCategory.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate({
      path: 'pujas',
      select: 'name slug price duration featuredImage description',
      match: { isActive: true },
    });

    if (!category) {
      return notFoundResponse(res, 'Puja category');
    }

    return successResponse(
      res,
      category,
      'Puja category retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja category');
    }
    return errorResponse(
      res,
      'Server error while retrieving puja category',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Create new puja category
// @route   POST /api/v1/puja-categories
// @access  Private/Admin
export const createPujaCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    const category = await PujaCategory.create(req.body);

    return successResponse(
      res,
      category,
      'Puja category created successfully',
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return errorResponse(
        res,
        'Puja category with this name already exists',
        StatusCodes.BAD_REQUEST
      );
    }
    return errorResponse(
      res,
      'Server error while creating puja category',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update puja category
// @route   PUT /api/v1/puja-categories/:id
// @access  Private/Admin
export const updatePujaCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    let category = await PujaCategory.findById(req.params.id);

    if (!category) {
      return notFoundResponse(res, 'Puja category');
    }

    // Prevent changing the slug if the category has pujas
    if (req.body.name && category.pujas && category.pujas.length > 0) {
      delete req.body.name;
    }

    category = await PujaCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(
      res,
      category,
      'Puja category updated successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja category');
    }
    if (error.code === 11000) {
      return errorResponse(
        res,
        'Puja category with this name already exists',
        StatusCodes.BAD_REQUEST
      );
    }
    return errorResponse(
      res,
      'Server error while updating puja category',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Delete puja category
// @route   DELETE /api/v1/puja-categories/:id
// @access  Private/Admin
export const deletePujaCategory = async (req, res) => {
  try {
    const category = await PujaCategory.findById(req.params.id);

    if (!category) {
      return notFoundResponse(res, 'Puja category');
    }

    // Check if category has pujas
    const pujasCount = await Puja.countDocuments({ category: category._id });
    if (pujasCount > 0) {
      return errorResponse(
        res,
        `Cannot delete category with ${pujasCount} pujas. Please remove or reassign pujas first.`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Delete category
    await category.remove();

    return successResponse(
      res,
      {},
      'Puja category deleted successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja category');
    }
    return errorResponse(
      res,
      'Server error while deleting puja category',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Upload photo for puja category
// @route   PUT /api/v1/puja-categories/:id/photo
// @access  Private/Admin
export const pujaCategoryPhotoUpload = async (req, res) => {
  try {
    const category = await PujaCategory.findById(req.params.id);

    if (!category) {
      return notFoundResponse(res, 'Puja category');
    }

    if (!req.files) {
      return errorResponse(
        res,
        'Please upload a file',
        StatusCodes.BAD_REQUEST
      );
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return errorResponse(
        res,
        'Please upload an image file',
        StatusCodes.BAD_REQUEST
      );
    }

    // Check file size
    const maxSize = process.env.MAX_FILE_UPLOAD || 1000000; // 1MB default
    if (file.size > maxSize) {
      return errorResponse(
        res,
        `Please upload an image less than ${maxSize / 1000000}MB`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Create custom filename
    file.name = `category_${category._id}${path.parse(file.name).ext}`;

    file.mv(`${__dirname}/../public/uploads/categories/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return errorResponse(
          res,
          'Problem with file upload',
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      await PujaCategory.findByIdAndUpdate(req.params.id, { image: file.name });

      return successResponse(
        res,
        { photo: file.name },
        'Puja category photo uploaded successfully'
      );
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja category');
    }
    return errorResponse(
      res,
      'Server error while uploading photo',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};