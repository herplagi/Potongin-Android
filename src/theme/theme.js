// src/theme/theme.js - MODERN DESIGN SYSTEM v2.0 - FULLY FIXED

export const COLORS = {
  // Primary Colors
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  primaryBg: '#F5F3FF',
  
  // Neutral Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFC',
  surfaceAlt: '#F1F5F9', // ✅ TAMBAH INI
  
  // Text Colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status Colors (as objects)
  success: { 
    bg: '#ECFDF5', 
    text: '#059669', 
    border: '#D1FAE5',
    main: '#10B981' // ✅ TAMBAH INI untuk warna solid
  },
  error: { 
    bg: '#FEF2F2', 
    text: '#DC2626', 
    border: '#FEE2E2',
    main: '#EF4444' // ✅ TAMBAH INI
  },
  statusCompleted: { bg: '#ECFDF5', text: '#059669' },
  
  // Accent Colors
  accent: '#F59E0B',
  accentGreen: '#10B981',
  accentBlue: '#3B82F6',
  accentRed: '#EF4444',
  
  // Border Colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  divider: '#E5E7EB', // ✅ TAMBAH INI
};

export const TYPOGRAPHY = {
  // Font Sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,
  
  // Font Weights (as strings for React Native) - ✅ PERBAIKI STRUKTUR
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  // Shorthand (untuk backward compatibility)
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  
  screenPadding: 20,
  cardPadding: 16,
  sectionPadding: 24,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  // ✅ TAMBAH alias untuk backward compatibility
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Helper function untuk status colors
export const getStatusColor = (status) => {
  const statusColors = {
    pending_payment: { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5', icon: 'clock' },
    confirmed: { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE', icon: 'check-circle' },
    completed: { bg: '#ECFDF5', text: '#059669', border: '#D1FAE5', icon: 'check-circle' },
    cancelled: { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2', icon: 'x-circle' },
  };
  return statusColors[status] || { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', icon: 'info' };
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  getStatusColor,
};