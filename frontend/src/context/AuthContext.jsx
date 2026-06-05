import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi.js';
import { getAuthToken, setAuthToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    if (!getAuthToken()) return;

    authApi.me()
      .then((data) => setUser(data.user))
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(payload) {
    const data = await authApi.login(payload);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      if (getAuthToken()) {
        await authApi.logout();
      }
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
