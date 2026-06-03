// src/routes/authRoutes.ts
// Auth route definitions — protect → validate → controller

import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  googleAuth,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  googleAuthValidators,
  verifyEmailValidators,
} from '../validators/authValidators';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes — auth rate limiter applied
router.post('/register', authLimiter, registerValidators, validateRequest, register);
router.post('/login', authLimiter, loginValidators, validateRequest, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/google', authLimiter, googleAuthValidators, validateRequest, googleAuth);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidators, validateRequest, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordValidators, validateRequest, resetPassword);
router.get('/verify-email/:token', verifyEmailValidators, validateRequest, verifyEmail);

// Protected routes
router.get('/me', protect, getMe);

export default router;
