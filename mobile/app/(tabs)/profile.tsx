import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming, useAnimatedStyle, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { useAuthStore, useDashboardStore } from '../../store';
import { analyticsApi } from '../../lib/api';

type ThemeMode = 'system' | 'light' | 'dark';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  badge?: string;
  isTheme?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Personal Info', route: '/(tabs)/profile' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/(tabs)/profile' },
      { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/(tabs)/profile' },
    ],
  },
  {
    title: 'AI & Preferences',
    items: [
      { icon: 'sparkles-outline', label: 'AI Model', route: '/(tabs)/profile', badge: 'GPT-4' },
      { icon: 'language-outline', label: 'Language', route: '/(tabs)/profile', badge: 'English' },
      { icon: 'color-palette-outline', label: 'Appearance', route: '/(tabs)/profile', isTheme: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: '/(tabs)/profile' },
      { icon: 'document-text-outline', label: 'Terms of Service', route: '/(tabs)/profile' },
      { icon: 'information-circle-outline', label: 'About', route: '/(tabs)/profile', badge: 'v1.0.0' },
    ],
  },
];

function MenuRow({ item, theme, onThemeChange }: {
  item: MenuItem; theme: ThemeMode; onThemeChange: (t: ThemeMode) => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale: scale.value }] }}>
      <TouchableOpacity
        onPress={() => item.isTheme ? null : router.push(item.route as any)}
        onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
        style={styles.menuRow}
      >
        <View style={styles.menuIconRing}>
          <Ionicons name={item.icon} size={18} color={colors.textSecondary} />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <View style={styles.menuRight}>
          {item.badge && !item.isTheme && (
            <Text style={styles.menuBadge}>{item.badge}</Text>
          )}
          {item.isTheme ? (
            <View style={styles.themeOptions}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
                const active = theme === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => onThemeChange(mode)}
                    style={[styles.themeOption, active && styles.themeOptionActive]}
                  >
                    <Ionicons
                      name={
                        mode === 'light' ? 'sunny-outline' :
                        mode === 'dark' ? 'moon-outline' : 'settings-outline'
                      }
                      size={13}
                      color={active ? colors.white : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [notifications, setNotifications] = useState(true);
  const [usageData, setUsageData] = useState<any>({});
  const dash = useDashboardStore();

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await analyticsApi.getUsage();
      setUsageData(res.data.data || {});
    } catch {}
  }, []);

  useEffect(() => { fetchAnalytics(); }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const usagePercent = Math.min((usageData.daily_usage_count || 0) / (usageData.daily_limit || 100) * 100, 100);

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
          <Text style={styles.title}>Profile</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
          <GlassCard style={styles.profileCard} glowColor={colors.primary}>
            <View style={styles.profileHeader}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'U')[0].toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || 'user@example.com'}</Text>
                {user?.plan_tier && (
                  <Badge
                    label={user.plan_tier === 'pro' ? 'Pro' : user.plan_tier === 'team' ? 'Team' : 'Free'}
                    variant={user.plan_tier !== 'free' ? 'premium' : 'default'}
                    size="sm"
                    animated
                  />
                )}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
          <GlassCard style={styles.statsCard} glowColor={colors.primary}>
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <AnimatedCounter value={dash.totalApplications} style={styles.statNumber} spring />
                <Text style={styles.statLabel}>Applications</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <AnimatedCounter value={dash.interviewsScheduled} style={styles.statNumber} spring />
                <Text style={styles.statLabel}>Interviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <AnimatedCounter value={dash.currentStreak} style={styles.statNumber} spring />
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify().damping(14)}>
          <GlassCard style={styles.usageCard} glowColor={colors.secondary}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Daily Usage</Text>
              <Text style={styles.usageCount}>
                {usageData.daily_usage_count || 0} / {usageData.daily_limit || 100}
              </Text>
            </View>
            <View style={styles.usageBarBg}>
              <View style={[styles.usageBarFill, { width: `${usagePercent}%` }]} />
            </View>
            <Text style={styles.usageReset}>
              Resets {usageData.usage_reset_at ? new Date(usageData.usage_reset_at).toLocaleDateString() : 'daily'}
            </Text>
          </GlassCard>
        </Animated.View>

        {MENU_SECTIONS.map((section, sIdx) => (
          <Animated.View key={section.title} entering={FadeInUp.delay(300 + sIdx * 60).springify().damping(14)}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <GlassCard style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <React.Fragment key={iIdx}>
                  {iIdx > 0 && <View style={styles.menuDivider} />}
                  <MenuRow item={item} theme={theme} onThemeChange={setTheme} />
                </React.Fragment>
              ))}
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInUp.delay(500).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <GlassCard style={styles.menuCard}>
            <View style={styles.switchRow}>
              <View style={styles.menuIconRing}>
                <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
              </View>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.borderLight, true: colors.primaryBg }}
                thumbColor={notifications ? colors.primary : colors.textMuted}
              />
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).springify().damping(14)}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.version}>JobPilot AI v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, paddingBottom: spacing.md },
  profileCard: { padding: spacing.md, marginBottom: spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  profileName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  profileEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 1 },
  statsCard: { padding: spacing.md, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statCell: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.borderLight },
  usageCard: { padding: spacing.md, marginBottom: spacing.md },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  usageTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  usageCount: { fontSize: 13, fontWeight: '600', color: colors.primary },
  usageBarBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  usageBarFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  usageReset: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs, marginTop: spacing.md,
  },
  menuCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  menuIconRing: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm,
  },
  menuLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  menuBadge: { color: colors.textMuted, fontSize: 13 },
  menuDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.sm },
  themeOptions: { flexDirection: 'row', gap: 4 },
  themeOption: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.borderLight },
  themeOptionActive: { backgroundColor: colors.primary },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  switchLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500', marginLeft: spacing.sm },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, marginTop: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.errorLight,
  },
  logoutText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  version: { color: colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: spacing.lg },
});
