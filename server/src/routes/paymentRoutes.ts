// src/routes/paymentRoutes.ts
// Payment management endpoints routing

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createPaymentIntentValidators, createRefundValidators } from '../validators/paymentValidators';
import { createPaymentIntent, createRefund } from '../controllers/paymentController';

const router = Router();

router.use(protect);

router.post('/create-intent', createPaymentIntentValidators, validateRequest, createPaymentIntent);

router.post('/refund', authorize('ADMIN'), createRefundValidators, validateRequest, createRefund);

export default router;
