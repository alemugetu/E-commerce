import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'store-et-theme';

export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage or default to 'system'
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first (but this will be overridden by the script in index.html for FOUC prevention)
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  // Helper to apply the resolved theme to the DOM
  const applyThemeToDOM = useCallback((newResolvedTheme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);
    setResolvedTheme(newResolvedTheme);
  }, []);

  // Helper to resolve the actual theme based on current setting and system preference
  const resolveTheme = useCallback((currentTheme) => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  }, []);

  // Update theme and persist to localStorage
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyThemeToDOM(resolveTheme(newTheme));
  }, [applyThemeToDOM, resolveTheme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyThemeToDOM(resolveTheme('system'));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, applyThemeToDOM, resolveTheme]);

  // Apply initial theme on mount
  useEffect(() => {
    applyThemeToDOM(resolveTheme(theme));
  }, [theme, applyThemeToDOM, resolveTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
