import { query } from '../config/db.js';

export async function subscribeToNewsletter(payload) {
  await query(
    `
      INSERT INTO newsletter_subscribers (email, full_name, source, marketing_consent, unsubscribed_at)
      VALUES (?, ?, ?, ?, NULL)
      ON DUPLICATE KEY UPDATE
        full_name = COALESCE(VALUES(full_name), full_name),
        source = VALUES(source),
        marketing_consent = VALUES(marketing_consent),
        unsubscribed_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    `,
    [payload.email, payload.full_name, payload.source, payload.marketing_consent]
  );

  const rows = await query(
    'SELECT id, email, full_name, source, marketing_consent, created_at, updated_at FROM newsletter_subscribers WHERE email = ?',
    [payload.email]
  );

  return rows[0];
}
