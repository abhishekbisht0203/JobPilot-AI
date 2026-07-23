import { useWindowDimensions, Platform, ScaledSize } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

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

export function scaleWidth(width: number, screenWidth: number): number {
  return (width / BASE_WIDTH) * Math.min(screenWidth, 1024);
}

export function scaleHeight(height: number, screenHeight: number): number {
  return (height / BASE_HEIGHT) * Math.min(screenHeight, 1024);
}

export function moderateScale(size: number, factor = 0.5, screenWidth: number): number {
  return size + (scaleWidth(size, screenWidth) - size) * factor;
}

export function useResponsive() {
  const { width, height, scale } = useWindowDimensions();
  const deviceSize = getDeviceSize(width, height);
  const isTabletDevice = isTablet(width);
  const isWebDevice = isWeb(width);
  const isLandscape = width > height;

  const wp = (percent: number) => (width * percent) / 100;
  const hp = (percent: number) => (height * percent) / 100;

  const fs = (size: number) => moderateScale(size, 0.3, width);

  const horizontalPadding = (() => {
    if (isWebDevice) return Math.min(width * 0.08, 48);
    if (isTabletDevice) return Math.min(width * 0.06, 32);
    if (width >= 430) return 24;
    if (width >= 375) return 20;
    return 16;
  })();

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
    wp,
    hp,
    fs,
    horizontalPadding,
    cardWidth,
    contentMaxWidth,
  };
}

export function getGridColumns(width: number): number {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

export const RESPONSIVE_PADDING = {
  screen: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
};
