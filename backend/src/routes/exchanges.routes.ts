import { Router } from 'express';
import { requireAuth, requireAuthOrMagicLink } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createExchangeSchema,
  updateExchangeSchema,
  addParticipantSchema,
  updateParticipantSchema,
  addExclusionSchema,
  sendInvitesSchema,
} from '../validators/exchange.validator.js';
import {
  getExchanges,
  createExchange,
  getExchange,
  updateExchange,
  deleteExchange,
  getParticipants,
  addParticipant,
  updateParticipant,
  removeParticipant,
  sendInvites,
  getExclusions,
  addExclusion,
  removeExclusion,
  drawNames,
  redrawNames,
  getMyAssignment,
  revealAssignment,
  getMessages,
  sendMessage,
} from '../controllers/exchanges.controller.js';

const router = Router();

// Routes that require full auth
router.get('/', requireAuth, getExchanges);
router.post('/', requireAuth, validateBody(createExchangeSchema), createExchange);

// Routes that can use magic link OR full auth
router.get('/:id', requireAuthOrMagicLink, validateParams(idParamSchema), getExchange);
router.patch('/:id', requireAuth, validateParams(idParamSchema), validateBody(updateExchangeSchema), updateExchange);
router.delete('/:id', requireAuth, validateParams(idParamSchema), deleteExchange);

// Participants
router.get('/:id/participants', requireAuthOrMagicLink, validateParams(idParamSchema), getParticipants);
router.post('/:id/participants', requireAuth, validateParams(idParamSchema), validateBody(addParticipantSchema), addParticipant);
router.patch('/:id/participants/:participantId', requireAuth, updateParticipant);
router.delete('/:id/participants/:participantId', requireAuth, removeParticipant);

// Send invites
router.post('/:id/send-invites', requireAuth, validateParams(idParamSchema), validateBody(sendInvitesSchema), sendInvites);

// Exclusions
router.get('/:id/exclusions', requireAuth, validateParams(idParamSchema), getExclusions);
router.post('/:id/exclusions', requireAuth, validateParams(idParamSchema), validateBody(addExclusionSchema), addExclusion);
router.delete('/:id/exclusions/:exclusionId', requireAuth, removeExclusion);

// Drawing
router.post('/:id/draw', requireAuth, validateParams(idParamSchema), drawNames);
router.post('/:id/redraw', requireAuth, validateParams(idParamSchema), redrawNames);

// Assignment
router.get('/:id/my-assignment', requireAuthOrMagicLink, validateParams(idParamSchema), getMyAssignment);
router.post('/:id/reveal', requireAuthOrMagicLink, validateParams(idParamSchema), revealAssignment);

// Chat
router.get('/:id/messages', requireAuthOrMagicLink, validateParams(idParamSchema), getMessages);
router.post('/:id/messages', requireAuthOrMagicLink, validateParams(idParamSchema), sendMessage);

export default router;
