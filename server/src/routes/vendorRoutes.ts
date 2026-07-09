// src/routes/vendorRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize, requireApprovedVendor } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { uploadImage } from '../middleware/uploadMiddleware';
import {
  applyVendorValidators,
  updateVendorStatusValidators,
  updateMyVendorValidators,
  getVendorsValidators,
  getVendorOrdersValidators,
  getVendorSalesValidators,
  dashboardPeriodValidators,
} from '../validators/vendorValidators';
import {
  applyVendor,
  getVendors,
  updateVendorStatus,
  getMyVendor,
  updateMyVendor,
  getMyVendorStats,
  getMyVendorDashboard,
  getMyVendorOrders,
  getMyVendorSales,
  uploadVendorLogo,
  uploadVendorBanner,
} from '../controllers/vendorController';

const router = Router();

router.use(protect);

router.post('/apply', applyVendorValidators, validateRequest, applyVendor);

router.get('/me', getMyVendor);
router.put('/me', requireApprovedVendor, updateMyVendorValidators, validateRequest, updateMyVendor);
router.get('/me/stats', requireApprovedVendor, getMyVendorStats);
router.get('/me/dashboard', requireApprovedVendor, dashboardPeriodValidators, validateRequest, getMyVendorDashboard);
router.get('/me/orders', requireApprovedVendor, getVendorOrdersValidators, validateRequest, getMyVendorOrders);
router.get('/me/analytics/sales', requireApprovedVendor, getVendorSalesValidators, validateRequest, getMyVendorSales);
router.post('/me/logo', requireApprovedVendor, uploadImage.single('logo'), uploadVendorLogo);
router.post('/me/banner', requireApprovedVendor, uploadImage.single('banner'), uploadVendorBanner);

router.get('/', authorize('ADMIN'), getVendorsValidators, validateRequest, getVendors);
router.patch('/:id/status', authorize('ADMIN'), updateVendorStatusValidators, validateRequest, updateVendorStatus);

export default router;
