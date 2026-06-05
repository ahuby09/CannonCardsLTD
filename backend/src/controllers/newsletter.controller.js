import { subscribeToNewsletter } from '../services/newsletter.service.js';
import { validateNewsletterPayload } from '../validators/newsletter.validators.js';

export async function subscribe(req, res) {
  const payload = validateNewsletterPayload(req.body);
  const subscriber = await subscribeToNewsletter(payload);

  res.status(201).json({
    message: 'You are on the mailing list.',
    subscriber
  });
}
