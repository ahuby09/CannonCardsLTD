import { createProduct, deleteProduct, getProductById, listProducts, updateInventory, updateProduct } from '../services/product.service.js';
import { parseProductFilters, validateProductPayload } from '../validators/product.validators.js';
import { badRequest } from '../utils/errors.js';

export async function listPublicProducts(req, res) {
  const products = await listProducts(parseProductFilters(req.query));
  res.json({ products });
}

export async function getPublicProduct(req, res) {
  const product = await getProductById(req.params.id);
  res.json({ product });
}

export async function listAdminProducts(req, res) {
  const products = await listProducts(parseProductFilters(req.query), { admin: true });
  res.json({ products });
}

export async function getAdminProduct(req, res) {
  const product = await getProductById(req.params.id, { admin: true });
  res.json({ product });
}

export async function createAdminProduct(req, res) {
  const payload = validateProductPayload(req.body);
  const product = await createProduct(payload);
  res.status(201).json({ product });
}

export async function updateAdminProduct(req, res) {
  const payload = validateProductPayload(req.body);
  const product = await updateProduct(req.params.id, payload);
  res.json({ product });
}

export async function deleteAdminProduct(req, res) {
  const result = await deleteProduct(req.params.id);
  res.json(result);
}

export async function patchInventory(req, res) {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw badRequest('quantity must be zero or more');
  }

  const product = await updateInventory(req.params.id, {
    quantity,
    status: req.body.status
  });
  res.json({ product });
}
