import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
          light: {
                    name: 'light',
                    // Background colors
                    bgPrimary: '#f5f5f5',
                    bgSecondary: '#ffffff',
                    bgCard: '#ffffff',
                    // Text colors
                    textPrimary: '#1e1e2d',
                    textSecondary: '#6b7280',
                    textMuted: '#9ca3af',
                    // Border colors
                    borderColor: '#e5e7eb',
                    borderLight: '#f3f4f6',
                    // Accent colors
                    accent: '#22c55e',
                    accentLight: '#dcfce7',
                    accentHover: '#16a34a',
                    // Status colors
                    success: '#22c55e',
                    warning: '#f97316',
                    error: '#ef4444',
                    info: '#2563eb',
                    // Shadow
                    shadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                    shadowHover: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    // Sidebar
                    sidebarBg: '#1e1e2d',
                    sidebarText: '#8b8b9e',
                    sidebarActiveText: '#ffffff',
          },
          dark: {
                    name: 'dark',
                    // Background colors
                    bgPrimary: '#0f0f14',
                    bgSecondary: '#1a1a24',
                    bgCard: '#1e1e2d',
                    // Text colors
                    textPrimary: '#f1f5f9',
                    textSecondary: '#94a3b8',
                    textMuted: '#64748b',
                    // Border colors
                    borderColor: '#2d2d3d',
                    borderLight: '#252535',
                    // Accent colors
                    accent: '#22c55e',
                    accentLight: '#14532d',
                    accentHover: '#16a34a',
                    // Status colors
                    success: '#22c55e',
                    warning: '#f97316',
                    error: '#ef4444',
                    info: '#3b82f6',
                    // Shadow
                    shadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
                    shadowHover: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    // Sidebar
                    sidebarBg: '#0a0a0f',
                    sidebarText: '#6b7280',
                    sidebarActiveText: '#ffffff',
          }
};

export function ThemeProvider({ children }) {
          const [theme, setTheme] = useState(() => {
                    const saved = localStorage.getItem('theme');
                    return saved || 'light';
          });

          useEffect(() => {
                    localStorage.setItem('theme', theme);
                    document.documentElement.setAttribute('data-theme', theme);

                    // Apply CSS variables to root
                    const themeColors = themes[theme];
                    const root = document.documentElement;

                    root.style.setProperty('--bg-primary', themeColors.bgPrimary);
                    root.style.setProperty('--bg-secondary', themeColors.bgSecondary);
                    root.style.setProperty('--bg-card', themeColors.bgCard);
                    root.style.setProperty('--text-primary', themeColors.textPrimary);
                    root.style.setProperty('--text-secondary', themeColors.textSecondary);
                    root.style.setProperty('--text-muted', themeColors.textMuted);
                    root.style.setProperty('--border-color', themeColors.borderColor);
                    root.style.setProperty('--border-light', themeColors.borderLight);
                    root.style.setProperty('--accent', themeColors.accent);
                    root.style.setProperty('--accent-light', themeColors.accentLight);
                    root.style.setProperty('--shadow', themeColors.shadow);
                    root.style.setProperty('--sidebar-bg', themeColors.sidebarBg);
                    root.style.setProperty('--sidebar-text', themeColors.sidebarText);
          }, [theme]);

          const toggleTheme = () => {
                    setTheme(prev => prev === 'light' ? 'dark' : 'light');
          };

          const currentTheme = themes[theme];

          return (
                    <ThemeContext.Provider value={{ theme, toggleTheme, currentTheme, themes }}>
                              {children}
                    </ThemeContext.Provider>
          );
}

export function useTheme() {
          const context = useContext(ThemeContext);
          if (!context) {
                    throw new Error('useTheme must be used within a ThemeProvider');
          }
          return context;
}

export default ThemeContext;
