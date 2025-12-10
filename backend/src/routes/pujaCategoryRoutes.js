import express from 'express';
import {
  getPujaCategories,
  getPujaCategory,
  createPujaCategory,
  updatePujaCategory,
  deletePujaCategory,
  pujaCategoryPhotoUpload
} from '../controllers/pujaCategoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getPujaCategories);
router.get('/:id', getPujaCategory);

// Protected routes (require authentication and admin role)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createPujaCategory);
router.put('/:id', updatePujaCategory);
router.delete('/:id', deletePujaCategory);
router.put(
  '/:id/photo',
  upload.single('image'),
  pujaCategoryPhotoUpload
);

export default router;
