import Astrologer from '../models/Astrologer.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Get all astrologers
// @route   GET /api/v1/astrologers
// @access  Public
export const getAstrologers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = '-rating.average', 
    ...filters 
  } = req.query;

  // Build query
  const query = {};
  
  // Filter by status (default to active and verified)
  query.status = filters.status || 'active';
  query.isVerified = filters.isVerified !== 'false';
  
  // Filter by specialization
  if (filters.specialization) {
    query.specialization = { $in: Array.isArray(filters.specialization) 
      ? filters.specialization 
      : [filters.specialization] };
  }
  
  // Filter by experience
  if (filters.minExperience) {
    query.experience = { $gte: parseInt(filters.minExperience) };
  }
  
  if (filters.maxExperience) {
    query.experience = { 
      ...query.experience, 
      $lte: parseInt(filters.maxExperience) 
    };
  }
  
  // Filter by rating
  if (filters.minRating) {
    query['rating.average'] = { $gte: parseFloat(filters.minRating) };
  }
  
  // Filter by language
  if (filters.languages) {
    query.languages = { 
      $in: Array.isArray(filters.languages) 
        ? filters.languages 
        : [filters.languages] 
    };
  }
  
  // Search by name or bio
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { bio: { $regex: filters.search, $options: 'i' } },
      { specialization: { $regex: filters.search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [astrologers, total] = await Promise.all([
    Astrologer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate('user', 'name email phone')
      .lean(),
    Astrologer.countDocuments(query)
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;

  res.json({
    success: true,
    count: astrologers.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: astrologers
  });
});

// @desc    Get single astrologer
// @route   GET /api/v1/astrologers/:id
// @access  Public
export const getAstrologer = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate({
      path: 'upcomingSessions',
      select: 'startTime endTime status user',
      options: { limit: 5, sort: { startTime: 1 } },
      populate: {
        path: 'user',
        select: 'name'
      }
    });

  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }

  res.json({
    success: true,
    data: astrologer
  });
});

// @desc    Create new astrologer profile
// @route   POST /api/v1/astrologers
// @access  Private/Admin
export const createAstrologer = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  
  const { userId, ...astrologerData } = req.body;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if user already has an astrologer profile
  const existingAstrologer = await Astrologer.findOne({ user: userId });
  if (existingAstrologer) {
    res.status(400);
    throw new Error('User already has an astrologer profile');
  }
  
  // Create astrologer profile
  const astrologer = new Astrologer({
    ...astrologerData,
    user: userId,
    createdBy: req.user.id,
    updatedBy: req.user.id
  });
  
  await astrologer.save();
  
  // Update user role to astrologer
  user.role = 'astrologer';
  await user.save();
  
  res.status(201).json({
    success: true,
    data: astrologer
  });
});

// @desc    Update astrologer profile
// @route   PUT /api/v1/astrologers/:id
// @access  Private/Admin or Astrologer (own profile)
export const updateAstrologer = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to update this profile
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }
  
  // Update fields
  const { 
    name, 
    specialization, 
    experience, 
    languages, 
    bio, 
    phone, 
    email, 
    workingHours,
    isAvailable,
    status,
    isVerified
  } = req.body;
  
  if (name) astrologer.name = name;
  if (specialization) astrologer.specialization = Array.isArray(specialization) 
    ? specialization 
    : [specialization];
  if (experience) astrologer.experience = experience;
  if (languages) astrologer.languages = Array.isArray(languages) 
    ? languages 
    : [languages];
  if (bio) astrologer.bio = bio;
  if (phone) astrologer.phone = phone;
  if (email) astrologer.email = email.toLowerCase();
  if (workingHours) astrologer.workingHours = workingHours;
  if (typeof isAvailable !== 'undefined') astrologer.isAvailable = isAvailable;
  
  // Only allow admins to update these fields
  if (req.user.role === 'admin') {
    if (status) astrologer.status = status;
    if (typeof isVerified !== 'undefined') astrologer.isVerified = isVerified;
  }
  
  astrologer.updatedBy = req.user.id;
  
  await astrologer.save();
  
  res.json({
    success: true,
    data: astrologer
  });
});

// @desc    Delete astrologer profile
// @route   DELETE /api/v1/astrologers/:id
// @access  Private/Admin
export const deleteAstrologer = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Soft delete
  astrologer.isActive = false;
  astrologer.status = 'inactive';
  astrologer.updatedBy = req.user.id;
  
  await astrologer.save();
  
  // Optionally, update user role
  // await User.findByIdAndUpdate(astrologer.user, { role: 'user' });
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Upload astrologer photo
// @route   PUT /api/v1/astrologers/:id/photo
// @access  Private/Admin or Astrologer (own profile)
export const uploadAstrologerPhoto = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to update this profile
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this profile');
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
      folder: 'sankalpam/astrologers',
      public_id: `astrologer_${astrologer._id}_${Date.now()}`,
      width: 500,
      height: 500,
      crop: 'fill'
    });
    
    // Update astrologer with photo URL
    astrologer.imageUrl = result.secure_url;
    astrologer.updatedBy = req.user.id;
    
    await astrologer.save();
    
    res.json({
      success: true,
      data: {
        imageUrl: astrologer.imageUrl
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500);
    throw new Error('Error uploading image');
  }
});

