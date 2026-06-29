import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function login(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  // Used after profile edits: the backend re-signs the JWT with the updated
  // name/phone, so we store both exactly like a fresh login.
  function updateUser(token, userData) {
    login(token, userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  async function register(payload) {
    const { data } = await api.post('/register', payload);
    login(data.token, data.user);
    return data;
  }

  async function loginWithCredentials(email, password) {
    const { data } = await api.post('/login', { email, password });
    login(data.token, data.user);
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithCredentials, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
