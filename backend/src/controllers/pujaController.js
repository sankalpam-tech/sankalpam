import Puja from '../models/Puja.js';
import PujaCategory from '../models/PujaCategory.js';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '../utils/responseUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all pujas
// @route   GET /api/v1/pujas
// @access  Public
export const getPujas = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Puja.find(JSON.parse(queryStr)).populate({
      path: 'category',
      select: 'name slug'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Puja.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const pujas = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    return successResponse(
      res,
      { count: pujas.length, pagination, data: pujas },
      'Pujas retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while retrieving pujas',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get single puja
// @route   GET /api/v1/pujas/:id
// @access  Public
export const getPuja = async (req, res) => {
  try {
    const puja = await Puja.findById(req.params.id)
      .populate({
        path: 'category',
        select: 'name slug'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    if (!puja) {
      return notFoundResponse(res, 'Puja');
    }

    return successResponse(
      res,
      puja,
      'Puja retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja');
    }
    return errorResponse(
      res,
      'Server error while retrieving puja',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Create new puja
// @route   POST /api/v1/pujas
// @access  Private/Admin
export const createPuja = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if category exists
    const category = await PujaCategory.findById(req.body.category);
    if (!category) {
      return notFoundResponse(res, 'Category');
    }

    const puja = await Puja.create(req.body);

    return successResponse(
      res,
      puja,
      'Puja created successfully',
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return errorResponse(
        res,
        'Puja with this name already exists',
        StatusCodes.BAD_REQUEST
      );
    }
    return errorResponse(
      res,
      'Server error while creating puja',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Update puja
// @route   PUT /api/v1/pujas/:id
// @access  Private/Admin
export const updatePuja = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    let puja = await Puja.findById(req.params.id);

    if (!puja) {
      return notFoundResponse(res, 'Puja');
    }

    // Check if category exists if being updated
    if (req.body.category) {
      const category = await PujaCategory.findById(req.body.category);
      if (!category) {
        return notFoundResponse(res, 'Category');
      }
    }

    puja = await Puja.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(
      res,
      puja,
      'Puja updated successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja');
    }
    if (error.code === 11000) {
      return errorResponse(
        res,
        'Puja with this name already exists',
        StatusCodes.BAD_REQUEST
      );
    }
    return errorResponse(
      res,
      'Server error while updating puja',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Delete puja
// @route   DELETE /api/v1/pujas/:id
// @access  Private/Admin
export const deletePuja = async (req, res) => {
  try {
    const puja = await Puja.findById(req.params.id);

    if (!puja) {
      return notFoundResponse(res, 'Puja');
    }

    // Delete puja
    await puja.remove();

    return successResponse(
      res,
      {},
      'Puja deleted successfully'
    );
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja');
    }
    return errorResponse(
      res,
      'Server error while deleting puja',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Upload photo for puja
// @route   PUT /api/v1/pujas/:id/photo
// @access  Private/Admin
export const pujaPhotoUpload = async (req, res) => {
  try {
    const puja = await Puja.findById(req.params.id);

    if (!puja) {
      return notFoundResponse(res, 'Puja');
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
    file.name = `photo_${puja._id}${path.parse(file.name).ext}`;

    file.mv(`${__dirname}/../public/uploads/pujas/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return errorResponse(
          res,
          'Problem with file upload',
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      await Puja.findByIdAndUpdate(req.params.id, { featuredImage: file.name });

      return successResponse(
        res,
        { photo: file.name },
        'Puja photo uploaded successfully'
      );
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return notFoundResponse(res, 'Puja');
    }
    return errorResponse(
      res,
      'Server error while uploading photo',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Get pujas within a radius
// @route   GET /api/v1/pujas/radius/:zipcode/:distance
// @access  Private
export const getPujasInRadius = async (req, res) => {
  try {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    // This is a placeholder - you'll need to implement geocoding
    // const loc = await geocoder.geocode(zipcode);
    // const lat = loc[0].latitude;
    // const lng = loc[0].longitude;
    
    // Calculate radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    // const radius = distance / 3963;

    // const pujas = await Puja.find({
    //   location: {
    //     $geoWithin: { $centerSphere: [[lng, lat], radius] }
    //   }
    // });

    // For now, we'll return a message indicating this is not implemented
    return successResponse(
      res,
      [],
      'This feature is not yet implemented'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Server error while getting pujas in radius',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
