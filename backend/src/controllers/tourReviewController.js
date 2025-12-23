import { StatusCodes } from 'http-status-codes';
import TourReview from '../models/TourReview.js';
import Tour from '../models/TourPackage.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all reviews
// @route   GET /api/v1/tour-reviews
// @route   GET /api/v1/tours/:tourId/reviews
// @access  Public
export const getTourReviews = asyncHandler(async (req, res, next) => {
  if (req.params.tourId) {
    const reviews = await TourReview.find({ tour: req.params.tourId })
      .populate({
        path: 'user',
        select: 'name photo'
      })
      .sort('-createdAt');

    return res.status(StatusCodes.OK).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(StatusCodes.OK).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/v1/tour-reviews/:id
// @access  Public
export const getTourReview = asyncHandler(async (req, res, next) => {
  const review = await TourReview.findById(req.params.id).populate({
    path: 'tour',
    select: 'name'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: review
  });
});

// @desc    Add review
// @route   POST /api/v1/tours/:tourId/reviews
// @access  Private
export const createTourReview = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  // Add tour to req.body
  req.body.tour = req.params.tourId;

  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(
      new ErrorResponse(`No tour with the id of ${req.params.tourId}`, 404)
    );
  }

  // Check if user already reviewed the tour
  const existingReview = await TourReview.findOne({
    tour: req.params.tourId,
    user: req.user.id
  });

  if (existingReview) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} has already reviewed tour ${req.params.tourId}`,
        400
      )
    );
  }

  const review = await TourReview.create(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/v1/tour-reviews/:id
// @access  Private
export const updateTourReview = asyncHandler(async (req, res, next) => {
  let review = await TourReview.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this review`,
        401
      )
    );
  }

  // Update only the fields that are passed in
  const { rating, title, comment } = req.body;
  
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;
  
  review.isEdited = true;
  review.editedAt = Date.now();

  await review.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/tour-reviews/:id
// @access  Private
export const deleteTourReview = asyncHandler(async (req, res, next) => {
  const review = await TourReview.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this review`,
        401
      )
    );
  }

  await review.remove();

  res.status(StatusCodes.OK).json({
    success: true,
    data: {}
  });
});

// @desc    Get reviews for the logged in user
// @route   GET /api/v1/tour-reviews/my-reviews
// @access  Private
export const getMyTourReviews = asyncHandler(async (req, res, next) => {
  const reviews = await TourReview.find({ user: req.user.id })
    .populate({
      path: 'tour',
      select: 'name imageCover'
    })
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Get reviews by user
// @route   GET /api/v1/tour-reviews/user/:userId
// @access  Private/Admin
export const getReviewsByUser = asyncHandler(async (req, res, next) => {
  const reviews = await TourReview.find({ user: req.params.userId })
    .populate({
      path: 'tour',
      select: 'name'
    })
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Get reviews by tour
// @route   GET /api/v1/tours/:tourId/reviews
// @access  Public
export const getReviewsByTour = asyncHandler(async (req, res, next) => {
  const reviews = await TourReview.find({ tour: req.params.tourId })
    .populate({
      path: 'user',
      select: 'name photo'
    })
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Get review stats for a tour
// @route   GET /api/v1/tour-reviews/stats/tour/:tourId
// @access  Public
export const getTourReviewStats = asyncHandler(async (req, res, next) => {
  const stats = await TourReview.aggregate([
    {
      $match: { tour: mongoose.Types.ObjectId(req.params.tourId) }
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: {
            rating: '$rating',
            count: 1
          }
        }
      }
    },
    {
      $addFields: {
        ratingDistribution: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                [
                  {
                    rating: '$$this',
                    count: {
                      $size: {
                        $filter: {
                          input: '$ratingDistribution',
                          as: 'r',
                          cond: { $eq: ['$$r.rating', '$$this'] }
                        }
                      }
                    }
                  }
                ]
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        tour: '$_id',
        numRatings: 1,
        avgRating: { $round: ['$avgRating', 1] },
        ratingDistribution: 1
      }
    }
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: stats[0] || { numRatings: 0, avgRating: 0, ratingDistribution: [] }
  });
});