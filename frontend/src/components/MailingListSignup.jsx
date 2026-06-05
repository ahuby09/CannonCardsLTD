import { useState } from 'react';
import { newsletterApi } from '../api/newsletterApi.js';
import ErrorMessage from './ErrorMessage.jsx';

export default function MailingListSignup() {
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await newsletterApi.subscribe({
        ...form,
        source: 'homepage',
        marketing_consent: true
      });
      setSuccess(true);
      setForm({ full_name: '', email: '' });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mailing-list">
      <div>
        <p className="eyebrow">Mailing list</p>
        <h2>Get first dibs on pre-releases</h2>
        <p>Join for early access to pre-release stock, restocks, sealed drops, and standout singles before they hit the main shop.</p>
      </div>
      <form onSubmit={submit}>
        <label>
          Name
          <input value={form.full_name} onChange={(event) => update('full_name', event.target.value)} placeholder="Optional" />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" required />
        </label>
        <button disabled={loading}>{loading ? 'Joining...' : 'Join mailing list'}</button>
        {success && <div className="alert success">You are on the list. Watch your inbox for early access.</div>}
        <ErrorMessage error={error} />
        <small>By joining, you agree to receive store updates. You can unsubscribe any time.</small>
      </form>
    </section>
  );
}
