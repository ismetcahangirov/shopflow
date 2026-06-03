// src/routes/userRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { uploadImage } from '../middleware/uploadMiddleware';
import { updateProfileValidators, updatePasswordValidators, toggleStatusValidators, getUsersValidators } from '../validators/userValidators';
import { getUsers, updateProfile, updatePassword, updateAvatar, toggleUserStatus } from '../controllers/userController';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN'), getUsersValidators, validateRequest, getUsers);

router.put('/me', updateProfileValidators, validateRequest, updateProfile);
router.put('/me/password', updatePasswordValidators, validateRequest, updatePassword);
router.post('/me/avatar', uploadImage.single('avatar'), updateAvatar);

router.patch('/:id/status', authorize('ADMIN'), toggleStatusValidators, validateRequest, toggleUserStatus);

export default router;
