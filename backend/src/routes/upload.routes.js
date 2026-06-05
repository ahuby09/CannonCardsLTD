import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { Router } from 'express';
import { uploadProductImage, uploadProductImages } from '../controllers/upload.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads/products');

fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeBase = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'product-image';

    callback(null, `${Date.now()}-${Math.random().toString(16).slice(2)}-${safeBase}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 6 * 1024 * 1024
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only JPG, PNG, WebP, and GIF images are allowed');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      callback(error);
      return;
    }

    callback(null, true);
  }
});

const router = Router();

router.use(requireAuth, requireAdmin);
router.post('/product-image', upload.single('image'), asyncHandler(uploadProductImage));
router.post('/product-images', upload.array('images', 12), asyncHandler(uploadProductImages));

export default router;
