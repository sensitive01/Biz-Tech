import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [tenantType, setTenantType] = useState(() => {
    return Number(localStorage.getItem('tenantType')) || 1;
  });

  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem('modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isAuthenticated = Boolean(token);

  const login = useCallback((newToken, newUser, newType = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      if (newUser.businessType || newType) {
        const typeNum = Number(newType || newUser.businessType);
        localStorage.setItem('tenantType', String(typeNum));
        setTenantType(typeNum);
      }
      if (newUser.modules) {
        localStorage.setItem('modules', JSON.stringify(newUser.modules));
        setModules(newUser.modules);
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantType');
    localStorage.removeItem('modules');
    setToken('');
    setUser(null);
    setTenantType(1);
    setModules([]);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Sync auth state across browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue || '');
      } else if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      } else if (e.key === 'tenantType') {
        setTenantType(Number(e.newValue) || 1);
      } else if (e.key === 'modules') {
        try {
          setModules(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setModules([]);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = {
    token,
    user,
    tenantType,
    modules,
    isAuthenticated,
    login,
    logout,
    updateUser,
    setTenantType,
    setModules,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Graceful fallback for components used outside AuthProvider
    const token = localStorage.getItem('token') || '';
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {}
    return {
      token,
      user,
      tenantType: Number(localStorage.getItem('tenantType')) || 1,
      modules: [],
      isAuthenticated: Boolean(token),
      login: () => {},
      logout: () => {},
      updateUser: () => {},
    };
  }
  return context;
};

export default AuthContext;