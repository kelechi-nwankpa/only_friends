import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/auth.controller.js';

const router = Router();

// Clerk webhook - syncs user data
router.post('/webhook', handleClerkWebhook);

export default router;
