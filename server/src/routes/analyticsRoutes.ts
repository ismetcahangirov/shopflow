// src/routes/analyticsRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { getDashboard, getSalesChart } from '../controllers/analyticsController';

const router = Router();

router.use(protect);
router.get('/dashboard', authorize('ADMIN', 'VENDOR'), getDashboard);
router.get('/sales', authorize('ADMIN'), getSalesChart);

export default router;
