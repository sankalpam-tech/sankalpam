import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validate,
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/forgotpassword', validate(forgotPasswordValidation), forgotPassword);
router.put('/resetpassword/:resettoken', validate(resetPasswordValidation), resetPassword);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', validate(updateDetailsValidation), updateDetails);
router.put('/updatepassword', validate(updatePasswordValidation), updatePassword);
router.get('/logout', logout);

export default router;
