// src/routes/settingsRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, authorize('ADMIN'), validateRequest, updateSettings);

export default router;
