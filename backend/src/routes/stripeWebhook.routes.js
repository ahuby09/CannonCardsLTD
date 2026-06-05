import { Router } from 'express';
import { stripeWebhook } from '../controllers/stripeWebhook.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(stripeWebhook));

export default router;
