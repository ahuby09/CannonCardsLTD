import { Router } from 'express';
import { createDigital, createSession } from '../controllers/checkout.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(optionalAuth);
router.post('/digital-order', asyncHandler(createDigital));
router.post('/create-session', asyncHandler(createSession));

export default router;
