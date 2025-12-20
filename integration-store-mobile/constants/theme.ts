/**
 * Theme colors matching web app design
 */

import { Platform } from 'react-native';

// Main brand colors - matching web
const primary = '#22c55e';
const accent = '#f97316';
const sidebarBg = '#1e1e2d';

export const Colors = {
  light: {
    text: '#1e1e2d',
    textMuted: '#6b7280',
    background: '#f8f9fa',
    card: '#ffffff',
    tint: primary,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: primary,
    border: '#e5e7eb',
    primary,
    accent,
  },
  dark: {
    text: '#ffffff',
    textMuted: '#9ca3af',
    background: '#0f0f17',
    card: '#1e1e2d',
    tint: primary,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: primary,
    border: '#2d2d3d',
    primary,
    accent,
  },
};

export const Theme = {
  primary,
  accent,
  sidebarBg,
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
