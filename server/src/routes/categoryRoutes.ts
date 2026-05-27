// src/routes/categoryRoutes.ts
// Category routes: protect → authorize → validate → controller

import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { uploadImage } from '../middleware/uploadMiddleware';
import {
  createCategoryValidators,
  updateCategoryValidators,
  categoryIdParamValidator,
  categorySlugParamValidator,
} from '../validators/categoryValidators';

const router = Router();

// ── Public routes ─────────────────────────────────────────
router.get('/', getCategories);
router.get('/:slug', categorySlugParamValidator, validateRequest, getCategoryBySlug);

// ── Admin-only routes ─────────────────────────────────────
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  createCategoryValidators,
  validateRequest,
  createCategory,
);

router.put(
  '/:id',
  protect,
  authorize('ADMIN'),
  updateCategoryValidators,
  validateRequest,
  updateCategory,
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  categoryIdParamValidator,
  validateRequest,
  deleteCategory,
);

router.post(
  '/upload',
  protect,
  authorize('ADMIN'),
  uploadImage.single('image'),
  uploadCategoryImage,
);

export default router;
