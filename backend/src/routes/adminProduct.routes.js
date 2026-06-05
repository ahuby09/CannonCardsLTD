import { Router } from 'express';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProduct,
  listAdminProducts,
  patchInventory,
  updateAdminProduct
} from '../controllers/product.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', asyncHandler(listAdminProducts));
router.post('/', asyncHandler(createAdminProduct));
router.get('/:id', asyncHandler(getAdminProduct));
router.put('/:id', asyncHandler(updateAdminProduct));
router.delete('/:id', asyncHandler(deleteAdminProduct));
router.patch('/:id/inventory', asyncHandler(patchInventory));

export default router;
