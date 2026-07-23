import { Platform } from 'react-native';

export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 72;
export const TAB_BAR_BOTTOM_INSET = Platform.OS === 'ios' ? 16 : 12;

export function getTabBarHeight(): number {
  return TAB_BAR_HEIGHT;
}

export function getTabListBottomPadding(): number {
  return TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_INSET + 8;
}
