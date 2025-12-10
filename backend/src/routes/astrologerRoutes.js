import express from 'express';
import {
  getAstrologers,
  getAstrologer,
  createAstrologer,
  updateAstrologer,
  deleteAstrologer,
  uploadAstrologerPhoto,
  getAstrologerSlots,
  getUpcomingSessions,
  getPastSessions,
  getAstrologerStats,
  verifyDocument,
  uploadDocument,
  deleteDocument
} from '../controllers/astrologerController.js';

import {
  createAstrologerRules,
  updateAstrologerRules,
  uploadDocumentRules,
  verifyDocumentRules,
  getAvailableSlotsRules,
  getSessionsRules,
  getStatsRules,
  listAstrologersRules,
  validateFileUpload
} from '../middleware/validators/astrologerValidator.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/', listAstrologersRules, validate, getAstrologers);
router.get('/:id', getAstrologer);
router.get('/:id/slots', getAvailableSlotsRules, validate, getAstrologerSlots);

// Protected routes (require authentication)
router.use(protect);

// Routes accessible by astrologers and admins
router.get(
  '/:id/sessions/upcoming',
  getSessionsRules,
  validate,
  getUpcomingSessions
);

router.get(
  '/:id/sessions/past',
  getSessionsRules,
  validate,
  getPastSessions
);

router.get(
  '/:id/stats',
  getStatsRules,
  validate,
  getAstrologerStats
);

// Routes for document management
router.post(
  '/:id/documents',
  uploadDocumentRules,
  validate,
  uploadDocument
);

router.put(
  '/:id/verify-document/:docId',
  authorize('admin'),
  verifyDocumentRules,
  validate,
  verifyDocument
);

router.delete(
  '/:id/documents/:docId',
  uploadDocumentRules,
  validate,
  deleteDocument
);

// Admin-only routes
router.post(
  '/',
  authorize('admin'),
  createAstrologerRules,
  validate,
  createAstrologer
);

router.put(
  '/:id',
  updateAstrologerRules,
  validate,
  updateAstrologer
);

router.delete(
  '/:id',
  authorize('admin'),
  deleteAstrologer
);

// Photo upload route
router.put(
  '/:id/photo',
  validateFileUpload,
  uploadAstrologerPhoto
);

export default router;
