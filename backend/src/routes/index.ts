import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import wishlistRoutes from './wishlists.routes.js';
import itemRoutes from './items.routes.js';
import groupRoutes from './groups.routes.js';
import exchangeRoutes from './exchanges.routes.js';
import magicRoutes from './magic.routes.js';
import publicRoutes from './public.routes.js';
import utilsRoutes from './utils.routes.js';

const router = Router();

// Auth routes (webhooks)
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Wishlist routes
router.use('/wishlists', wishlistRoutes);

// Item routes
router.use('/items', itemRoutes);

// Group routes
router.use('/groups', groupRoutes);

// Exchange routes
router.use('/exchanges', exchangeRoutes);

// Magic link routes
router.use('/magic', magicRoutes);

// Public routes (no auth required)
router.use('/public', publicRoutes);

// Utility routes
router.use('/utils', utilsRoutes);

export default router;