// @desc    Get astrologer's available time slots
// @route   GET /api/v1/astrologers/:id/slots
// @access  Public
export const getAstrologerSlots = asyncHandler(async (req, res) => {
  const { date, duration = 30 } = req.query;
  const astrologerId = req.params.id;
  
  const astrologer = await Astrologer.findById(astrologerId);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Set date range for slots (default to next 7 days)
  const startDate = date ? new Date(date) : new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);
  endDate.setHours(23, 59, 59, 999);
  
  // Get available slots from the astrologer
  const slots = await astrologer.getAvailableSlots(startDate, endDate, parseInt(duration));
  
  res.json({
    success: true,
    count: slots.length,
    data: slots
  });
});

// @desc    Get astrologer's upcoming sessions
// @route   GET /api/v1/astrologers/:id/sessions/upcoming
// @access  Private/Astrologer (own profile) or Admin
export const getUpcomingSessions = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to view these sessions
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view these sessions');
  }
  
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [sessions, total] = await Promise.all([
    // Get upcoming sessions using virtual populate
    Astrologer.findById(astrologer._id)
      .select('upcomingSessions')
      .populate({
        path: 'upcomingSessions',
        select: 'startTime endTime status user service',
        options: { 
          skip,
          limit: pageSize,
          sort: { startTime: 1 }
        },
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'service', select: 'name duration basePrice' }
        ]
      })
      .lean()
      .then(astrologer => astrologer.upcomingSessions || []),
      
    // Count total upcoming sessions
    Astrologer.aggregate([
      { $match: { _id: astrologer._id } },
      { $project: { count: { $size: '$upcomingSessions' } } }
    ]).then(result => result[0]?.count || 0)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: sessions.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: sessions
  });
});

// @desc    Get astrologer's past sessions
// @route   GET /api/v1/astrologers/:id/sessions/past
// @access  Private/Astrologer (own profile) or Admin
export const getPastSessions = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to view these sessions
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view these sessions');
  }
  
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  const [sessions, total] = await Promise.all([
    // Get past sessions using virtual populate
    Astrologer.findById(astrologer._id)
      .select('pastSessions')
      .populate({
        path: 'pastSessions',
        select: 'startTime endTime status user service rating',
        options: { 
          skip,
          limit: pageSize,
          sort: { startTime: -1 }
        },
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'service', select: 'name duration basePrice' }
        ]
      })
      .lean()
      .then(astrologer => astrologer.pastSessions || []),
      
    // Count total past sessions
    Astrologer.aggregate([
      { $match: { _id: astrologer._id } },
      { $project: { count: { $size: '$pastSessions' } } }
    ]).then(result => result[0]?.count || 0)
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;
  
  res.json({
    success: true,
    count: sessions.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: sessions
  });
});

