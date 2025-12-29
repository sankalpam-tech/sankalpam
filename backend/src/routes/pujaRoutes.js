import express from 'express';
import {
  getPujas,
  getPuja,
  createPuja,
  updatePuja,
  deletePuja,
  pujaPhotoUpload
} from '../controllers/pujaController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getPujas);
router.get('/:id', getPuja);

// Protected routes (require authentication and admin role)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createPuja);
router.put('/:id', updatePuja);
router.delete('/:id', deletePuja);
router.put(
  '/:id/photo',
  upload.single('image'),
  pujaPhotoUpload
);

export default router;
