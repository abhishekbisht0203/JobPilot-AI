import React, { useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, useSharedValue, withSpring, withTiming, useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { useJobStore, useDashboardStore } from '../../../store';
import { applicationApi, notificationApi } from '../../../lib/api';

const QUICK_ACTION_ITEMS = [
  {
    id: 'saved-jobs',
    icon: 'bookmark',
    label: 'Saved Jobs',
    subtitle: 'Bookmarked positions',
    gradient: colors.gradient.blue,
    route: '/quick-actions/saved-jobs',
    getPreview: () => {
      const count = 0; // saved jobs count from store
      return `${count} saved`;
    },
  },
  {
    id: 'applied-jobs',
    icon: 'send',
    label: 'Applied Jobs',
    subtitle: 'Track applications',
    gradient: colors.gradient.purple,
    route: '/quick-actions/applied-jobs',
    getPreview: () => {
      const count = useDashboardStore.getState().totalApplications;
      return `${count} applied`;
    },
  },
  {
    id: 'notifications',
    icon: 'notifications',
    label: 'Notifications',
    subtitle: 'Latest updates',
    gradient: colors.gradient.coral,
    route: '/quick-actions/notifications',
    getPreview: () => 'View all',
  },
  {
    id: 'messages',
    icon: 'chatbubbles',
    label: 'Messages',
    subtitle: 'Conversations',
    gradient: colors.gradient.teal,
    route: '/quick-actions/messages',
    getPreview: () => 'View all',
  },
  {
    id: 'recent-searches',
    icon: 'search',
    label: 'Recent Searches',
    subtitle: 'Your search history',
    gradient: colors.gradient.sunset,
    route: '/quick-actions/recent-searches',
    getPreview: () => 'View history',
  },
  {
    id: 'recent-companies',
    icon: 'business',
    label: 'Recent Companies',
    subtitle: 'Companies you viewed',
    gradient: colors.gradient.indigo,
    route: '/quick-actions/recent-companies',
    getPreview: () => 'Explore',
  },
  {
    id: 'recently-viewed',
    icon: 'time',
    label: 'Recently Viewed',
    subtitle: 'Jobs you checked',
    gradient: colors.gradient.nebula,
    route: '/quick-actions/recently-viewed',
    getPreview: () => 'View history',
  },
];

function QuickActionGridItem({ item, index }: { item: typeof QUICK_ACTION_ITEMS[number]; index: number }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + glow.value * 0.3,
  }));

  const preview = item.getPreview();

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 80).springify().damping(15)} style={styles.gridItemWrapper}>
      <TouchableOpacity
        onPress={() => router.push(item.route as any)}
        onPressIn={() => { scale.value = withSpring(0.94, { stiffness: 400, damping: 12 }); glow.value = withTiming(1, { duration: 100 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); glow.value = withTiming(0, { duration: 200 }); }}
        activeOpacity={1}
        style={styles.gridTouchable}
      >
        <Animated.View style={[styles.gridCard, cardStyle]}>
          <BlurView intensity={60} tint="light" style={styles.gridBlur}>
            <Animated.View style={[styles.gridGlow, { backgroundColor: item.gradient[0] }, glowStyle]} />
            <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gridIcon}>
              <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
            <Text style={styles.gridSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            <View style={styles.gridPreview}>
              <Text style={styles.gridPreviewText} numberOfLines={1}>{preview}</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
            </View>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function QuickActionsHubScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isTablet } = useResponsive();

  const items = QUICK_ACTION_ITEMS;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Quick Actions</Text>
              <Text style={styles.subtitle}>Everything at your fingertips</Text>
            </View>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.headerIcon}>
              <Ionicons name="flash" size={22} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </Animated.View>

        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          {items.map((item, index) => (
            <QuickActionGridItem key={item.id} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridTablet: { gap: 16 },
  gridItemWrapper: { width: '47%', flexGrow: 1, minWidth: 150 },
  gridTouchable: { width: '100%' },
  gridCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadow.md,
  },
  gridBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    padding: spacing.md,
  },
  gridGlow: { ...StyleSheet.absoluteFillObject, borderRadius: borderRadius.xl },
  gridIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  gridLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  gridSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  gridPreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  gridPreviewText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', flex: 1 },
});
