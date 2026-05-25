import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
});

function applyTheme(preference) {
  document.documentElement.setAttribute('data-theme', preference);
  document.body.setAttribute('data-theme', preference);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}