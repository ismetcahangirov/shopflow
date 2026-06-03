// src/routes/orderRoutes.ts
// Order management endpoints routing

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createOrderValidators,
  orderIdParamValidator,
  updateOrderStatusValidators,
  cancelOrderValidators,
  getOrdersQueryValidators,
  getMyOrdersQueryValidators,
} from '../validators/orderValidators';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';

const router = Router();

router.use(protect);

router.post('/', createOrderValidators, validateRequest, createOrder);

router.get('/my', getMyOrdersQueryValidators, validateRequest, getMyOrders);

router.get('/:id', orderIdParamValidator, validateRequest, getOrder);

router.get('/', authorize('ADMIN'), getOrdersQueryValidators, validateRequest, getOrders);

router.patch('/:id/status', authorize('ADMIN'), updateOrderStatusValidators, validateRequest, updateOrderStatus);

router.post('/:id/cancel', cancelOrderValidators, validateRequest, cancelOrder);

export default router;
