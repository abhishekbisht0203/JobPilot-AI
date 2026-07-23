import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const screen = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };

export const colors = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  primaryBg: '#EFF6FF',
  gradientStart: '#3B82F6',
  gradientEnd: '#60A5FA',
  gradientPurple: '#8B5CF6',
  gradientCoral: '#F472B6',
  secondary: '#8B5CF6',
  secondaryDark: '#6D28D9',
  secondaryLight: '#A78BFA',
  secondaryBg: '#F5F3FF',
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  info: '#06B6D4',
  infoLight: '#CFFAFE',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  cardOverlay: 'rgba(0,0,0,0.2)',
  glassBg: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.25)',
  glassStops: 'rgba(255,255,255,0.35)',
  backdrop: 'rgba(0,0,0,0.5)',
  overlay: 'rgba(0,0,0,0.6)',
  highlight: 'rgba(59,130,246,0.08)',
  accent: {
    blue: '#3B82F6',
    indigo: '#6366F1',
    violet: '#8B5CF6',
    pink: '#EC4899',
    rose: '#F43F5E',
    orange: '#F97316',
    amber: '#F59E0B',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    emerald: '#10B981',
  },
  gradient: {
    blue: ['#3B82F6', '#60A5FA'] as const,
    purple: ['#8B5CF6', '#6366F1'] as const,
    coral: ['#F472B6', '#EC4899'] as const,
    sunset: ['#F97316', '#F59E0B'] as const,
    teal: ['#14B8A6', '#06B6D4'] as const,
    indigo: ['#6366F1', '#8B5CF6'] as const,
    primary: ['#3B82F6', '#6366F1'] as const,
    success: ['#10B981', '#34D399'] as const,
    warning: ['#F59E0B', '#FBBF24'] as const,
    error: ['#EF4444', '#F87171'] as const,
    midnight: ['#1E293B', '#334155'] as const,
    aurora: ['#06B6D4', '#10B981'] as const,
    nebula: ['#6366F1', '#EC4899'] as const,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const typography = {
  hero: { fontSize: 40, fontWeight: '800', lineHeight: 48, letterSpacing: -1.2 },
  h1: { fontSize: 30, fontWeight: '700', lineHeight: 38, letterSpacing: -0.6 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32, letterSpacing: -0.4 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  subtitle: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 26 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  captionSmall: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24, letterSpacing: 0.2 },
  buttonSmall: { fontSize: 14, fontWeight: '600', lineHeight: 20, letterSpacing: 0.15 },
  label: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.6 },
  stat: { fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.4 },
};

export const shadow = {
  none: {} as any,
  xs: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 },
    android: { elevation: 1 },
    web: { boxShadow: '0 1px 2px rgba(15,23,42,0.03)' },
  }) as any,
  sm: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
    android: { elevation: 2 },
    web: { boxShadow: '0 1px 4px rgba(15,23,42,0.05)' },
  }) as any,
  md: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
    android: { elevation: 3 },
    web: { boxShadow: '0 2px 8px rgba(15,23,42,0.07)' },
  }) as any,
  lg: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 16 },
    android: { elevation: 5 },
    web: { boxShadow: '0 4px 16px rgba(15,23,42,0.09)' },
  }) as any,
  xl: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.11, shadowRadius: 24 },
    android: { elevation: 8 },
    web: { boxShadow: '0 6px 24px rgba(15,23,42,0.11)' },
  }) as any,
  glow: {
    primary: Platform.select({
      ios: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(59,130,246,0.3)' },
    }) as any,
    success: Platform.select({
      ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(16,185,129,0.3)' },
    }) as any,
    purple: Platform.select({
      ios: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(139,92,246,0.3)' },
    }) as any,
    teal: Platform.select({
      ios: { shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(20,184,166,0.3)' },
    }) as any,
  },
};

export const haptics = {
  light: Platform.OS === 'ios' ? 'light' : undefined,
  medium: Platform.OS === 'ios' ? 'medium' : undefined,
  heavy: Platform.OS === 'ios' ? 'heavy' : undefined,
  success: Platform.OS === 'ios' ? 'success' : undefined,
  warning: Platform.OS === 'ios' ? 'warning' : undefined,
  error: Platform.OS === 'ios' ? 'error' : undefined,
  selection: Platform.OS === 'ios' ? 'selection' : undefined,
};