// @desc    Get astrologer statistics
// @route   GET /api/v1/astrologers/:id/stats
// @access  Private/Astrologer (own profile) or Admin
export const getAstrologerStats = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to view these stats
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view these statistics');
  }
  
  // Get date range for stats (default to last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  // Get booking stats
  const bookingStats = await Astrologer.aggregate([
    {
      $match: { _id: astrologer._id }
    },
    {
      $lookup: {
        from: 'astrologybookings',
        localField: '_id',
        foreignField: 'astrologer',
        as: 'bookings'
      }
    },
    {
      $unwind: '$bookings'
    },
    {
      $match: {
        'bookings.startTime': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$bookings.startTime' },
          month: { $month: '$bookings.startTime' },
          day: { $dayOfMonth: '$bookings.startTime' },
          status: '$bookings.status'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$bookings.totalAmount' },
        avgRating: { $avg: '$bookings.rating.value' }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day'
        },
        totalSessions: { $sum: '$count' },
        totalRevenue: { $sum: '$totalRevenue' },
        byStatus: {
          $push: {
            status: '$_id.status',
            count: '$count',
            revenue: '$totalRevenue'
          }
        },
        avgRating: { $avg: '$avgRating' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  // Calculate summary stats
  const summary = {
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    totalRevenue: 0,
    avgRating: astrologer.rating?.average || 0,
    ratingCount: astrologer.rating?.count || 0,
    ratingDistribution: astrologer.rating?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    byDay: {}
  };
  
  // Process booking stats
  bookingStats.forEach(stat => {
    const dateKey = `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`;
    
    summary.totalSessions += stat.totalSessions;
    summary.totalRevenue += stat.totalRevenue || 0;
    
    // Count by status
    stat.byStatus.forEach(s => {
      if (s.status === 'completed') {
        summary.completedSessions += s.count;
      } else if (s.status === 'cancelled' || s.status === 'rejected') {
        summary.cancelledSessions += s.count;
      }
    });
    
    // Group by day
    summary.byDay[dateKey] = {
      totalSessions: stat.totalSessions,
      totalRevenue: stat.totalRevenue,
      avgRating: stat.avgRating,
      byStatus: stat.byStatus.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {})
    };
  });
  
  // Calculate completion rate
  summary.completionRate = summary.totalSessions > 0 
    ? (summary.completedSessions / summary.totalSessions) * 100 
    : 0;
  
  // Calculate cancellation rate
  summary.cancellationRate = summary.totalSessions > 0 
    ? (summary.cancelledSessions / summary.totalSessions) * 100 
    : 0;
  
  // Add availability stats
  const availableDays = Object.entries(astrologer.workingHours || {})
    .filter(([_, day]) => day.available)
    .map(([day]) => day);
    
  summary.availability = {
    availableDays,
    isAvailable: astrologer.isAvailable,
    nextAvailableSlot: null // This would require additional logic to calculate
  };
  
  res.json({
    success: true,
    data: summary
  });
});

// @desc    Verify astrologer document
// @route   PUT /api/v1/astrologers/:id/verify-document/:docId
// @access  Private/Admin
export const verifyDocument = asyncHandler(async (req, res) => {
  const { id, docId } = req.params;
  const { verified = true, notes = '' } = req.body;
  
  const astrologer = await Astrologer.findById(id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Find the document
  const docIndex = astrologer.documents.findIndex(doc => doc._id.toString() === docId);
  
  if (docIndex === -1) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Update document verification status
  astrologer.documents[docIndex].verified = verified;
  astrologer.documents[docIndex].verifiedAt = new Date();
  astrologer.documents[docIndex].verifiedBy = req.user.id;
  astrologer.documents[docIndex].notes = notes;
  
  // Check if all required documents are verified
  const requiredDocs = ['id_proof', 'certification'];
  const verifiedDocs = astrologer.documents
    .filter(doc => doc.verified)
    .map(doc => doc.type);
  
  const hasAllRequiredDocs = requiredDocs.every(doc => verifiedDocs.includes(doc));
  
  // If all required documents are verified, update astrologer status
  if (hasAllRequiredDocs && astrologer.status === 'pending') {
    astrologer.status = 'active';
    astrologer.isVerified = true;
  }
  
  astrologer.updatedBy = req.user.id;
  
  await astrologer.save();
  
  res.json({
    success: true,
    data: astrologer.documents[docIndex]
  });
});

// @desc    Upload astrologer document
// @route   POST /api/v1/astrologers/:id/documents
// @access  Private/Astrologer (own profile) or Admin
export const uploadDocument = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to upload documents
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to upload documents for this profile');
  }
  
  const { type, description } = req.body;
  
  if (!req.files || !req.files.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }
  
  const file = req.files.file;
  
  // Check file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    res.status(400);
    throw new Error('Please upload a PDF, JPEG, or PNG file');
  }
  
  // Check file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    res.status(400);
    throw new Error('File size must be less than 5MB');
  }
  
  try {
    // Upload to cloudinary
    const result = await uploadToCloudinary(file, {
      folder: `sankalpam/astrologers/${astrologer._id}/documents`,
      public_id: `${type}_${Date.now()}`,
      resource_type: 'auto'
    });
    
    // Add document to astrologer
    const newDoc = {
      type,
      url: result.secure_url,
      publicId: result.public_id,
      description: description || '',
      verified: false,
      uploadedAt: new Date(),
      uploadedBy: req.user.id
    };
    
    astrologer.documents.push(newDoc);
    astrologer.updatedBy = req.user.id;
    
    await astrologer.save();
    
    res.status(201).json({
      success: true,
      data: newDoc
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500);
    throw new Error('Error uploading document');
  }
});

// @desc    Delete astrologer document
// @route   DELETE /api/v1/astrologers/:id/documents/:docId
// @access  Private/Admin or Astrologer (own profile)
export const deleteDocument = asyncHandler(async (req, res) => {
  const { id, docId } = req.params;
  
  const astrologer = await Astrologer.findById(id);
  
  if (!astrologer) {
    res.status(404);
    throw new Error('Astrologer not found');
  }
  
  // Check if user is authorized to delete documents
  if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete documents for this profile');
  }
  
  // Find the document
  const docIndex = astrologer.documents.findIndex(doc => doc._id.toString() === docId);
  
  if (docIndex === -1) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Get the document before removing it (for cloudinary deletion)
  const docToDelete = astrologer.documents[docIndex];
  
  // Remove the document
  astrologer.documents.splice(docIndex, 1);
  astrologer.updatedBy = req.user.id;
  
  await astrologer.save();
  
  // TODO: Delete the file from cloudinary
  // await deleteFromCloudinary(docToDelete.publicId);
  
  res.json({
    success: true,
    data: {}
  });
});