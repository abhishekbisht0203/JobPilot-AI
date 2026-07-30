import { Dimensions, useWindowDimensions, Platform, TextStyle } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const { width: INIT_WIDTH, height: INIT_HEIGHT } = Dimensions.get('window');

export type DeviceSize = 'small' | 'medium' | 'large' | 'tablet' | 'web';

export function getDeviceSize(width: number, height: number): DeviceSize {
  if (Platform.OS === 'web' && width > 1024) return 'web';
  if (width >= 768) return 'tablet';
  if (width >= 430) return 'large';
  if (width >= 375) return 'medium';
  return 'small';
}

export function isTablet(width: number): boolean {
  return width >= 768;
}

export function isWeb(width: number): boolean {
  return Platform.OS === 'web' && width > 1024;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Base spacing values (at 390px width)
const BASE_SPACING = {
  xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

const BASE_RADIUS = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, full: 9999,
};

const BASE_FONT_SIZES = {
  hero: 40, h1: 30, h2: 24, h3: 20, subtitle: 17,
  body: 16, bodySmall: 14, caption: 13, captionSmall: 12,
  button: 16, buttonSmall: 14, label: 11, stat: 28,
};

function scaleWidth(size: number, screenWidth: number): number {
  return (size / BASE_WIDTH) * Math.min(screenWidth, 1024);
}

function moderateScale(size: number, factor: number, screenWidth: number): number {
  return size + (scaleWidth(size, screenWidth) - size) * factor;
}

// ─── Static (hook-free) helpers for module-level use ──────────────────
export const initialWidth = INIT_WIDTH;
export const initialHeight = INIT_HEIGHT;
export const initialScale = INIT_WIDTH / BASE_WIDTH;

export function rs(size: number, screenWidth = INIT_WIDTH): number {
  return clamp(moderateScale(size, 0.4, screenWidth), size * 0.7, size * 1.5);
}

export function fs(size: number, screenWidth = INIT_WIDTH): number {
  return clamp(moderateScale(size, 0.3, screenWidth), size * 0.8, size * 1.4);
}

export function wp(percent: number, screenWidth = INIT_WIDTH): number {
  return (screenWidth * percent) / 100;
}

export function hp(percent: number, screenHeight = INIT_HEIGHT): number {
  return (screenHeight * percent) / 100;
}

// Static spacing/radius for module-level StyleSheets
export const responsiveSpacing = {
  xxs: rs(BASE_SPACING.xxs),
  xs: rs(BASE_SPACING.xs),
  sm: rs(BASE_SPACING.sm),
  md: rs(BASE_SPACING.md),
  lg: rs(BASE_SPACING.lg),
  xl: rs(BASE_SPACING.xl),
  xxl: rs(BASE_SPACING.xxl),
  xxxl: rs(BASE_SPACING.xxxl),
};

export const responsiveBorderRadius = {
  xs: rs(BASE_RADIUS.xs),
  sm: rs(BASE_RADIUS.sm),
  md: rs(BASE_RADIUS.md),
  lg: rs(BASE_RADIUS.lg),
  xl: rs(BASE_RADIUS.xl),
  xxl: rs(BASE_RADIUS.xxl),
  xxxl: rs(BASE_RADIUS.xxxl),
  full: 9999,
};

export function responsiveHorizontalPadding(screenWidth = INIT_WIDTH): number {
  if (Platform.OS === 'web' && screenWidth > 1024) return Math.min(screenWidth * 0.08, 48);
  if (screenWidth >= 768) return Math.min(screenWidth * 0.06, 32);
  if (screenWidth >= 430) return responsiveSpacing.lg;
  if (screenWidth >= 375) return responsiveSpacing.md;
  return responsiveSpacing.sm;
}

// ─── Hook for dynamic updates (window resize, rotation) ──────────────
export function useResponsive() {
  const { width, height, scale } = useWindowDimensions();
  const deviceSize = getDeviceSize(width, height);
  const isTabletDevice = isTablet(width);
  const isWebDevice = isWeb(width);
  const isLandscape = width > height;

  const ratio = Math.min(width / BASE_WIDTH, 1.6);
  const factor = clamp((ratio - 0.5) * 0.8, 0, 0.5);

  const _wp = (percent: number) => (width * percent) / 100;
  const _hp = (percent: number) => (height * percent) / 100;

  const _fs = (size: number) => fs(size, width);
  const _rs = (size: number) => rs(size, width);

  const spacing = {
    xxs: _rs(BASE_SPACING.xxs),
    xs: _rs(BASE_SPACING.xs),
    sm: _rs(BASE_SPACING.sm),
    md: _rs(BASE_SPACING.md),
    lg: _rs(BASE_SPACING.lg),
    xl: _rs(BASE_SPACING.xl),
    xxl: _rs(BASE_SPACING.xxl),
    xxxl: _rs(BASE_SPACING.xxxl),
  };

  const borderRadius = {
    xs: _rs(BASE_RADIUS.xs),
    sm: _rs(BASE_RADIUS.sm),
    md: _rs(BASE_RADIUS.md),
    lg: _rs(BASE_RADIUS.lg),
    xl: _rs(BASE_RADIUS.xl),
    xxl: _rs(BASE_RADIUS.xxl),
    xxxl: _rs(BASE_RADIUS.xxxl),
    full: 9999,
  };

  const typography: Record<string, TextStyle> = {
    hero: { fontSize: _fs(BASE_FONT_SIZES.hero), fontWeight: '800', lineHeight: _fs(BASE_FONT_SIZES.hero) * 1.2, letterSpacing: -1.2 },
    h1: { fontSize: _fs(BASE_FONT_SIZES.h1), fontWeight: '700', lineHeight: _fs(BASE_FONT_SIZES.h1) * 1.27, letterSpacing: -0.6 },
    h2: { fontSize: _fs(BASE_FONT_SIZES.h2), fontWeight: '700', lineHeight: _fs(BASE_FONT_SIZES.h2) * 1.33, letterSpacing: -0.4 },
    h3: { fontSize: _fs(BASE_FONT_SIZES.h3), fontWeight: '600', lineHeight: _fs(BASE_FONT_SIZES.h3) * 1.4 },
    subtitle: { fontSize: _fs(BASE_FONT_SIZES.subtitle), fontWeight: '600', lineHeight: _fs(BASE_FONT_SIZES.subtitle) * 1.41 },
    body: { fontSize: _fs(BASE_FONT_SIZES.body), fontWeight: '400', lineHeight: _fs(BASE_FONT_SIZES.body) * 1.625 },
    bodySmall: { fontSize: _fs(BASE_FONT_SIZES.bodySmall), fontWeight: '400', lineHeight: _fs(BASE_FONT_SIZES.bodySmall) * 1.57 },
    caption: { fontSize: _fs(BASE_FONT_SIZES.caption), fontWeight: '500', lineHeight: _fs(BASE_FONT_SIZES.caption) * 1.38 },
    captionSmall: { fontSize: _fs(BASE_FONT_SIZES.captionSmall), fontWeight: '500', lineHeight: _fs(BASE_FONT_SIZES.captionSmall) * 1.33 },
    button: { fontSize: _fs(BASE_FONT_SIZES.button), fontWeight: '600', lineHeight: _fs(BASE_FONT_SIZES.button) * 1.5, letterSpacing: 0.2 },
    buttonSmall: { fontSize: _fs(BASE_FONT_SIZES.buttonSmall), fontWeight: '600', lineHeight: _fs(BASE_FONT_SIZES.buttonSmall) * 1.43, letterSpacing: 0.15 },
    label: { fontSize: _fs(BASE_FONT_SIZES.label), fontWeight: '600', lineHeight: _fs(BASE_FONT_SIZES.label) * 1.27, letterSpacing: 0.6 },
    stat: { fontSize: _fs(BASE_FONT_SIZES.stat), fontWeight: '800', lineHeight: _fs(BASE_FONT_SIZES.stat) * 1.21, letterSpacing: -0.4 },
  };

  const horizontalPadding = responsiveHorizontalPadding(width);

  const cardWidth = (columns: number, gap: number) => {
    const totalGap = gap * (columns - 1);
    const padding = horizontalPadding * 2;
    return (width - padding - totalGap) / columns;
  };

  const contentMaxWidth = (() => {
    if (isWebDevice) return 1200;
    return width;
  })();

  return {
    width,
    height,
    scale,
    deviceSize,
    isTablet: isTabletDevice,
    isWeb: isWebDevice,
    isLandscape,
    wp: _wp,
    hp: _hp,
    fs: _fs,
    rs: _rs,
    spacing,
    borderRadius,
    typography,
    horizontalPadding,
    cardWidth,
    contentMaxWidth,
    screenScale: ratio,
    isSmall: width < 375,
    isLarge: width >= 430,
  };
}

export function getGridColumns(width: number): number {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

export const RESPONSIVE_PADDING = {
  screen: { sm: 16, md: 20, lg: 24, xl: 32 },
};
