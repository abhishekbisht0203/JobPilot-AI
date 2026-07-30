import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store';
import { colors as colorsLight } from './theme';

export function useThemeColors() {
  const systemScheme = useColorScheme();
  const storeTheme = useThemeStore((s) => s.theme);

  const isDark =
    storeTheme === 'dark' || (storeTheme === 'system' && systemScheme === 'dark');

  const c = {
    ...colorsLight,
    ...(isDark ? colorsLight.dark : {}),
    isDark,
    mode: isDark ? 'dark' : ('light' as 'dark' | 'light'),
    bg: isDark ? colorsLight.dark.background : colorsLight.background,
    surface: isDark ? colorsLight.dark.surface : colorsLight.surface,
    border: isDark ? colorsLight.dark.border : colorsLight.border,
    text: isDark ? colorsLight.dark.text : colorsLight.text,
    textSecondary: isDark ? colorsLight.dark.textSecondary : colorsLight.textSecondary,
    textMuted: isDark ? colorsLight.dark.textMuted : colorsLight.textMuted,
    primary: isDark ? colorsLight.dark.primary : colorsLight.primary,
    primaryBg: isDark ? colorsLight.dark.primaryBg : colorsLight.primaryBg,
    highlight: isDark ? colorsLight.dark.highlight : colorsLight.highlight,
  };

  return c;
}
