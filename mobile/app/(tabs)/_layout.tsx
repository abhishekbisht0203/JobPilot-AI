import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Platform, View, Text, TouchableOpacity } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, interpolate, FadeInUp, FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useAuthStore } from '../../store';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { getTabBarHeight, getTabListBottomPadding } from '../../components/ui/TabBarHeight';

const TABS = [
  { name: 'index', label: 'Home', icon: 'grid-outline' as const, activeIcon: 'grid' as const },
  { name: 'applications', label: 'Apps', icon: 'briefcase-outline' as const, activeIcon: 'briefcase' as const },
  { name: 'resume', label: 'Resume', icon: 'document-text-outline' as const, activeIcon: 'document-text' as const },
  { name: 'profile', label: 'Profile', icon: 'person-outline' as const, activeIcon: 'person' as const },
];

function TabIcon({ icon, activeIcon, focused, index }: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  index: number;
}) {
  const scale = useSharedValue(focused ? 1 : 0.6);
  const translateY = useSharedValue(focused ? -4 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.6, { stiffness: 300, damping: 15 });
    translateY.value = withSpring(focused ? -4 : 0, { stiffness: 300, damping: 15 });
  }, [focused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
      <Ionicons
        name={focused ? activeIcon : icon}
        size={22}
        color={focused ? colors.primary : colors.textMuted}
      />
    </Animated.View>
  );
}

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight();

  return (
    <BlurView
      intensity={80}
      tint="light"
      style={[
        styles.tabBar,
        {
          height: tabBarHeight,
          paddingBottom: insets.bottom + 4,
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        <View style={styles.tabBarBorder} pointerEvents="none" />
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          const tab = TABS.find(t => route.name === t.name || `/${t.name}` === route.name);
          const tabIndex = TABS.findIndex(t => route.name === t.name);

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={1}
              style={styles.tabItem}
            >
              {tab && (
                <TabIcon
                  icon={tab.icon}
                  activeIcon={tab.activeIcon}
                  focused={isFocused}
                  index={tabIndex}
                />
              )}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
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
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
        <Tabs.Screen name="applications" options={{ tabBarLabel: 'Apps' }} />
        <Tabs.Screen name="resume" options={{ tabBarLabel: 'Resume' }} />
        <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadow.xl,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: 6,
  },
  tabBarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.xxl,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 1,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});
