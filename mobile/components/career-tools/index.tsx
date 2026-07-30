import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedProps, withTiming, interpolate } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, shadow, typography } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ToolHeader({ title, subtitle, gradient, icon, backLabel }: {
  title: string; subtitle?: string; gradient?: readonly [string, string]; icon?: string; backLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [g1, g2] = gradient || ['#0A66C2', '#2563EB'];
  return (
    <LinearGradient colors={[g1, g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.toolHeader, { paddingTop: insets.top + 12, paddingHorizontal: horizontalPadding }]}>
      <View style={styles.toolHeaderTop}>
        <TouchableOpacity onPress={() => { try { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/career-tools'); } catch {} }} style={styles.toolBackBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        {icon && (
          <View style={styles.toolHeaderIcon}>
            <Ionicons name={icon as any} size={20} color="#FFF" />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.toolHeaderTitle}>{title}</Text>
          {subtitle && <Text style={styles.toolHeaderSub}>{subtitle}</Text>}
        </View>
      </View>
    </LinearGradient>
  );
}

export function SectionHeader({ title, icon, badge, action }: {
  title: string; icon?: string; badge?: string | number; action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {icon && <Ionicons name={icon as any} size={18} color={colors.text} />}
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge !== undefined && <Badge label={`${badge}`} variant="primary" size="sm" />}
      </View>
      {action}
    </View>
  );
}

export function StatCard({ label, value, icon, color, prefix, suffix, delay = 0 }: {
  label: string; value: number; icon?: string; color?: string; prefix?: string; suffix?: string; delay?: number;
}) {
  const c = color || colors.primary;
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(14)} style={{ flex: 1 }}>
      <BlurView intensity={40} tint="light" style={[styles.statCard, { borderLeftColor: c, borderLeftWidth: 3 }]}>
        {icon && (
          <View style={[styles.statIconBox, { backgroundColor: c + '18' }]}>
            <Ionicons name={icon as any} size={16} color={c} />
          </View>
        )}
        <Text style={styles.statValue}>{prefix || ''}{value}{suffix || ''}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </BlurView>
    </Animated.View>
  );
}

export function AnimatedScoreRing({ score, size = 86, strokeWidth = 6, label, subtitle }: {
  score: number; size?: number; strokeWidth?: number; label?: string; subtitle?: string;
}) {
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => { progress.value = withTiming(Math.min(score, 100) / 100, { duration: 1500 }); }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [circumference, 0]),
  }));

  const ringColor = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.borderLight} strokeWidth={strokeWidth} />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={ringColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.ringLabel, { width: size - strokeWidth * 4 }]}>
        <Text style={[styles.ringScore, { color: ringColor, fontSize: size * 0.28 }]}>{Math.round(score)}</Text>
        {label && <Text style={[styles.ringSub, { fontSize: size * 0.1 }]}>{label}</Text>}
      </View>
      {subtitle && <Text style={styles.ringFootnote}>{subtitle}</Text>}
    </View>
  );
}

export function InfoCard({ icon, label, value, color, children }: {
  icon?: string; label: string; value?: string; color?: string; children?: React.ReactNode;
}) {
  const c = color || colors.primary;
  return (
    <BlurView intensity={40} tint="light" style={styles.infoCard}>
      {icon && (
        <View style={[styles.infoIcon, { backgroundColor: c + '18' }]}>
          <Ionicons name={icon as any} size={18} color={c} />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: icon ? spacing.sm : 0 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        {children || (value && <Text style={styles.infoValue}>{value}</Text>)}
      </View>
    </BlurView>
  );
}

export function ChipFilter({ options, selected, onSelect }: {
  options: string[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map(o => (
        <TouchableOpacity key={o} onPress={() => onSelect(o)} activeOpacity={0.7}>
          <BlurView intensity={40} tint="light" style={[styles.chip, selected === o && styles.chipActive]}>
            <Text style={[styles.chipText, selected === o && styles.chipTextActive]}>{o}</Text>
          </BlurView>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function TabBar({ tabs, activeTab, onTabChange }: {
  tabs: { key: string; label: string; icon?: string }[];
  activeTab: string; onTabChange: (key: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
      {tabs.map(t => (
        <TouchableOpacity key={t.key} onPress={() => onTabChange(t.key)} activeOpacity={0.7}
          style={[styles.tab, activeTab === t.key && styles.tabActive]}
        >
          {t.icon && <Ionicons name={t.icon as any} size={16} color={activeTab === t.key ? '#FFF' : colors.textSecondary} />}
          <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function GradientButton({ title, icon, onPress, loading, gradient, disabled, style }: {
  title: string; icon?: string; onPress: () => void; loading?: boolean; gradient?: readonly [string, string];
  disabled?: boolean; style?: any;
}) {
  const [g1, g2] = gradient || [colors.primary, colors.primaryLight];
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={[styles.gradBtnWrap, style]}>
      <LinearGradient
        colors={disabled ? ['#9CA3AF', '#B0B5BE'] : [g1, g2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.gradBtnGrad}
      >
        {loading ? (
          <Text style={styles.gradBtnText}>Loading...</Text>
        ) : (
          <>
            {icon && <Ionicons name={icon as any} size={18} color="#FFF" />}
            <Text style={styles.gradBtnText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function ProgressBar({ value, color, height = 6 }: {
  value: number; color?: string; height?: number;
}) {
  const c = color || colors.primary;
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <View style={[styles.progressBg, { height, borderRadius: height / 2 }]}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: c, height, borderRadius: height / 2 }]} />
    </View>
  );
}

export function EmptyToolState({ icon, title, message, actionLabel, onAction }: {
  icon: string; title: string; message: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon as any} size={40} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMsg}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolHeader: { paddingBottom: spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, ...shadow.lg },
  toolHeaderTop: { flexDirection: 'row', alignItems: 'center' },
  toolBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  toolHeaderIcon: { marginLeft: spacing.sm },
  toolHeaderTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  toolHeaderSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  statCard: { padding: spacing.sm, borderRadius: borderRadius.xl, overflow: 'hidden', gap: spacing.xxs },
  statIconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11, fontWeight: '500', color: colors.textMuted, marginTop: 1 },
  ringContainer: { alignItems: 'center', justifyContent: 'center' },
  ringLabel: { position: 'absolute', alignItems: 'center' },
  ringScore: { fontWeight: '800', fontVariant: ['tabular-nums'] },
  ringSub: { fontWeight: '600', color: colors.textMuted, marginTop: 1 },
  ringFootnote: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm, overflow: 'hidden' },
  infoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  infoValue: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 1 },
  chipRow: { gap: spacing.xs, paddingVertical: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full, overflow: 'hidden' },
  chipActive: { backgroundColor: colors.primary + '20' },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  tabRow: { gap: spacing.sm, paddingVertical: spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  tabTextActive: { color: '#FFF', fontWeight: '600' },
  gradBtnWrap: { borderRadius: borderRadius.md, overflow: 'hidden', ...shadow.glow.primary },
  gradBtnGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  gradBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  progressBg: { width: '100%', backgroundColor: colors.borderLight, overflow: 'hidden' },
  progressFill: {},
  emptyState: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyMsg: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, backgroundColor: colors.primary, borderRadius: borderRadius.full },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
