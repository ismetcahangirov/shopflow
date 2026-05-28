// src/routes/reviewRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createReviewValidators, reviewIdParamValidator } from '../validators/reviewValidators';
import { getReviews, createReview, approveReview, deleteReview } from '../controllers/reviewController';

const router = Router();

router.get('/', getReviews);

router.use(protect);
router.post('/', createReviewValidators, validateRequest, createReview);

router.use(authorize('ADMIN'));
router.patch('/:id/approve', reviewIdParamValidator, validateRequest, approveReview);
router.delete('/:id', reviewIdParamValidator, validateRequest, deleteReview);

export default router;
