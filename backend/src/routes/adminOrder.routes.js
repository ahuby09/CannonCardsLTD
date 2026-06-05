import { Router } from 'express';
import { deleteAdminOrder, generateLabel, getAdminOrder, listAdminOrders, markPaidLocalTest, updateStatus } from '../controllers/adminOrder.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', asyncHandler(listAdminOrders));
router.get('/:id', asyncHandler(getAdminOrder));
router.patch('/:id/test-mark-paid', asyncHandler(markPaidLocalTest));
router.post('/:id/shippo/label', asyncHandler(generateLabel));
router.patch('/:id/status', asyncHandler(updateStatus));
router.delete('/:id', asyncHandler(deleteAdminOrder));

export default router;
