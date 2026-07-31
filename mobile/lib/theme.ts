import { Dimensions, Platform, TextStyle } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const screen = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };

export const colors = {
  // LinkedIn-inspired primary
  primary: '#0A66C2',
  primaryDark: '#004182',
  primaryLight: '#2563EB',
  primaryBg: '#E8F0FE',

  secondary: '#2F81F7',
  secondaryDark: '#1A5BBF',
  secondaryLight: '#5B9CF6',
  secondaryBg: '#E8F0FE',

  // Status colors
  success: '#057642',
  successLight: '#E1F3EB',
  error: '#CC1016',
  errorLight: '#FDE7E9',
  warning: '#E68A00',
  warningLight: '#FFF3E0',
  info: '#0A66C2',
  infoLight: '#E8F0FE',

  // Light mode
  background: '#F3F2EF',
  surface: '#FFFFFF',
  surfaceLight: '#F3F2EF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#EFF1F3',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',

  // Glass morphism
  cardOverlay: 'rgba(0,0,0,0.15)',
  glassBg: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(255,255,255,0.3)',
  glassStops: 'rgba(255,255,255,0.4)',
  backdrop: 'rgba(0,0,0,0.5)',
  overlay: 'rgba(0,0,0,0.6)',
  highlight: 'rgba(10,102,194,0.08)',

  // Dark mode
  dark: {
    background: '#0D1117',
    surface: '#161B22',
    surfaceLight: '#1F2937',
    border: '#1F2937',
    borderLight: '#1F2937',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    primary: '#2F81F7',
    primaryBg: '#0D2847',
    highlight: 'rgba(47,129,247,0.12)',
  },

  accent: {
    blue: '#0A66C2',
    indigo: '#4F46E5',
    violet: '#7C3AED',
    pink: '#DB2777',
    rose: '#E11D48',
    orange: '#EA580C',
    amber: '#D97706',
    teal: '#0D9488',
    cyan: '#0891B2',
    emerald: '#059669',
  },

  gradient: {
    blue: ['#0A66C2', '#2563EB'] as const,
    purple: ['#7C3AED', '#4F46E5'] as const,
    coral: ['#F472B6', '#DB2777'] as const,
    sunset: ['#EA580C', '#D97706'] as const,
    teal: ['#0D9488', '#0891B2'] as const,
    indigo: ['#4F46E5', '#7C3AED'] as const,
    primary: ['#0A66C2', '#2563EB'] as const,
    success: ['#057642', '#059669'] as const,
    warning: ['#D97706', '#F59E0B'] as const,
    error: ['#CC1016', '#EF4444'] as const,
    midnight: ['#0D1117', '#161B22'] as const,
    aurora: ['#0891B2', '#059669'] as const,
    nebula: ['#4F46E5', '#DB2777'] as const,
  },

  // Career Tools hero-card gradients, sampled from the design reference (images/image.png)
  tool: {
    resumeBuilder: ['#5B3FC4', '#8161E0'] as const,
    coverLetter: ['#5B3FD1', '#8865E6'] as const,
    resumeChecker: ['#1196B0', '#24A6BE'] as const,
    mockInterview: ['#1CA171', '#35B57F'] as const,
    salaryExplorer: ['#FC8C26', '#FDB349'] as const,
    careerRoadmap: ['#DD4585', '#ED75AA'] as const,
    interviewPrep: ['#268BE2', '#43B7E9'] as const,
    atsScore: ['#F9A93E', '#FEC55D'] as const,
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

export const typography: Record<string, TextStyle> = {
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
      ios: { shadowColor: '#0A66C2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(10,102,194,0.3)' },
    }) as any,
    success: Platform.select({
      ios: { shadowColor: '#057642', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(5,118,66,0.3)' },
    }) as any,
    purple: Platform.select({
      ios: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(124,58,237,0.3)' },
    }) as any,
    teal: Platform.select({
      ios: { shadowColor: '#0D9488', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 2px 16px rgba(13,148,136,0.3)' },
    }) as any,
  },
};
