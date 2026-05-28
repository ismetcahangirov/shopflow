// src/routes/vendorRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize, requireApprovedVendor } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { applyVendorValidators, updateVendorStatusValidators, updateMyVendorValidators } from '../validators/vendorValidators';
import { applyVendor, getVendors, updateVendorStatus, getMyVendor, updateMyVendor, getMyVendorStats } from '../controllers/vendorController';

const router = Router();

router.use(protect);

router.post('/apply', applyVendorValidators, validateRequest, applyVendor);

router.get('/me', getMyVendor);
router.put('/me', requireApprovedVendor, updateMyVendorValidators, validateRequest, updateMyVendor);
router.get('/me/stats', requireApprovedVendor, getMyVendorStats);

router.get('/', authorize('ADMIN'), getVendors);
router.patch('/:id/status', authorize('ADMIN'), updateVendorStatusValidators, validateRequest, updateVendorStatus);

export default router;
