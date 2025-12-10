import AstrologyService from '../models/AstrologyService.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Get all astrology services
// @route   GET /api/v1/astrology-services
// @access  Public
export const getAstrologyServices = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = 'name', 
    category,
    minPrice,
    maxPrice,
    search,
    isActive = 'true'
  } = req.query;

  // Build query
  const query = {};
  
  // Filter by active status
  if (isActive === 'true') {
    query.isActive = true;
  } else if (isActive === 'false') {
    query.isActive = false;
  }
  
  // Filter by category
  if (category) {
    query.category = { $in: Array.isArray(category) ? category : [category] };
  }
  
  // Filter by price range
  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
  }
  
  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [services, total] = await Promise.all([
    AstrologyService.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    AstrologyService.countDocuments(query)
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;

  res.json({
    success: true,
    count: services.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: services
  });
});

// @desc    Get single astrology service
// @route   GET /api/v1/astrology-services/:id
// @access  Public
export const getAstrologyService = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findById(req.params.id)
    .populate('astrologers', 'name specialization rating.average')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json({
    success: true,
    data: service
  });
});

// @desc    Create new astrology service
// @route   POST /api/v1/astrology-services
// @access  Private/Admin
export const createAstrologyService = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  
  // Create service
  const service = new AstrologyService({
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id
  });
  
  await service.save();
  
  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update astrology service
// @route   PUT /api/v1/astrology-services/:id
// @access  Private/Admin
export const updateAstrologyService = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findById(req.params.id);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  // Update fields
  const { 
    name, 
    description, 
    shortDescription, 
    category, 
    basePrice, 
    duration,
    minDuration,
    maxDuration,
    isCustomDurationAllowed,
    requirements,
    isActive,
    isPopular,
    isFeatured,
    advanceBookingDays,
    bufferTime,
    metaTitle,
    metaDescription,
    metaKeywords
  } = req.body;
  
  if (name) service.name = name;
  if (description) service.description = description;
  if (shortDescription) service.shortDescription = shortDescription;
  if (category) service.category = category;
  if (basePrice) service.basePrice = basePrice;
  if (duration) service.duration = duration;
  if (minDuration) service.minDuration = minDuration;
  if (maxDuration) service.maxDuration = maxDuration;
  if (typeof isCustomDurationAllowed !== 'undefined') service.isCustomDurationAllowed = isCustomDurationAllowed;
  if (requirements) service.requirements = Array.isArray(requirements) ? requirements : [requirements];
  if (typeof isActive !== 'undefined') service.isActive = isActive;
  if (typeof isPopular !== 'undefined') service.isPopular = isPopular;
  if (typeof isFeatured !== 'undefined') service.isFeatured = isFeatured;
  if (advanceBookingDays) service.advanceBookingDays = advanceBookingDays;
  if (bufferTime) service.bufferTime = bufferTime;
  if (metaTitle) service.metaTitle = metaTitle;
  if (metaDescription) service.metaDescription = metaDescription;
  if (metaKeywords) service.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : [metaKeywords];
  
  service.updatedBy = req.user.id;
  
  await service.save();
  
  res.json({
    success: true,
    data: service
  });
});

// @desc    Delete astrology service
// @route   DELETE /api/v1/astrology-services/:id
// @access  Private/Admin
export const deleteAstrologyService = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findById(req.params.id);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  // Soft delete
  service.isActive = false;
  service.updatedBy = req.user.id;
  
  await service.save();
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Upload service image
// @route   PUT /api/v1/astrology-services/:id/photo
// @access  Private/Admin
export const uploadServicePhoto = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findById(req.params.id);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  if (!req.files || !req.files.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }
  
  const file = req.files.file;
  
  // Check file type
  if (!file.mimetype.startsWith('image')) {
    res.status(400);
    throw new Error('Please upload an image file');
  }
  
  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000; // 1MB default
  if (file.size > maxSize) {
    res.status(400);
    throw new Error(`Please upload an image less than ${maxSize / 1000}KB`);
  }
  
  try {
    // Upload to cloudinary
    const result = await uploadToCloudinary(file, {
      folder: 'sankalpam/astrology-services',
      public_id: `service_${service._id}_${Date.now()}`,
      width: 800,
      height: 600,
      crop: 'fill'
    });
    
    // Update service with photo URL
    service.imageUrl = result.secure_url;
    service.updatedBy = req.user.id;
    
    await service.save();
    
    res.json({
      success: true,
      data: {
        imageUrl: service.imageUrl
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500);
    throw new Error('Error uploading image');
  }
});

