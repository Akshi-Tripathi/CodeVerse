import React, { useEffect } from 'react';
import { themes } from '../config/themes';

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred-theme') || 'dark';
    const theme = themes[savedTheme];
    
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }, []);

  return <>{children}</>;
};