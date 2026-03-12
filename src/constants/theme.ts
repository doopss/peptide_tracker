// Design System Constants
export const COLORS = {
  // Core colors
  background: '#0A0A0F',
  cardBackground: '#1C1C24',
  primary: '#1ABC9C',
  primaryDark: '#158F77',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  
  // Status colors
  success: '#1ABC9C',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  
  // Category colors
  recovery: '#E74C3C',
  growth: '#9B59B6',
  cognitive: '#3498DB',
  metabolic: '#F39C12',
  longevity: '#E91E63',
  
  // UI colors
  border: 'rgba(255, 255, 255, 0.1)',
  activeTab: '#1ABC9C',
  inactiveTab: 'rgba(255, 255, 255, 0.5)',
  inputBackground: '#12121A',
  
  // Badge colors
  activeBadge: '#1ABC9C',
  inactiveBadge: '#6B7280',
  pausedBadge: '#F59E0B',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
