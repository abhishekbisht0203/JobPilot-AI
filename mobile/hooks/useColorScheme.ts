import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeStore } from '../store';

export function useColorScheme(): 'light' | 'dark' {
  const theme = useThemeStore((s) => s.theme);
  const system = useNativeColorScheme() || 'light';

  if (theme === 'system') return system;
  return theme;
}
