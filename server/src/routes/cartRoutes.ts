// src/routes/cartRoutes.ts
// Cart management endpoints routing

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  addToCartValidators,
  updateCartItemValidators,
  deleteCartItemValidators,
} from '../validators/cartValidators';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from '../controllers/cartController';

const router = Router();

// All cart operations require authentication
router.use(protect);

router
  .route('/')
  .get(getCart)
  .delete(clearCart);

router
  .route('/items')
  .post(addToCartValidators, validateRequest, addToCart);

router
  .route('/items/:productId')
  .patch(updateCartItemValidators, validateRequest, updateCartItem)
  .delete(deleteCartItemValidators, validateRequest, deleteCartItem);

export default router;
