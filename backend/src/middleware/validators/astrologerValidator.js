import { body, param, query } from 'express-validator';
import Astrologer from '../../models/Astrologer.js';
import User from '../../models/User.js';

// Common validation rules for creating/updating an astrologer
export const astrologerValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
    
  body('specialization')
    .isArray({ min: 1 }).withMessage('At least one specialization is required')
    .custom((specializations) => {
      const validSpecializations = [
        'Vedic Astrology', 'Numerology', 'Palmistry', 'Vastu Shastra', 
        'Tarot Reading', 'Birth Chart Analysis', 'Muhurta', 'Nadi Astrology',
        'KP Astrology', 'Lal Kitab', 'Prasna', 'Remedial Astrology',
        'Horary Astrology', 'Medical Astrology', 'Mundane Astrology',
        'Electional Astrology', 'Financial Astrology', 'Relationship Astrology',
        'Career Astrology', 'Spiritual Astrology'
      ];
      
      if (!Array.isArray(specializations)) {
        throw new Error('Specialization must be an array');
      }
      
      const invalidSpecializations = specializations.filter(
        spec => !validSpecializations.includes(spec)
      );
      
      if (invalidSpecializations.length > 0) {
        throw new Error(`Invalid specialization(s): ${invalidSpecializations.join(', ')}`);
      }
      
      return true;
    }),
    
  body('experience')
    .isInt({ min: 0, max: 100 }).withMessage('Experience must be between 0 and 100 years'),
    
  body('languages')
    .isArray({ min: 1 }).withMessage('At least one language is required')
    .custom(languages => {
      if (!Array.isArray(languages)) {
        throw new Error('Languages must be an array');
      }
      
      if (languages.some(lang => typeof lang !== 'string' || lang.trim().length === 0)) {
        throw new Error('All languages must be non-empty strings');
      }
      
      return true;
    }),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Bio cannot be more than 2000 characters'),
    
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9\-\+]{8,15}$/).withMessage('Please enter a valid phone number'),
    
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      // Skip if it's an update and email hasn't changed
      if (req.method === 'PUT' && req.astrologer && req.astrologer.email === email) {
        return true;
      }
      
      const exists = await Astrologer.findOne({ email });
      if (exists) {
        throw new Error('Email is already in use by another astrologer');
      }
      
      return true;
    }),
    
  body('workingHours')
    .optional()
    .isObject().withMessage('Working hours must be an object')
    .custom(workingHours => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
      
      for (const day of days) {
        if (workingHours[day]) {
          const daySchedule = workingHours[day];
          
          // Check if available is a boolean
          if (typeof daySchedule.available !== 'boolean') {
            throw new Error(`Available status for ${day} must be a boolean`);
          }
          
          // If available, check slots
          if (daySchedule.available && daySchedule.slots) {
            if (!Array.isArray(daySchedule.slots)) {
              throw new Error(`Slots for ${day} must be an array`);
            }
            
            for (const slot of daySchedule.slots) {
              if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
                throw new Error(`Invalid time format in ${day} slots. Use HH:MM format.`);
              }
              
              // Convert to date objects for comparison
              const [startHour, startMinute] = slot.start.split(':').map(Number);
              const [endHour, endMinute] = slot.end.split(':').map(Number);
              
              if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
                throw new Error(`End time must be after start time in ${day} slots`);
              }
            }
          }
        }
      }
      
      return true;
    }),
    
  body('sessionDuration')
    .optional()
    .isInt({ min: 15, max: 120 }).withMessage('Session duration must be between 15 and 120 minutes'),
    
  body('bufferTime')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Buffer time must be between 0 and 60 minutes'),
    
  body('socialMedia.*')
    .optional()
    .isURL().withMessage('Please enter a valid URL')
    .matches(/^https?:\/\//).withMessage('URL must start with http:// or https://'),
    
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('Availability must be a boolean value'),
    
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('Featured status must be a boolean value'),
    
  body('status')
    .optional()
    .isIn(['pending', 'active', 'suspended', 'inactive']).withMessage('Invalid status'),
    
  body('isVerified')
    .optional()
    .isBoolean().withMessage('Verification status must be a boolean value'),
    
  body('documents.*.type')
    .optional()
    .isIn(['id_proof', 'certification', 'other']).withMessage('Invalid document type'),
    
  body('documents.*.url')
    .if((value, { req }) => req.body.documents && req.body.documents.some(doc => doc.url))
    .isURL().withMessage('Document URL must be a valid URL')
    .matches(/^https?:\/\//).withMessage('Document URL must start with http:// or https://'),
    
  body('documents.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Document description cannot be more than 500 characters'),
    
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object')
];

// Validation rules for creating a new astrologer
export const createAstrologerRules = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID')
    .custom(async (userId) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user already has an astrologer profile
      const existingAstrologer = await Astrologer.findOne({ user: userId });
      if (existingAstrologer) {
        throw new Error('User already has an astrologer profile');
      }
      
      return true;
    }),
    
  // Include all the common validation rules
  ...astrologerValidationRules
];

// Validation rules for updating an astrologer
export const updateAstrologerRules = [
  param('id')
    .isMongoId().withMessage('Invalid astrologer ID')
    .custom(async (id, { req }) => {
      const astrologer = await Astrologer.findById(id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      
      // Attach astrologer to request for later use
      req.astrologer = astrologer;
      
      // Check if user is authorized to update this profile
      if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
        throw new Error('Not authorized to update this profile');
      }
      
      return true;
    }),
    
  // Include all the common validation rules
  ...astrologerValidationRules
];

