import { badRequest } from '../utils/errors.js';

export function uploadProductImage(req, res) {
  if (!req.file) {
    throw badRequest('A product image file is required');
  }

  res.status(201).json({
    image_url: `/uploads/products/${req.file.filename}`,
    filename: req.file.filename,
    original_name: req.file.originalname,
    size: req.file.size,
    mime_type: req.file.mimetype
  });
}

export function uploadProductImages(req, res) {
  const files = req.files || [];
  if (!files.length) {
    throw badRequest('At least one product image file is required');
  }

  res.status(201).json({
    images: files.map((file) => ({
      image_url: `/uploads/products/${file.filename}`,
      filename: file.filename,
      original_name: file.originalname,
      size: file.size,
      mime_type: file.mimetype
    }))
  });
}
