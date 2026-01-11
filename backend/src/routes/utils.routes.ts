import { Router } from 'express';
import { requireAuth, requirePremium } from '../middleware/auth.js';
import { extractUrlMetadata, getGiftSuggestions } from '../controllers/utils.controller.js';

const router = Router();

// URL metadata extraction
router.post('/extract-url', requireAuth, extractUrlMetadata);

// AI gift suggestions (premium feature)
router.post('/gift-suggestions', requireAuth, requirePremium, getGiftSuggestions);

export default router;
