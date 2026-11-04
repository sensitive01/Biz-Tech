import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '', showLabel = false, size = 'default' }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('biztech_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('biztech_theme', theme);

    // Sync across tabs & windows
    const handleStorage = (e) => {
      if (e.key === 'biztech_theme' && e.newValue) {
        setTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', e.newValue);
        if (e.newValue === 'dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail && e.detail.theme && e.detail.theme !== theme) {
        setTheme(e.detail.theme);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('themeChanged', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themeChanged', handleCustomEvent);
    };
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('biztech_theme', nextTheme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: nextTheme } }));
  };

  const isDark = theme === 'dark';
  const iconSize = size === 'small' ? 14 : 16;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'small' ? '5px 10px' : '7px 12px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        background: isDark ? '#1E293B' : '#F1F5F9',
        color: isDark ? '#F59E0B' : '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: '600',
        fontSize: size === 'small' ? '11px' : '12px',
        outline: 'none',
        flexShrink: 0
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = 'var(--primary-blue)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {isDark ? (
        <Sun size={iconSize} color="#FBBF24" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))' }} />
      ) : (
        <Moon size={iconSize} color="#475569" />
      )}
      {showLabel && (
        <span style={{ color: isDark ? '#F1F5F9' : '#334155' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;