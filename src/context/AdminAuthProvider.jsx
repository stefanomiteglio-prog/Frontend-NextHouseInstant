import { useState, useEffect } from 'react';
import { API_URL } from '../utils/api';
import { AdminAuthContext } from './AdminAuthContext';

export function AdminAuthProvider({ children }) {
  const [sessionToken, setSessionToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const isAdminRoute = window.location.pathname === '/admin';

  // Authenticated fetch helper
  const authenticatedFetch = async (url, options = {}) => {
    const headers = { ...options.headers };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };

  useEffect(() => {
    if (!isAdminRoute) return;

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [isAdminRoute]);

  const handleLogin = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unable to log in.');
      }

      const data = await response.json();
      setSessionToken(data.session_token);
      setUser(data.user);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authenticatedFetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    setUser(null);
    setSessionToken(null);
  };

  const value = {
    sessionToken,
    setSessionToken,
    user,
    setUser,
    authLoading,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginLoading,
    loginError,
    setLoginError,
    handleLogin,
    handleLogout,
    authenticatedFetch,
    API_URL
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
