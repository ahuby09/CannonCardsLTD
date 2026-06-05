import { Router } from 'express';
import { getPublicProduct, listPublicProducts } from '../controllers/product.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listPublicProducts));
router.get('/:id', asyncHandler(getPublicProduct));

export default router;
