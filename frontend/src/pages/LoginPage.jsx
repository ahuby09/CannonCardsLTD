import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState(null);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <main className="page auth-page">
      <form className="auth-box" onSubmit={submit}>
        <div className="tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
        </div>
        <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        {mode === 'register' && (
          <label>
            Full name
            <input value={form.full_name} onChange={(event) => update('full_name', event.target.value)} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required />
        </label>
        <ErrorMessage error={error} />
        <button>{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </main>
  );
}
