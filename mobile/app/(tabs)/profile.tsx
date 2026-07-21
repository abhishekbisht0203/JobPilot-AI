import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore, useThemeStore } from '../../store';

function Badge({ label, variant, size }: { label: string; variant: 'primary' | 'default'; size: 'sm' | 'md' }) {
  const bg = variant === 'primary' ? '#1e40af' : colors.surfaceLight;
  const textColor = variant === 'primary' ? '#93c5fd' : colors.textSecondary;
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: size === 'md' ? 12 : 8, paddingVertical: size === 'md' ? 5 : 3, borderRadius: 999, alignSelf: 'flex-start' }]}>
      <Text style={{ color: textColor, fontSize: size === 'md' ? 13 : 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const menuItems = [
    { icon: 'sparkles-outline' as const, label: 'AI Mock Interview', onPress: () => router.push('/ai/mock-interview') },
    { icon: 'analytics-outline' as const, label: 'Skill Gap Analysis', onPress: () => router.push('/ai/skill-gap') },
    { icon: 'logo-linkedin' as const, label: 'LinkedIn Optimizer', onPress: () => router.push('/ai/linkedin-optimize') },
    { icon: 'stats-chart-outline' as const, label: 'Analytics Dashboard', onPress: () => {} },
    { icon: 'card-outline' as const, label: 'Subscription', onPress: () => {} },
    { icon: 'settings-outline' as const, label: 'Settings', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <Badge label={user?.plan_tier === 'pro' ? 'Pro' : user?.plan_tier === 'team' ? 'Team' : 'Free'} variant={user?.plan_tier === 'pro' ? 'primary' : 'default'} size="md" />
        <View style={styles.usageRow}>
          <Text style={styles.usageText}>Daily Usage: {user?.daily_usage_count || 0}/10</Text>
          <View style={styles.usageBar}>
            <View style={[styles.usageFill, { width: `${Math.min(((user?.daily_usage_count || 0) / 10) * 100, 100)}%` }]} />
          </View>
        </View>
      </Card>

      <View style={styles.menuSection}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.themeRow}>
        <Text style={styles.themeLabel}>Theme</Text>
        <View style={styles.themeOptions}>
          {(['light', 'dark', 'system'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.themeOption, theme === t && styles.themeOptionActive]}
              onPress={() => setTheme(t)}
            >
              <Text style={[styles.themeOptionText, theme === t && styles.themeOptionTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button
        title="Log Out"
        onPress={() => { logout(); router.replace('/(auth)/login'); }}
        variant="outline"
        style={styles.logoutButton}
        icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  profileCard: { marginHorizontal: spacing.lg, alignItems: 'center', padding: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  name: { color: colors.text, fontSize: 22, fontWeight: '600' },
  email: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.md },
  usageRow: { width: '100%', marginTop: spacing.lg },
  usageText: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.xs },
  usageBar: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  menuSection: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuLabel: { color: colors.text, fontSize: 16 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  themeLabel: { color: colors.text, fontSize: 16 },
  themeOptions: { flexDirection: 'row', gap: spacing.sm },
  themeOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md, backgroundColor: colors.surfaceLight },
  themeOptionActive: { backgroundColor: colors.primary },
  themeOptionText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  themeOptionTextActive: { color: colors.white },
  logoutButton: { marginHorizontal: spacing.lg, marginTop: spacing.lg, borderColor: colors.error },
});
