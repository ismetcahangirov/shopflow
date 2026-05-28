// src/routes/addressRoutes.ts
// Address management endpoints routing

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createAddressValidators,
  updateAddressValidators,
  addressIdParamValidator,
} from '../validators/addressValidators';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController';

const router = Router();

// All address operations require authentication (Customer only)
router.use(protect);

router
  .route('/')
  .get(getAddresses)
  .post(createAddressValidators, validateRequest, createAddress);

router
  .route('/:id')
  .put(updateAddressValidators, validateRequest, updateAddress)
  .delete(addressIdParamValidator, validateRequest, deleteAddress);

router.patch('/:id/default', addressIdParamValidator, validateRequest, setDefaultAddress);

export default router;
