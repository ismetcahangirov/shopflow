// src/routes/wishlistRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { addToWishlistValidators, removeFromWishlistValidator } from '../validators/wishlistValidators';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlistValidators, validateRequest, addToWishlist);

router.delete('/:productId', removeFromWishlistValidator, validateRequest, removeFromWishlist);

export default router;
