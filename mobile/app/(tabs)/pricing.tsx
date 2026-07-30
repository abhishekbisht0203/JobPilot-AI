import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming, useAnimatedStyle, Easing, interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { useAuthStore } from '../../store';
import { subscriptionsApi } from '../../lib/api';

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free' as const,
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: 'leaf-outline',
    color: colors.textMuted,
    gradient: ['#94A3B8', '#CBD5E1'] as readonly [string, string],
    description: 'Get started with basic tools to kickstart your job search.',
    features: [
      'Basic resume upload & ATS score',
      '3 AI resume versions/month',
      '1 cover letter/month',
      'Basic job search & matching',
      'Track up to 10 applications',
      'Email support',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro' as const,
    monthlyPrice: 29,
    yearlyPrice: 290,
    icon: 'diamond-outline',
    color: colors.primary,
    gradient: ['#3B82F6', '#6366F1'] as readonly [string, string],
    description: 'Unlock everything you need to land your dream job faster.',
    features: [
      'Everything in Free, plus:',
      'Unlimited AI resume versions',
      'Unlimited cover letters',
      'AI cold email drafts',
      'Mock interview coach',
      'Skill gap analysis',
      'Priority email & chat support',
      'Advanced analytics & insights',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise' as const,
    monthlyPrice: -1,
    yearlyPrice: -1,
    icon: 'business-outline',
    color: colors.secondary,
    gradient: ['#8B5CF6', '#6366F1'] as readonly [string, string],
    description: 'For teams and organizations scaling their hiring process.',
    features: [
      'Everything in Pro, plus:',
      'Team collaboration & workspaces',
      'Bulk resume processing',
      'Custom AI model training',
      'API access & integrations',
      'Dedicated account manager',
      'Custom reporting & analytics',
      'SSO & advanced security',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const COMPARISON_FEATURES: PlanFeature[] = [
  { name: 'Resume Upload & ATS Score', free: true, pro: true, enterprise: true },
  { name: 'AI Resume Versions', free: '3/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Cover Letters', free: '1/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Cold Email Drafts', free: false, pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Mock Interview Coach', free: false, pro: true, enterprise: true },
  { name: 'Skill Gap Analysis', free: false, pro: true, enterprise: true },
  { name: 'Advanced Analytics', free: false, pro: true, enterprise: true },
  { name: 'Team Collaboration', free: false, pro: false, enterprise: true },
  { name: 'API Access', free: false, pro: false, enterprise: true },
  { name: 'Dedicated Support', free: false, pro: false, enterprise: true },
];

function PricingToggle({ yearly, onToggle }: { yearly: boolean; onToggle: (v: boolean) => void }) {
  const thumbX = useSharedValue(yearly ? 28 : 0);

  useEffect(() => {
    thumbX.value = withSpring(yearly ? 28 : 0, { stiffness: 300, damping: 18 });
  }, [yearly]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  return (
    <View style={styles.toggleWrapper}>
      <BlurView intensity={60} tint="light" style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, !yearly && styles.toggleOptionActive]}
          onPress={() => onToggle(false)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, !yearly && styles.toggleTextActive]}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, yearly && styles.toggleOptionActive]}
          onPress={() => onToggle(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, yearly && styles.toggleTextActive]}>Yearly</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.toggleThumb, thumbStyle]} />
      </BlurView>
      {yearly && (
        <View style={styles.savingsBadge}>
          <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.savingsGradient}>
            <Ionicons name="pricetag" size={10} color="#FFF" />
            <Text style={styles.savingsText}>Save 17%</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

function PricingCard({ plan, index, yearly, currentTier, onSelect }: {
  plan: typeof PLANS[number]; index: number; yearly: boolean;
  currentTier: string; onSelect: (plan: typeof PLANS[number]) => void;
}) {
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  const isCurrent = currentTier === plan.tier;

  useEffect(() => {
    if (plan.popular) {
      borderGlow.value = withTiming(1, { duration: 800 });
    }
  }, []);

  const cardScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const popularBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(borderGlow.value, [0, 1], [0.4, 1]),
  }));

  const displayPrice = plan.monthlyPrice === -1 ? 'Custom' : yearly && plan.yearlyPrice > 0
    ? plan.yearlyPrice
    : plan.monthlyPrice;

  const displayPeriod = plan.monthlyPrice === -1 ? '' : yearly ? '/yr' : '/mo';

  const isCustom = plan.monthlyPrice === -1;

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 120).springify().damping(14)}>
      <TouchableOpacity
        onPress={() => onSelect(plan)}
        onPressIn={() => { scale.value = withSpring(0.97, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[cardScale]}>
          <View style={[styles.pricingCard, plan.popular && styles.pricingCardPopular]}>
            {plan.popular && (
              <Animated.View style={[styles.popularBorder, popularBorderStyle]} pointerEvents="none">
                <LinearGradient
                  colors={['#3B82F6', '#6366F1', '#8B5CF6', '#3B82F6']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}
            <BlurView intensity={plan.popular ? 50 : 40} tint="light" style={styles.pricingInner}>
              {plan.popular && (
                <View style={styles.popularLabel}>
                  <LinearGradient colors={['#3B82F6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.popularBadge}>
                    <Ionicons name="star" size={12} color="#FFF" />
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </LinearGradient>
                </View>
              )}
              <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.planIconWrap}>
                <Ionicons name={plan.icon as any} size={22} color="#FFF" />
              </LinearGradient>

              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDesc}>{plan.description}</Text>

              <View style={styles.priceRow}>
                {isCustom ? (
                  <Text style={[styles.priceValue, { color: plan.color }]}>Custom</Text>
                ) : (
                  <>
                    <Text style={[styles.priceCurrency, { color: plan.color }]}>$</Text>
                    <AnimatedCounter
                      value={displayPrice as number}
                      style={[styles.priceValue, { color: plan.color }]}
                      spring
                    />
                    <Text style={styles.pricePeriod}>{displayPeriod}</Text>
                  </>
                )}
              </View>

              <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.popular ? colors.primary : colors.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={isCurrent ? 'Current Plan' : plan.cta}
                onPress={() => onSelect(plan)}
                variant={plan.popular ? 'primary' : 'outline'}
                gradient={plan.popular}
                fullWidth
                disabled={isCurrent}
              />
            </BlurView>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ComparisonRow({ feature, index }: { feature: PlanFeature; index: number }) {
  const renderCell = (val: boolean | string) => {
    if (typeof val === 'boolean') {
      return val
        ? <Ionicons name="checkmark" size={18} color={colors.success} />
        : <Ionicons name="close" size={18} color={colors.textMuted} />;
    }
    return <Text style={styles.comparisonCellText}>{val}</Text>;
  };

  return (
    <Animated.View entering={FadeInUp.delay(600 + index * 40).springify().damping(14)}>
      <View style={[styles.comparisonRow, index % 2 === 0 && styles.comparisonRowAlt]}>
        <Text style={styles.comparisonFeature}>{feature.name}</Text>
        <View style={styles.comparisonCells}>
          <View style={styles.comparisonCell}>{renderCell(feature.free)}</View>
          <View style={styles.comparisonCell}>{renderCell(feature.pro)}</View>
          <View style={styles.comparisonCell}>{renderCell(feature.enterprise)}</View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const [yearly, setYearly] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const currentTier = user?.plan_tier || 'free';

  const handleSelectPlan = useCallback(async (plan: typeof PLANS[number]) => {
    if (plan.tier === currentTier) return;
    if (plan.id === 'enterprise') {
      router.push('/(tabs)/contact');
      return;
    }
    setProcessing(plan.id);
    try {
      await subscriptionsApi.subscribe(plan.id, yearly ? 'yearly' : 'monthly');
    } catch {} finally {
      setProcessing(null);
    }
  }, [yearly, currentTier]);

  return (
    <View style={styles.container}>
      <MeshGradient opacity={0.3} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <Text style={styles.title}>Pricing</Text>
          <Text style={styles.subtitle}>Choose the plan that fits your career goals</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
          <PricingToggle yearly={yearly} onToggle={setYearly} />
        </Animated.View>

        <View style={styles.plansContainer}>
          {PLANS.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={index}
              yearly={yearly}
              currentTier={currentTier}
              onSelect={handleSelectPlan}
            />
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Feature Comparison</Text>
          <GlassCard style={styles.comparisonCard}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonHeaderFeature}>Feature</Text>
              <View style={styles.comparisonCells}>
                <Text style={styles.comparisonHeaderCell}>Free</Text>
                <Text style={[styles.comparisonHeaderCell, styles.comparisonHeaderCellPro]}>Pro</Text>
                <Text style={styles.comparisonHeaderCell}>Enterprise</Text>
              </View>
            </View>
            {COMPARISON_FEATURES.map((feature, index) => (
              <ComparisonRow key={index} feature={feature} index={index} />
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).springify().damping(14)}>
          <GlassCard style={styles.guaranteeCard} glowColor={colors.success}>
            <View style={styles.guaranteeRow}>
              <LinearGradient colors={['#10B981', '#34D399']} style={styles.guaranteeIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#FFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.guaranteeTitle}>14-Day Money-Back Guarantee</Text>
                <Text style={styles.guaranteeText}>
                  Not satisfied? Get a full refund within 14 days of your purchase. No questions asked.
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginTop: 4, lineHeight: 20 },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    marginTop: spacing.xl, marginBottom: spacing.md, letterSpacing: -0.3,
  },
  toggleWrapper: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  toggleContainer: {
    flexDirection: 'row', borderRadius: borderRadius.full,
    padding: 4, backgroundColor: colors.surfaceLight,
    position: 'relative', width: 200,
  },
  toggleOption: {
    flex: 1, paddingVertical: 10, borderRadius: borderRadius.full,
    alignItems: 'center', zIndex: 2,
  },
  toggleOptionActive: {},
  toggleText: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  toggleTextActive: { color: colors.white, fontWeight: '600' },
  toggleThumb: {
    position: 'absolute', width: '50%', height: '80%', top: '10%',
    borderRadius: borderRadius.full, backgroundColor: colors.primary,
    ...shadow.md,
  },
  savingsBadge: { marginTop: spacing.sm },
  savingsGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.full,
  },
  savingsText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  plansContainer: { gap: spacing.md, marginTop: spacing.sm },
  pricingCard: { borderRadius: borderRadius.xl, overflow: 'hidden', ...shadow.lg },
  pricingCardPopular: { ...shadow.glow.primary },
  popularBorder: {
    ...StyleSheet.absoluteFillObject, borderRadius: borderRadius.xl,
    zIndex: 0,
  },
  pricingInner: { borderRadius: borderRadius.xl, overflow: 'hidden', padding: spacing.lg },
  popularLabel: { alignItems: 'center', marginBottom: spacing.md },
  popularBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: borderRadius.full,
  },
  popularBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  planIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  planName: { fontSize: 22, fontWeight: '700', color: colors.text },
  planDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.md },
  priceCurrency: { fontSize: 20, fontWeight: '700' },
  priceValue: { fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  pricePeriod: { fontSize: 15, color: colors.textMuted, fontWeight: '500', marginLeft: 4 },
  featureList: { gap: spacing.sm, marginVertical: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  comparisonCard: { padding: spacing.md },
  comparisonHeader: { flexDirection: 'row', paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  comparisonHeaderFeature: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  comparisonCells: { flexDirection: 'row', width: 180 },
  comparisonHeaderCell: { width: 60, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.textMuted },
  comparisonHeaderCellPro: { color: colors.primary },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  comparisonRowAlt: { backgroundColor: colors.highlight },
  comparisonFeature: { flex: 1, fontSize: 13, color: colors.text },
  comparisonCell: { width: 60, alignItems: 'center', justifyContent: 'center' },
  comparisonCellText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  guaranteeCard: { padding: spacing.md, marginTop: spacing.lg },
  guaranteeRow: { flexDirection: 'row', alignItems: 'center' },
  guaranteeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  guaranteeTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  guaranteeText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginTop: 2 },
});
