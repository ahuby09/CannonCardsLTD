import { Router } from 'express';
import { autocomplete, imageProxy } from '../controllers/pokewallet.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/pokewallet/images/:id', asyncHandler(imageProxy));
router.get('/admin/pokewallet/search', requireAuth, requireAdmin, asyncHandler(autocomplete));

export default router;
