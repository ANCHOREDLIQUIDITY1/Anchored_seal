import express from 'express';
import { getMe, updateProfile, updatePassword, updateNotifications } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/me', getMe);
router.patch('/me', updateProfile);
router.patch('/me/password', updatePassword);
router.patch('/me/notifications', updateNotifications);

export default router;
