// src/routes/productRoutes.ts
// Product routes — public reads, protected writes (Admin/Vendor)

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { uploadImage } from '../middleware/uploadMiddleware';
import {
  getProducts,
  getFeaturedProducts,
  searchProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  deleteProductImage,
} from '../controllers/productController';
import {
  createProductValidators,
  updateProductValidators,
  listProductsValidators,
  productIdParamValidator,
  productSlugParamValidator,
  imageIdParamValidator,
} from '../validators/productValidators';

const router = Router();

// ── Public routes ──────────────────────────────────────────
router.get('/',           listProductsValidators, validateRequest, getProducts);
router.get('/featured',   getFeaturedProducts);
router.get('/search',     searchProducts);
router.get('/:slug',      productSlugParamValidator, validateRequest, getProductBySlug);

// ── Protected routes (Admin or Vendor) ────────────────────
router.post(
  '/',
  protect,
  authorize('ADMIN', 'VENDOR'),
  createProductValidators,
  validateRequest,
  createProduct,
);

router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'VENDOR'),
  updateProductValidators,
  validateRequest,
  updateProduct,
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN', 'VENDOR'),
  productIdParamValidator,
  validateRequest,
  deleteProduct,
);

// ── Image management ───────────────────────────────────────
router.post(
  '/:id/images',
  protect,
  authorize('ADMIN', 'VENDOR'),
  uploadImage.single('image'),
  productIdParamValidator,
  validateRequest,
  addProductImage,
);

router.delete(
  '/:id/images/:imageId',
  protect,
  authorize('ADMIN', 'VENDOR'),
  imageIdParamValidator,
  validateRequest,
  deleteProductImage,
);

export default router;
