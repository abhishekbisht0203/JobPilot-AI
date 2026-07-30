import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import Animated, {
  FadeInDown, FadeInUp, FadeInLeft, FadeInRight,
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, Extrapolation,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';

// ─── AnimatedCard ─────────────────────────────────────────────
export function AnimatedCard({ children, delay = 0, index, style, onPress }: {
  children: React.ReactNode; delay?: number; index?: number; style?: ViewStyle; onPress?: () => void;
}) {
  const d = delay + (index ?? 0) * 60;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(d).springify().damping(14)} style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── GradientCard ────────────────────────────────────────────
export function GradientCard({ children, colors: gradColors, icon, title, subtitle, style, height }: {
  children?: React.ReactNode; colors: readonly [string, string]; icon?: string; title?: string; subtitle?: string;
  style?: ViewStyle; height?: number;
}) {
  return (
    <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradientCard, height ? { height } : {}, style]}>
      <View style={styles.gcRow}>
        <View style={{ flex: 1 }}>
          {title && <Text style={styles.gcTitle}>{title}</Text>}
          {subtitle && <Text style={styles.gcSubtitle}>{subtitle}</Text>}
          {children}
        </View>
        {icon && (
          <View style={styles.gcIconWrap}>
            <Ionicons name={icon as any} size={48} color="rgba(255,255,255,0.2)" />
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

// ─── FeatureList ────────────────────────────────────────────
export function FeatureList({ items, color }: { items: { icon: string; text: string }[]; color?: string }) {
  const c = color || colors.primary;
  return (
    <View style={styles.featureList}>
      {items.map((item, i) => (
        <Animated.View key={i} entering={FadeInLeft.delay(200 + i * 80).springify().damping(14)} style={styles.featureItem}>
          <View style={[styles.fiIcon, { backgroundColor: c + '20' }]}>
            <Ionicons name={item.icon as any} size={16} color={c} />
          </View>
          <Text style={styles.fiText}>{item.text}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// ─── UploadCard ──────────────────────────────────────────────
export function UploadCard({ onPress, uploading, uploaded, label }: {
  onPress: () => void; uploading?: boolean; uploaded?: boolean; label?: string;
}) {
  const pulse = useSharedValue(1);
  if (uploading) {
    pulse.value = withSpring(1.05, { stiffness: 100, damping: 4 });
  }
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <TouchableOpacity onPress={onPress} disabled={uploading} activeOpacity={0.8}>
      <Animated.View entering={FadeInUp.springify().damping(14)} style={[pulseStyle]}>
        <BlurView intensity={50} tint="light" style={styles.uploadCard}>
          <View style={styles.ucContent}>
            <View style={[styles.ucIconWrap, { backgroundColor: uploaded ? colors.successLight + '80' : colors.primaryBg }]}>
              <Ionicons
                name={uploaded ? 'checkmark-circle' : uploading ? 'hourglass-outline' : 'cloud-upload-outline'}
                size={32}
                color={uploaded ? colors.success : uploading ? colors.warning : colors.primary}
              />
            </View>
            <Text style={styles.ucTitle}>
              {uploading ? 'Uploading...' : uploaded ? 'Uploaded Successfully' : label || 'Upload Resume'}
            </Text>
            <Text style={styles.ucSub}>
              {uploading ? 'Please wait...' : uploaded ? 'Tap to upload another' : 'PDF, DOCX, or TXT'}
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── SearchBar ────────────────────────────────────────────────
export function SearchBar({ value, onChangeText, placeholder }: {
  value: string; onChangeText: (t: string) => void; placeholder?: string;
}) {
  return (
    <BlurView intensity={40} tint="light" style={styles.searchBar}>
      <Ionicons name="search-outline" size={18} color={colors.textMuted} />
      <AnimatedTextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={colors.textMuted}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </BlurView>
  );
}

// ─── ScoreBadge ──────────────────────────────────────────────
export function ScoreBadge({ score, size = 'md', showLabel }: { score: number; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }) {
  const color = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;
  const dim = size === 'lg' ? 72 : size === 'md' ? 56 : 40;
  const fontSize = size === 'lg' ? 20 : size === 'md' ? 16 : 13;
  return (
    <View style={[styles.scoreBadge, { width: dim, height: dim, borderRadius: dim / 2, borderColor: color }]}>
      <Text style={[styles.scoreBadgeText, { color, fontSize }]}>{score}</Text>
      {showLabel && <Text style={[styles.scoreBadgeLabel, { color }]}>ATS</Text>}
    </View>
  );
}

// ─── ResumeCard ──────────────────────────────────────────────
export function ResumeCard({ name, date, score, onPress, gradientColors }: {
  name: string; date: string; score: number; onPress?: () => void; gradientColors?: readonly [string, string];
}) {
  const cols = gradientColors || ['#7C3AED', '#4F46E5'] as const;
  const sc = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  return (
    <AnimatedCard onPress={onPress}>
      <BlurView intensity={40} tint="light" style={styles.resumeCard}>
        <LinearGradient colors={cols} style={styles.rcIcon}>
          <Ionicons name="document-text" size={20} color="#FFF" />
        </LinearGradient>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.rcName} numberOfLines={1}>{name}</Text>
          <Text style={styles.rcDate}>{date}</Text>
        </View>
        <BadgePill label={`${score}%`} variant={sc as any} />
      </BlurView>
    </AnimatedCard>
  );
}

export function BadgePill({ label, variant }: { label: string; variant?: 'success' | 'warning' | 'error' | 'primary' | 'info' }) {
  const vc = {
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: '#D97706' },
    error: { bg: colors.errorLight, text: '#DC2626' },
    primary: { bg: colors.primaryBg, text: colors.primary },
    info: { bg: '#ECFEFF', text: '#0891B2' },
  }[variant || 'primary'];
  return (
    <View style={[styles.badgePill, { backgroundColor: vc.bg }]}>
      <Text style={[styles.badgePillText, { color: vc.text }]}>{label}</Text>
    </View>
  );
}

// ─── SessionCard ──────────────────────────────────────────────
export function SessionCard({ title, duration, date, score, onPress, gradientColors }: {
  title: string; duration: string; date: string; score: number; onPress?: () => void; gradientColors?: readonly [string, string];
}) {
  const cols = gradientColors || ['#14B8A6', '#0D9488'] as const;
  const sc = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  return (
    <AnimatedCard onPress={onPress}>
      <BlurView intensity={40} tint="light" style={styles.sessionCard}>
        <LinearGradient colors={cols} style={styles.scIcon}>
          <Ionicons name="mic" size={18} color="#FFF" />
        </LinearGradient>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.scTitle} numberOfLines={1}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="time-outline" size={11} color={colors.textMuted} />
              <Text style={styles.scMeta}>{duration}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
              <Text style={styles.scMeta}>{date}</Text>
            </View>
          </View>
        </View>
        <BadgePill label={`${score}%`} variant={sc} />
      </BlurView>
    </AnimatedCard>
  );
}

// ─── SalaryCard ──────────────────────────────────────────────
export function SalaryCard({ role, salaryRange, growth, companies, onPress }: {
  role: string; salaryRange: string; growth?: number; companies?: number; onPress?: () => void;
}) {
  return (
    <AnimatedCard onPress={onPress}>
      <BlurView intensity={40} tint="light" style={styles.salaryCard}>
        <View style={styles.salaryTop}>
          <LinearGradient colors={['#EA580C', '#D97706']} style={styles.salIcon}>
            <Ionicons name="cash" size={18} color="#FFF" />
          </LinearGradient>
          <Text style={styles.salRole} numberOfLines={1}>{role}</Text>
        </View>
        <Text style={styles.salRange}>{salaryRange}</Text>
        <View style={styles.salMeta}>
          {growth !== undefined && (
            <BadgePill label={`+${growth}% growth`} variant={growth >= 10 ? 'success' : 'warning'} />
          )}
          {companies !== undefined && (
            <Text style={styles.salCompanies}>{companies} companies</Text>
          )}
        </View>
      </BlurView>
    </AnimatedCard>
  );
}

// ─── RoadmapCard ──────────────────────────────────────────────
export function RoadmapCard({ title, description, step, totalSteps, status, onPress }: {
  title: string; description?: string; step: number; totalSteps: number; status: 'completed' | 'current' | 'locked'; onPress?: () => void;
}) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  return (
    <AnimatedCard onPress={onPress}>
      <BlurView intensity={40} tint="light" style={[styles.roadmapCard, isCurrent && styles.rmCurrent]}>
        <View style={styles.rmRow}>
          <View style={styles.rmStepWrap}>
            <LinearGradient
              colors={isCompleted ? ['#059669', '#10B981'] : isCurrent ? ['#6366F1', '#8B5CF6'] : ['#D1D5DB', '#D1D5DB']}
              style={styles.rmStepCircle}
            >
              <Ionicons
                name={isCompleted ? 'checkmark' : isCurrent ? 'arrow-forward' : 'lock-closed'}
                size={14} color="#FFF"
              />
            </LinearGradient>
            {step < totalSteps && <View style={[styles.rmLine, isCompleted && styles.rmLineDone]} />}
          </View>
          <View style={styles.rmContent}>
            <Text style={[styles.rmTitle, isCompleted && styles.rmDone, isCurrent && styles.rmHighlight]}>{title}</Text>
            {description && <Text style={styles.rmDesc} numberOfLines={2}>{description}</Text>}
          </View>
          <View style={styles.rmBadge}>
            <BadgePill
              label={isCompleted ? 'Done' : isCurrent ? 'In Progress' : `${step}/${totalSteps}`}
              variant={isCompleted ? 'success' : isCurrent ? 'primary' : 'warning'}
            />
          </View>
        </View>
      </BlurView>
    </AnimatedCard>
  );
}

// ─── TopicCard ──────────────────────────────────────────────
export function TopicCard({ title, icon, completion, questionCount, onPress, gradientColors }: {
  title: string; icon: string; completion: number; questionCount: number; onPress?: () => void; gradientColors?: readonly [string, string];
}) {
  const cols = gradientColors || ['#3B82F6', '#2563EB'] as const;
  return (
    <AnimatedCard onPress={onPress}>
      <BlurView intensity={40} tint="light" style={styles.topicCard}>
        <LinearGradient colors={cols} style={styles.tcIcon}>
          <Ionicons name={icon as any} size={20} color="#FFF" />
        </LinearGradient>
        <Text style={styles.tcTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.tcMetaRow}>
          <View style={styles.tcMeta}>
            <View style={[styles.tcBar, { backgroundColor: colors.borderLight }]}>
              <View style={[styles.tcBarFill, { width: `${completion}%`, backgroundColor: cols[0] }]} />
            </View>
            <Text style={styles.tcMetaText}>{completion}%</Text>
          </View>
          <Text style={styles.tcQCount}>{questionCount} questions</Text>
        </View>
      </BlurView>
    </AnimatedCard>
  );
}

// ─── PrimaryButton ──────────────────────────────────────────
export function PrimaryButton({ title, icon, onPress, loading, gradient, style, disabled }: {
  title: string; icon?: string; onPress: () => void; loading?: boolean; gradient?: readonly [string, string]; style?: ViewStyle; disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const cols = gradient || ['#7C3AED', '#4F46E5'] as const;

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        onPressIn={() => { scale.value = withSpring(0.95, { stiffness: 400, damping: 10 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
      >
        <LinearGradient colors={disabled ? ['#9CA3AF', '#B0B5BE'] : cols} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              {icon && <Ionicons name={icon as any} size={20} color="#FFF" />}
              <Text style={styles.primaryBtnText}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SecondaryButton ──────────────────────────────────────────
export function SecondaryButton({ title, icon, onPress, style }: {
  title: string; icon?: string; onPress: () => void; style?: ViewStyle;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.secondaryBtn, style]}>
      {icon && <Ionicons name={icon as any} size={18} color={colors.primary} />}
      <Text style={styles.secondaryBtnText}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
    </TouchableOpacity>
  );
}

// ─── LoadingState ────────────────────────────────────────────
export function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.sm, paddingVertical: spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <BlurView key={i} intensity={40} tint="light" style={{ height: 72, borderRadius: borderRadius.xl, overflow: 'hidden' }} />
      ))}
    </View>
  );
}

// ─── SectionHeader ──────────────────────────────────────────
export function CTSectionHeader({ title, icon, badge, action }: {
  title: string; icon?: string; badge?: string | number; action?: React.ReactNode;
}) {
  return (
    <View style={styles.ctSectionHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {icon && <Ionicons name={icon as any} size={18} color={colors.text} />}
        <Text style={styles.ctSectionTitle}>{title}</Text>
        {badge !== undefined && <BadgePill label={`${badge}`} variant="primary" />}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadow.lg,
  },
  gcRow: { flexDirection: 'row', alignItems: 'center' },
  gcTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  gcSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: spacing.xs, lineHeight: 20 },
  gcIconWrap: { marginLeft: spacing.md, opacity: 0.6 },
  featureList: { gap: spacing.sm, marginTop: spacing.md },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fiIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fiText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', flex: 1 },
  uploadCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
  },
  ucContent: { alignItems: 'center', gap: spacing.sm },
  ucIconWrap: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  ucTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  ucSub: { fontSize: 13, color: colors.textMuted },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg, gap: spacing.sm, overflow: 'hidden',
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: spacing.xs },
  scoreBadge: {
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  scoreBadgeText: { fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreBadgeLabel: { fontSize: 8, fontWeight: '700', marginTop: -2 },
  resumeCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  rcIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rcName: { fontSize: 15, fontWeight: '600', color: colors.text },
  rcDate: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  badgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full, alignSelf: 'flex-start' },
  badgePillText: { fontSize: 12, fontWeight: '600' },
  sessionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  scIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  scMeta: { fontSize: 11, color: colors.textMuted },
  salaryCard: {
    padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  salaryTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  salIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  salRole: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },
  salRange: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  salMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  salCompanies: { fontSize: 12, color: colors.textMuted },
  roadmapCard: {
    padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  rmCurrent: { borderWidth: 1.5, borderColor: '#6366F1' },
  rmRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rmStepWrap: { alignItems: 'center', width: 32, marginRight: spacing.sm },
  rmStepCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rmLine: { width: 2, flex: 1, backgroundColor: colors.borderLight, marginTop: 4, minHeight: 20 },
  rmLineDone: { backgroundColor: colors.success },
  rmContent: { flex: 1 },
  rmTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rmDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  rmHighlight: { color: '#6366F1' },
  rmDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  rmBadge: { marginLeft: spacing.sm },
  topicCard: {
    padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  tcIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  tcTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  tcMetaRow: { gap: spacing.xs },
  tcMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tcBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  tcBarFill: { height: 4, borderRadius: 2 },
  tcMetaText: { fontSize: 12, fontWeight: '600', color: colors.textMuted, width: 32, textAlign: 'right' },
  tcQCount: { fontSize: 11, color: colors.textMuted },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: borderRadius.md, gap: spacing.sm,
    ...shadow.glow.primary,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary, flex: 1 },
  ctSectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  ctSectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
});
