import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('educamais_token');
    const storedUser = localStorage.getItem('educamais_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {
        localStorage.removeItem('educamais_user');
      }
    }
    setLoading(false);
  }, []);

  const persist = (token, userData) => {
    localStorage.setItem('educamais_token', token);
    localStorage.setItem('educamais_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    setError('');
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setError('');
    const data = await api.register(payload);
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('educamais_token');
    localStorage.removeItem('educamais_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
