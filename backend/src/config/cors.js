import { env } from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    const allowed = env.clientOrigin.split(',').map((item) => item.trim());

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Token'],
  credentials: false
};
