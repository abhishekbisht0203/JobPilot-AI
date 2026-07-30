import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

const ADMIN_SECTIONS = [
  { icon: 'business', label: 'Companies', desc: 'Manage company profiles', gradient: colors.gradient.blue, route: '/(tabs)/admin/companies' },
  { icon: 'briefcase', label: 'Jobs', desc: 'Manage job listings', gradient: colors.gradient.purple, route: '/(tabs)/admin/jobs' },
  { icon: 'people', label: 'Applicants', desc: 'View applicants', gradient: colors.gradient.teal, route: '/(tabs)/admin/applicants' },
  { icon: 'newspaper', label: 'Blogs', desc: 'Manage blog posts', gradient: colors.gradient.coral, route: '/(tabs)/admin/blogs' },
  { icon: 'help-circle', label: 'Questions', desc: 'Manage interview questions', gradient: colors.gradient.sunset, route: '/(tabs)/admin/questions' },
  { icon: 'settings', label: 'Settings', desc: 'Admin panel settings', gradient: colors.gradient.indigo, route: '/(tabs)/settings' },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.delay(50).springify().damping(14)}>
          <LinearGradient colors={colors.gradient.primary} style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={18} color="#FFF" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </LinearGradient>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage your platform</Text>
        </Animated.View>
        <View style={styles.grid}>
          {ADMIN_SECTIONS.map((section, index) => (
            <Animated.View key={section.label} entering={FadeInDown.delay(100 + index * 60).springify().damping(16)} style={styles.cardWrap}>
              <TouchableOpacity onPress={() => router.push(section.route as any)} activeOpacity={0.8}>
                <GlassCard style={styles.card} glowColor={section.gradient[0]}>
                  <LinearGradient colors={section.gradient} style={styles.cardIcon}>
                    <Ionicons name={section.icon as any} size={28} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.cardLabel}>{section.label}</Text>
                  <Text style={styles.cardDesc}>{section.desc}</Text>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  adminBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  adminBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardWrap: { width: '47%', flexGrow: 1, minWidth: 140 },
  card: { padding: spacing.md, alignItems: 'center' },
  cardIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  cardLabel: { fontSize: 15, fontWeight: '600', color: colors.text, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
});
