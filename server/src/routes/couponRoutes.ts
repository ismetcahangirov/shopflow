// src/routes/couponRoutes.ts
// Coupon management endpoints routing

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createCouponValidators,
  updateCouponValidators,
  validateCouponValidators,
  couponIdParamValidator,
} from '../validators/couponValidators';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController';

const router = Router();

// All coupon operations require authentication
router.use(protect);

// Customer endpoints
router.post('/validate', validateCouponValidators, validateRequest, validateCoupon);

// Admin-only endpoints
router.use(authorize('ADMIN'));

router
  .route('/')
  .get(getCoupons)
  .post(createCouponValidators, validateRequest, createCoupon);

router
  .route('/:id')
  .put(updateCouponValidators, validateRequest, updateCoupon)
  .delete(couponIdParamValidator, validateRequest, deleteCoupon);

export default router;
