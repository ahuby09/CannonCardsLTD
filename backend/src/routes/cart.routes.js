import { Router } from 'express';
import { addItem, deleteCart, deleteItem, getCart, updateItem } from '../controllers/cart.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(optionalAuth);
router.get('/', asyncHandler(getCart));
router.post('/items', asyncHandler(addItem));
router.patch('/items/:id', asyncHandler(updateItem));
router.delete('/items/:id', asyncHandler(deleteItem));
router.delete('/', asyncHandler(deleteCart));

export default router;
