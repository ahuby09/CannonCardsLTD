import { Router } from 'express';
import { getConfirmationOrder, getCustomerOrder, getCustomerOrders } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/confirmation/:sessionId', asyncHandler(getConfirmationOrder));
router.get('/', requireAuth, asyncHandler(getCustomerOrders));
router.get('/:id', requireAuth, asyncHandler(getCustomerOrder));

export default router;
