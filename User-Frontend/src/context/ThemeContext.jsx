import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('biztech_theme') || 'light';
  });

  const applyTheme = useCallback((targetTheme) => {
    document.documentElement.setAttribute('data-theme', targetTheme);
    if (targetTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('biztech_theme', theme);

    // Sync across tabs
    const handleStorage = (e) => {
      if (e.key === 'biztech_theme' && e.newValue) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    const handleCustom = (e) => {
      if (e.detail?.theme && e.detail.theme !== theme) {
        setTheme(e.detail.theme);
        applyTheme(e.detail.theme);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('themeChanged', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themeChanged', handleCustom);
    };
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('biztech_theme', next);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
      return next;
    });
  }, [applyTheme]);

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    const current = localStorage.getItem('biztech_theme') || 'light';
    return {
      theme: current,
      isDark: current === 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};

export default ThemeContext;