// @desc    Get service statistics
// @route   GET /api/v1/astrology-services/stats
// @access  Private/Admin
export const getServiceStats = asyncHandler(async (req, res) => {
  const stats = await AstrologyService.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$basePrice' },
        minPrice: { $min: '$basePrice' },
        maxPrice: { $max: '$basePrice' },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  res.json({
    success: true,
    count: stats.length,
    data: stats
  });
});

// @desc    Get popular services
// @route   GET /api/v1/astrology-services/popular
// @access  Public
export const getPopularServices = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const services = await AstrologyService.find({ 
    isActive: true,
    isPopular: true 
  })
  .sort({ 'rating.average': -1 })
  .limit(parseInt(limit, 10))
  .select('name description basePrice duration imageUrl rating')
  .lean();
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get featured services
// @route   GET /api/v1/astrology-services/featured
// @access  Public
export const getFeaturedServices = asyncHandler(async (req, res) => {
  const { limit = 3 } = req.query;
  
  const services = await AstrologyService.find({ 
    isActive: true,
    isFeatured: true 
  })
  .sort({ 'rating.average': -1 })
  .limit(parseInt(limit, 10))
  .select('name shortDescription basePrice duration imageUrl rating')
  .lean();
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get services by category
// @route   GET /api/v1/astrology-services/category/:category
// @access  Public
export const getServicesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sort = 'name' } = req.query;
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [services, total] = await Promise.all([
    AstrologyService.find({ 
      category: { $regex: new RegExp(category, 'i') },
      isActive: true 
    })
    .sort(sort)
    .skip(skip)
    .limit(pageSize)
    .select('name shortDescription basePrice duration imageUrl rating')
    .lean(),
    
    AstrologyService.countDocuments({ 
      category: { $regex: new RegExp(category, 'i') },
      isActive: true 
    })
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: services.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: services
  });
});

// @desc    Search services
// @route   GET /api/v1/astrology-services/search
// @access  Public
export const searchServices = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }
  
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const searchQuery = {
    $text: { $search: q },
    isActive: true
  };
  
  const [services, total] = await Promise.all([
    AstrologyService.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(pageSize)
      .select('name shortDescription basePrice duration imageUrl rating')
      .lean(),
      
    AstrologyService.countDocuments(searchQuery)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: services.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: services
  });
});

// @desc    Get similar services
// @route   GET /api/v1/astrology-services/:id/similar
// @access  Public
export const getSimilarServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;
  
  const service = await AstrologyService.findById(id);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  const similarServices = await AstrologyService.find({
    _id: { $ne: id },
    category: service.category,
    isActive: true
  })
  .sort({ 'rating.average': -1 })
  .limit(parseInt(limit, 10))
  .select('name basePrice duration imageUrl rating')
  .lean();
  
  res.json({
    success: true,
    count: similarServices.length,
    data: similarServices
  });
});

// @desc    Toggle service status (active/inactive)
// @route   PUT /api/v1/astrology-services/:id/toggle-status
// @access  Private/Admin
export const toggleServiceStatus = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findById(req.params.id);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  // Toggle the status
  service.isActive = !service.isActive;
  service.updatedBy = req.user.id;
  
  await service.save();
  
  res.json({
    success: true,
    data: {
      _id: service._id,
      isActive: service.isActive
    }
  });
});

// @desc    Get service requirements
// @route   GET /api/v1/astrology-services/:id/requirements
// @access  Public
export const getServiceRequirements = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findById(req.params.id)
    .select('name requirements')
    .lean();
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  res.json({
    success: true,
    data: {
      service: service.name,
      requirements: service.requirements || []
    }
  });
});

// @desc    Update service requirements
// @route   PUT /api/v1/astrology-services/:id/requirements
// @access  Private/Admin
export const updateServiceRequirements = asyncHandler(async (req, res) => {
  const { requirements } = req.body;
  
  if (!Array.isArray(requirements)) {
    return res.status(400).json({
      success: false,
      error: 'Requirements must be an array'
    });
  }
  
  const service = await AstrologyService.findById(req.params.id);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  // Update requirements
  service.requirements = requirements;
  service.updatedBy = req.user.id;
  
  await service.save();
  
  res.json({
    success: true,
    data: {
      _id: service._id,
      requirements: service.requirements
    }
  });
});

// @desc    Get service categories
// @route   GET /api/v1/astrology-services/categories
// @access  Public
export const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await AstrologyService.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({
    success: true,
    count: categories.length,
    data: categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }))
  });
});

// @desc    Get service by slug
// @route   GET /api/v1/astrology-services/slug/:slug
// @access  Public
export const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await AstrologyService.findOne({ slug: req.params.slug })
    .populate('astrologers', 'name specialization rating.average')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean();

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json({
    success: true,
    data: service
  });
});
