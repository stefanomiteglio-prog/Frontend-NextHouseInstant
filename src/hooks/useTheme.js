import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('nh_theme');
      if (savedTheme && ['system', 'dark', 'light'].includes(savedTheme)) {
        return savedTheme;
      }
    } catch {
      // Ignore localStorage read errors
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      let currentResolved = 'dark';
      if (theme === 'system') {
        currentResolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        currentResolved = theme;
      }
      setResolvedTheme(currentResolved);

      // Set data-theme attribute on root html element
      if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    };

    updateResolvedTheme();

    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (!['system', 'dark', 'light'].includes(newTheme)) return;
    setTheme(newTheme);
    try {
      localStorage.setItem('nh_theme', newTheme);
    } catch {
      // Ignore localStorage write errors
    }
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      changeTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (theme === 'dark') {
      changeTheme('light');
    } else {
      changeTheme('system');
    }
  };

  return { theme, resolvedTheme, changeTheme, toggleTheme };
}
