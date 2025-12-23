import express from 'express';
import {
  getUsers,
  getUser,
  updateUserProfile,
  uploadProfilePhoto,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.route('/profile')
  .put(updateUserProfile);

router.route('/profile/photo')
  .put(upload.single('profilePhoto'), uploadProfilePhoto);

// Admin routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;