import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('worklink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('worklink_token'));
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('worklink_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to fetch user:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const saveAuthData = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('worklink_token', newToken);
    localStorage.setItem('worklink_user', JSON.stringify(newUser));
  };

  const loginCustomer = async (credentials) => {
    const res = await API.post('/auth/customer/login', credentials);
    if (res.success) {
      saveAuthData(res.data.token, res.data.user);
    }
    return res;
  };

  const loginWorker = async (credentials) => {
    const res = await API.post('/auth/worker/login', credentials);
    if (res.success) {
      saveAuthData(res.data.token, res.data.user);
    }
    return res;
  };

  const loginAdmin = async (credentials) => {
    const res = await API.post('/auth/admin/login', credentials);
    if (res.success) {
      saveAuthData(res.data.token, res.data.user);
    }
    return res;
  };

  const registerCustomer = async (data) => {
    const res = await API.post('/auth/customer/register', data);
    if (res.success) {
      saveAuthData(res.data.token, res.data.user);
    }
    return res;
  };

  const registerWorker = async (data) => {
    const res = data instanceof FormData
      ? await API.post('/auth/worker/register', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : await API.post('/auth/worker/register', data);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('worklink_token');
    localStorage.removeItem('worklink_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => {
      const newU = { ...prev, ...updatedUser };
      localStorage.setItem('worklink_user', JSON.stringify(newU));
      return newU;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        loginCustomer,
        loginWorker,
        loginAdmin,
        registerCustomer,
        registerWorker,
        logout,
        updateUserProfile,
        setAuthData: saveAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
