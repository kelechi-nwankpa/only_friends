import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMe,
  updateMe,
  searchUsers,
  registerPushToken,
  removePushToken,
} from '../controllers/users.controller.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get current user
router.get('/me', getMe);

// Update current user
router.patch('/me', updateMe);

// Search users (for sharing)
router.get('/search', searchUsers);

// Push notification tokens
router.post('/me/push-token', registerPushToken);
router.delete('/me/push-token', removePushToken);

export default router;
