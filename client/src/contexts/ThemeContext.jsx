import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Достаем сохраненную тему из localStorage или ставим 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  // Темы оформления
  const themes = {
    dark: {
      name: 'Тёмная',
      colors: {
        background: '#1a1a1a',
        surface: '#2d2d2d',
        primary: '#667eea',
        secondary: '#764ba2',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#404040',
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        card: '#333333',
        hover: '#404040'
      }
    },
    light: {
      name: 'Светлая',
      colors: {
        background: '#f5f5f5',
        surface: '#ffffff',
        primary: '#667eea',
        secondary: '#764ba2',
        text: '#333333',
        textSecondary: '#666666',
        border: '#e0e0e0',
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        card: '#ffffff',
        hover: '#f0f0f0'
      }
    },
    blue: {
      name: 'Синяя',
      colors: {
        background: '#1e3c72',
        surface: '#2a4a7a',
        primary: '#64b5f6',
        secondary: '#1976d2',
        text: '#ffffff',
        textSecondary: '#bbdefb',
        border: '#3a5a8a',
        success: '#66bb6a',
        error: '#ef5350',
        warning: '#ffa726',
        card: '#2a4a7a',
        hover: '#3a5a8a'
      }
    },
    green: {
      name: 'Зелёная',
      colors: {
        background: '#1b5e20',
        surface: '#2e7d32',
        primary: '#81c784',
        secondary: '#4caf50',
        text: '#ffffff',
        textSecondary: '#c8e6c9',
        border: '#3e8e41',
        success: '#66bb6a',
        error: '#ef5350',
        warning: '#ffa726',
        card: '#2e7d32',
        hover: '#3e8e41'
      }
    },
    purple: {
      name: 'Фиолетовая',
      colors: {
        background: '#4a148c',
        surface: '#6a1b9a',
        primary: '#ba68c8',
        secondary: '#9c27b0',
        text: '#ffffff',
        textSecondary: '#e1bee7',
        border: '#7b1fa2',
        success: '#66bb6a',
        error: '#ef5350',
        warning: '#ffa726',
        card: '#6a1b9a',
        hover: '#7b1fa2'
      }
    }
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const currentColors = themes[theme]?.colors || themes.dark.colors;

  return (
    <ThemeContext.Provider value={{
      theme,
      themes,
      currentColors,
      changeTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
