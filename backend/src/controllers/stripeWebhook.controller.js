import { env, requireConfig } from '../config/env.js';
import { getStripe } from '../config/stripe.js';
import { processStripeEvent } from '../services/order.service.js';
import { badRequest } from '../utils/errors.js';

export async function stripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  const secret = requireConfig(env.stripeWebhookSecret, 'STRIPE_WEBHOOK_SECRET');
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (error) {
    throw badRequest(`Invalid Stripe webhook signature: ${error.message}`);
  }

  await processStripeEvent(event);

  res.json({ received: true });
}
