import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Platform, View, Text, TouchableOpacity } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius } from '../../lib/theme';
import { useAuthStore } from '../../store';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlobalHeader } from '../../components/GlobalHeader';

const TABS = [
  { name: 'index', label: 'Home', icon: 'grid-outline' as const, activeIcon: 'grid' as const },
  { name: 'applications', label: 'Apps', icon: 'briefcase-outline' as const, activeIcon: 'briefcase' as const },
  { name: 'resume', label: 'Resume', icon: 'document-text-outline' as const, activeIcon: 'document-text' as const },
  { name: 'profile', label: 'Profile', icon: 'person-outline' as const, activeIcon: 'person' as const },
];

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = useMemo(
    () => state.routes.filter((r: any) => {
      const desc = descriptors[r.key];
      return desc?.options?.href !== null;
    }),
    [state.routes, descriptors]
  );

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.tabBarInner}>
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          const tab = TABS.find(t => route.name === t.name);
          if (!tab) return null;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              activeOpacity={0.7}
              style={styles.tabItem}
              accessibilityLabel={label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
            >
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
                <Ionicons
                  name={isFocused ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isFocused ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <MeshGradient />
      <GlobalHeader />
      <View style={styles.tabsContent}>
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
          <Tabs.Screen name="applications" options={{ tabBarLabel: 'Apps' }} />
          <Tabs.Screen name="resume" options={{ tabBarLabel: 'Resume' }} />
          <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
          <Tabs.Screen name="find-jobs" options={{ href: null }} />
          <Tabs.Screen name="browse-companies" options={{ href: null }} />
          <Tabs.Screen name="pricing" options={{ href: null }} />
          <Tabs.Screen name="contact" options={{ href: null }} />
          <Tabs.Screen name="about" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
          <Tabs.Screen name="career-tools" options={{ href: null }} />
          <Tabs.Screen name="resources" options={{ href: null }} />
          <Tabs.Screen name="quick-actions" options={{ href: null }} />
          <Tabs.Screen name="companies" options={{ href: null }} />
          <Tabs.Screen name="privacy" options={{ href: null }} />
          <Tabs.Screen name="terms" options={{ href: null }} />
          <Tabs.Screen name="admin" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsContent: {
    flex: 1,
  },
  tabBarOuter: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIconWrap: {
    width: 32,
    height: 28,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