// Validation rules for uploading a document
export const uploadDocumentRules = [
  param('id')
    .isMongoId().withMessage('Invalid astrologer ID')
    .custom(async (id, { req }) => {
      const astrologer = await Astrologer.findById(id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      
      // Check if user is authorized to upload documents
      if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
        throw new Error('Not authorized to upload documents for this profile');
      }
      
      return true;
    }),
    
  body('type')
    .notEmpty().withMessage('Document type is required')
    .isIn(['id_proof', 'certification', 'other']).withMessage('Invalid document type'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters')
];

// Validation rules for verifying a document
export const verifyDocumentRules = [
  param('id')
    .isMongoId().withMessage('Invalid astrologer ID')
    .custom(async (id) => {
      const astrologer = await Astrologer.findById(id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      return true;
    }),
    
  param('docId')
    .isMongoId().withMessage('Invalid document ID')
    .custom(async (docId, { req }) => {
      const astrologer = await Astrologer.findById(req.params.id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      
      const doc = astrologer.documents.id(docId);
      if (!doc) {
        throw new Error('Document not found');
      }
      
      return true;
    }),
    
  body('verified')
    .optional()
    .isBoolean().withMessage('Verified must be a boolean value'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot be more than 500 characters')
];

// Validation rules for getting available time slots
export const getAvailableSlotsRules = [
  param('id')
    .isMongoId().withMessage('Invalid astrologer ID')
    .custom(async (id) => {
      const astrologer = await Astrologer.findById(id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      return true;
    }),
    
  query('date')
    .optional()
    .isISO8601().withMessage('Invalid date format. Use ISO 8601 format (e.g., YYYY-MM-DD)'),
    
  query('duration')
    .optional()
    .isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes')
];

// Validation rules for getting astrologer sessions
export const getSessionsRules = [
  param('id')
    .isMongoId().withMessage('Invalid astrologer ID')
    .custom(async (id, { req }) => {
      const astrologer = await Astrologer.findById(id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      
      // Check if user is authorized to view these sessions
      if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
        throw new Error('Not authorized to view these sessions');
      }
      
      return true;
    }),
    
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt()
];

// Validation rules for getting astrologer statistics
export const getStatsRules = [
  param('id')
    .isMongoId().withMessage('Invalid astrologer ID')
    .custom(async (id, { req }) => {
      const astrologer = await Astrologer.findById(id);
      if (!astrologer) {
        throw new Error('Astrologer not found');
      }
      
      // Check if user is authorized to view these stats
      if (req.user.role !== 'admin' && astrologer.user.toString() !== req.user.id) {
        throw new Error('Not authorized to view these statistics');
      }
      
      return true;
    }),
    
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date in ISO 8601 format'),
    
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date in ISO 8601 format')
    .custom((endDate, { req }) => {
      if (req.query.startDate && new Date(endDate) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Validation rules for query parameters when listing astrologers
export const listAstrologersRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
    
  query('sort')
    .optional()
    .trim()
    .matches(/^(-?[a-zA-Z]+\.?[a-zA-Z]*)(,-?[a-zA-Z]+\.?[a-zA-Z]*)*$/)
    .withMessage('Invalid sort parameter format. Use: field1,-field2,field3'),
    
  query('status')
    .optional()
    .isIn(['pending', 'active', 'suspended', 'inactive'])
    .withMessage('Invalid status value'),
    
  query('isVerified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isVerified must be either true or false'),
    
  query('specialization')
    .optional()
    .custom(specialization => {
      if (Array.isArray(specialization)) {
        const validSpecializations = [
          'Vedic Astrology', 'Numerology', 'Palmistry', 'Vastu Shastra', 
          'Tarot Reading', 'Birth Chart Analysis', 'Muhurta', 'Nadi Astrology',
          'KP Astrology', 'Lal Kitab', 'Prasna', 'Remedial Astrology',
          'Horary Astrology', 'Medical Astrology', 'Mundane Astrology',
          'Electional Astrology', 'Financial Astrology', 'Relationship Astrology',
          'Career Astrology', 'Spiritual Astrology'
        ];
        
        const invalidSpecializations = specialization.filter(
          spec => !validSpecializations.includes(spec)
        );
        
        if (invalidSpecializations.length > 0) {
          throw new Error(`Invalid specialization(s): ${invalidSpecializations.join(', ')}`);
        }
      }
      return true;
    }),
    
  query('minExperience')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Minimum experience must be between 0 and 100 years'),
    
  query('maxExperience')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Maximum experience must be between 0 and 100 years')
    .custom((maxExp, { req }) => {
      if (req.query.minExperience && parseInt(maxExp) < parseInt(req.query.minExperience)) {
        throw new Error('Maximum experience must be greater than or equal to minimum experience');
      }
      return true;
    }),
    
  query('minRating')
    .optional()
    .isFloat({ min: 1, max: 5 }).withMessage('Minimum rating must be between 1 and 5'),
    
  query('languages')
    .optional()
    .custom(languages => {
      if (Array.isArray(languages)) {
        if (languages.some(lang => typeof lang !== 'string' || lang.trim().length === 0)) {
          throw new Error('All languages must be non-empty strings');
        }
      } else if (typeof languages === 'string') {
        // Handle comma-separated string
        const langArray = languages.split(',').map(lang => lang.trim());
        if (langArray.some(lang => lang.length === 0)) {
          throw new Error('Language cannot be empty');
        }
      } else {
        throw new Error('Languages must be an array or comma-separated string');
      }
      return true;
    }),
    
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot be more than 100 characters')
];

// Middleware to validate file uploads
export const validateFileUpload = (req, res, next) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({
      success: false,
      error: 'Please upload a file'
    });
  }
  
  const file = req.files.file;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Only JPEG, JPG, and PNG files are allowed'
    });
  }
  
  // Check file size
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: 'File size must be less than 5MB'
    });
  }
  
  next();
};
