import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import adminProductRoutes from './routes/adminProduct.routes.js';
import cartRoutes from './routes/cart.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import stripeWebhookRoutes from './routes/stripeWebhook.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminOrderRoutes from './routes/adminOrder.routes.js';
import pokewalletRoutes from './routes/pokewallet.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors(corsOptions));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/uploads', uploadRoutes);
app.use('/api', pokewalletRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
