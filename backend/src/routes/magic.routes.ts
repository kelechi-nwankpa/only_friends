import { Router } from 'express';
import { validateMagicLink } from '../controllers/magic.controller.js';

const router = Router();

// Validate magic link token (no auth required)
router.get('/:token', validateMagicLink);

export default router;
