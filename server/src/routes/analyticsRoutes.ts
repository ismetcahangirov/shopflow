// src/routes/analyticsRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { dashboardValidators, salesChartValidators } from '../validators/analyticsValidators';
import { getDashboard, getSalesChart } from '../controllers/analyticsController';

const router = Router();

router.use(protect);
router.get('/dashboard', authorize('ADMIN', 'VENDOR'), dashboardValidators, validateRequest, getDashboard);
router.get('/sales', authorize('ADMIN'), salesChartValidators, validateRequest, getSalesChart);

export default router;
