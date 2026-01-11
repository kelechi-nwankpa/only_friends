import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createGroupSchema, updateGroupSchema } from '../validators/group.validator.js';
import {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  generateInviteCode,
  joinGroup,
  getMembers,
  removeMember,
  getGroupWishlists,
} from '../controllers/groups.controller.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Group CRUD
router.get('/', getGroups);
router.post('/', validateBody(createGroupSchema), createGroup);
router.get('/:id', validateParams(idParamSchema), getGroup);
router.patch('/:id', validateParams(idParamSchema), validateBody(updateGroupSchema), updateGroup);
router.delete('/:id', validateParams(idParamSchema), deleteGroup);

// Invite code
router.post('/:id/invite-code', validateParams(idParamSchema), generateInviteCode);

// Join group
router.post('/join/:code', joinGroup);

// Members
router.get('/:id/members', validateParams(idParamSchema), getMembers);
router.delete('/:id/members/:userId', removeMember);

// Wishlists shared with group
router.get('/:id/wishlists', validateParams(idParamSchema), getGroupWishlists);

export default router;
