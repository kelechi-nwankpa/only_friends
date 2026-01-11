import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { getPublicWishlist } from '../controllers/public.controller.js';

const router = Router();

// Public wishlist view (no auth required, but optional auth for reservation visibility)
router.get('/lists/:slug', optionalAuth, getPublicWishlist);

export default router;
