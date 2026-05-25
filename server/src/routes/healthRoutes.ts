// src/routes/healthRoutes.ts
// Health check route — GET /api/health

import { Router } from 'express';
import { getHealth } from '../controllers/healthController';

const router = Router();

router.get('/', getHealth);

export default router;
