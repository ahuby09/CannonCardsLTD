import Stripe from 'stripe';
import { env, requireConfig } from './env.js';

let stripeClient;

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(requireConfig(env.stripeSecretKey, 'STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia'
    });
  }

  return stripeClient;
}
