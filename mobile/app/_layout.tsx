import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Animated, useColorScheme } from 'react-native';
import { colors } from '../lib/theme';
import { useThemeStore } from '../store';
import Drawer from '../components/drawer/Drawer';
import '../lib/errorHandler';

let ToastComponent = () => null;
try {
  const Toast = require('react-native-toast-message').default;
  ToastComponent = Toast;
} catch {}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error.name, error.message);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Animated.View style={styles.errorContainer}>
          <Animated.Text style={styles.errorTitle}>Something went wrong</Animated.Text>
          <Animated.Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error'}
          </Animated.Text>
          <Animated.Text style={styles.errorStack}>
            {this.state.error?.stack?.split('\n').slice(0, 6).join('\n')}
          </Animated.Text>
        </Animated.View>
      );
    }
    return this.props.children;
  }
}

function ThemeStatusBar() {
  const systemScheme = useColorScheme();
  const storeTheme = useThemeStore((s) => s.theme);
  const isDark = storeTheme === 'dark' || (storeTheme === 'system' && systemScheme === 'dark');
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const storeTheme = useThemeStore((s) => s.theme);
  const isDark = storeTheme === 'dark' || (storeTheme === 'system' && systemScheme === 'dark');

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={[styles.root, { backgroundColor: isDark ? colors.dark.background : colors.background }]}>
        <ThemeStatusBar />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDark ? colors.dark.background : colors.background },
            animation: 'slide_from_right',
          }}
        />
        <Drawer />
        <ToastComponent />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F5F7FB' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#EF4444', marginBottom: 8 },
  errorMessage: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  errorStack: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', fontFamily: 'monospace' },
});
