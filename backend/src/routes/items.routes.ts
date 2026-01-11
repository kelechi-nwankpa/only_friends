import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { updateItemSchema, updateReservationSchema } from '../validators/wishlist.validator.js';
import {
  getItem,
  updateItem,
  deleteItem,
  reserveItem,
  releaseReservation,
  updateReservation,
  enablePriceAlert,
  disablePriceAlert,
  getPriceHistory,
} from '../controllers/items.controller.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Item CRUD
router.get('/:id', validateParams(idParamSchema), getItem);
router.patch('/:id', validateParams(idParamSchema), validateBody(updateItemSchema), updateItem);
router.delete('/:id', validateParams(idParamSchema), deleteItem);

// Reservations
router.post('/:id/reserve', validateParams(idParamSchema), reserveItem);
router.delete('/:id/reserve', validateParams(idParamSchema), releaseReservation);
router.patch('/:id/reserve', validateParams(idParamSchema), validateBody(updateReservationSchema), updateReservation);

// Price alerts
router.post('/:id/price-alert', validateParams(idParamSchema), enablePriceAlert);
router.delete('/:id/price-alert', validateParams(idParamSchema), disablePriceAlert);
router.get('/:id/price-history', validateParams(idParamSchema), getPriceHistory);

export default router;
