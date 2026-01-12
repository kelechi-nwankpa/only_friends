import { Router } from 'express';
import { validateMagicLink, claimMagicLink } from '../controllers/magic.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Validate magic link token (no auth required)
router.get('/:token', validateMagicLink);

// Claim magic link - link authenticated user to participant (auth required)
router.post('/:token/claim', requireAuth, claimMagicLink);

export default router;
