import { Router } from 'express';
import { getRates } from '../controllers/shipping.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(optionalAuth);
router.post('/rates', asyncHandler(getRates));

export default router;
