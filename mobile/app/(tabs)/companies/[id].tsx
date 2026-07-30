import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { Loader } from '../../../components/ui/Loader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { jobApi } from '../../../lib/api';
import { Job } from '../../../types';
import { formatSalary, timeAgo, getInitials } from '../../../lib/helpers';

const COMPANY_GRADIENTS: (keyof typeof colors.gradient)[] = [
  'blue', 'purple', 'coral', 'sunset', 'teal', 'indigo',
  'primary', 'success', 'warning', 'error', 'aurora', 'nebula',
];

const industryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Technology: 'hardware-chip',
  Healthcare: 'medkit',
  Finance: 'cash',
  Marketing: 'megaphone',
  Education: 'school',
  Design: 'color-palette',
  Consulting: 'trending-up',
  Legal: 'shield-checkmark',
  HR: 'people',
  Sales: 'cart',
  Operations: 'settings',
  Hospitality: 'restaurant',
};

function getGradientForCompany(name: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % COMPANY_GRADIENTS.length;
  return colors.gradient[COMPANY_GRADIENTS[idx]];
}

export default function CompanyProfileScreen() {
  const { id: companyName } = useLocalSearchParams<{ id: string }>();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const decodedName = companyName ? decodeURIComponent(companyName) : '';

  useEffect(() => {
    if (!decodedName) return;
    jobApi.list({ page: 1, per_page: 100 })
      .then((res) => setAllJobs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [decodedName]);

  const companyJobs = useMemo(() => {
    return allJobs.filter(j => j.company === decodedName);
  }, [allJobs, decodedName]);

  const company = useMemo(() => {
    if (companyJobs.length === 0) return null;
    const allSkills = [...new Set(companyJobs.flatMap(j => j.skills || []))];
    const locations = [...new Set(companyJobs.map(j => j.location).filter(Boolean) as string[])];
    const firstDesc = companyJobs.find(j => j.description)?.description || '';

    const text = companyJobs.map(j => j.title + ' ' + (j.description || '')).join(' ').toLowerCase();
    let industry = 'Technology';
    if (text.includes('health') || text.includes('medical') || text.includes('pharma')) industry = 'Healthcare';
    else if (text.includes('finance') || text.includes('bank') || text.includes('accounting')) industry = 'Finance';
    else if (text.includes('market') || text.includes('advertising')) industry = 'Marketing';
    else if (text.includes('educat') || text.includes('teach') || text.includes('training')) industry = 'Education';
    else if (text.includes('design') || text.includes('ui') || text.includes('ux')) industry = 'Design';
    else if (text.includes('consult') || text.includes('strategy') || text.includes('analyst')) industry = 'Consulting';
    else if (text.includes('legal') || text.includes('law') || text.includes('attorney')) industry = 'Legal';
    else if (text.includes('hr ') || text.includes('recruit') || text.includes('talent')) industry = 'HR';
    else if (text.includes('sales')) industry = 'Sales';

    return {
      name: decodedName,
      industry,
      description: firstDesc.length > 300 ? firstDesc.substring(0, 300) + '...' : firstDesc,
      locations: locations.length > 0 ? locations : ['Remote'],
      open_jobs_count: companyJobs.length,
      skills: allSkills,
      hiring: true,
    };
  }, [companyJobs, decodedName]);

  const gradientColors = useMemo(() => getGradientForCompany(decodedName), [decodedName]);
  const initials = getInitials(decodedName);

  if (loading) return <Loader fullScreen />;

  if (!company || companyJobs.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={gradientColors} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
        <EmptyState
          icon="business-outline"
          title="Company not found"
          message={`No job listings found for ${decodedName}.`}
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const industryIcon = industryIcons[company.industry] || 'briefcase';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: getTabListBottomPadding() + spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <LinearGradient colors={gradientColors} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']}
                style={styles.heroIcon}
              >
                <Text style={styles.heroIconText}>{initials}</Text>
              </LinearGradient>
              <Text style={styles.heroTitle}>{company.name}</Text>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaItem}>
                  <Ionicons name={industryIcon} size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroMetaText}>{company.industry}</Text>
                </View>
                <View style={styles.heroMetaDot} />
                <View style={styles.heroMetaItem}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroMetaText}>{company.locations?.[0] || ''}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.content, { paddingHorizontal: spacing.lg }]}>
          <Animated.View entering={FadeInUp.delay(200).springify().damping(14)}>
            <GlassCard style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <LinearGradient colors={gradientColors} style={styles.statIcon}>
                    <Ionicons name="briefcase" size={18} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{company.open_jobs_count}</Text>
                  <Text style={styles.statLabel}>Open Jobs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <LinearGradient colors={colors.gradient.success} style={styles.statIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{companyJobs.length}</Text>
                  <Text style={styles.statLabel}>Total Jobs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <LinearGradient colors={colors.gradient.purple} style={styles.statIcon}>
                    <Ionicons name="pricetags" size={18} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{company.skills.length}</Text>
                  <Text style={styles.statLabel}>Skills</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(250).springify().damping(14)}>
            <Text style={styles.sectionTitle}>About</Text>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.descriptionText}>{company.description}</Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).springify().damping(14)}>
            <View style={styles.infoRow}>
              <GlassCard style={styles.infoCard} glowColor={gradientColors[0]}>
                <Ionicons name={industryIcon} size={20} color={gradientColors[0]} />
                <Text style={styles.infoLabel}>Industry</Text>
                <Text style={styles.infoValue}>{company.industry}</Text>
              </GlassCard>
              <GlassCard style={styles.infoCard} glowColor={colors.secondary}>
                <Ionicons name="location-outline" size={20} color={colors.secondary} />
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{company.locations?.[0] || ''}</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {company.skills.length > 0 && (
            <Animated.View entering={FadeInUp.delay(350).springify().damping(14)}>
              <Text style={styles.sectionTitle}>Tech Stack & Skills</Text>
              <GlassCard style={styles.sectionCard}>
                <View style={styles.skillsGrid}>
                  {company.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillChip}>
                      <Ionicons name="code-slash" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.skillChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(400).springify().damping(14)}>
            <Text style={styles.sectionTitle}>
              Open Positions
              <Text style={styles.sectionCount}> ({companyJobs.length})</Text>
            </Text>
          </Animated.View>

          {companyJobs.map((job, idx) => (
            <Animated.View key={job.id} entering={FadeInUp.delay(420 + idx * 60).springify().damping(14)}>
              <TouchableOpacity
                onPress={() => router.push(`/job/${job.id}`)}
                activeOpacity={0.9}
              >
                <GlassCard style={styles.jobCard} glowColor={gradientColors[0]}>
                  <View style={styles.jobHeader}>
                    <LinearGradient colors={gradientColors} style={styles.jobIconSmall}>
                      <Text style={styles.jobIconText}>{(job.title || 'J')[0].toUpperCase()}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                      <View style={styles.jobMetaRow}>
                        {job.location && (
                          <View style={styles.jobMetaItem}>
                            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                            <Text style={styles.jobMetaText}>{job.location}</Text>
                          </View>
                        )}
                        {job.posted_at && (
                          <View style={styles.jobMetaItem}>
                            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                            <Text style={styles.jobMetaText}>{timeAgo(job.posted_at)}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>

                  {job.skills && job.skills.length > 0 && (
                    <View style={styles.jobSkillsRow}>
                      {job.skills.slice(0, 3).map((s, i) => (
                        <View key={i} style={styles.jobSkillChip}>
                          <Text style={styles.jobSkillChipText}>{s}</Text>
                        </View>
                      ))}
                      {job.skills.length > 3 && (
                        <Text style={styles.moreSkillsText}>+{job.skills.length - 3}</Text>
                      )}
                    </View>
                  )}

                  <View style={styles.jobFooter}>
                    {job.salary_min ? (
                      <View style={styles.salaryBadge}>
                        <Ionicons name="cash-outline" size={13} color={colors.success} />
                        <Text style={styles.salaryText}>{formatSalary(job.salary_min, job.salary_max, job.currency)}</Text>
                      </View>
                    ) : (
                      <Badge label="Salary not disclosed" variant="default" size="sm" />
                    )}
                    <Badge label={job.platform} variant="info" size="sm" />
                  </View>
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
  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroContent: { alignItems: 'center' },
  heroIcon: {
    width: 72, height: 72, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroIconText: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  heroTitle: {
    color: '#FFFFFF', fontSize: 28, fontWeight: '700',
    textAlign: 'center', letterSpacing: -0.5,
  },
  heroMetaRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.sm, gap: spacing.sm,
  },
  heroMetaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  heroMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  heroMetaDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  content: { gap: spacing.md, marginTop: -24 },
  statsCard: { padding: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statNumber: {
    fontSize: 20, fontWeight: '800', color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11, fontWeight: '500', color: colors.textMuted,
    marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.3,
  },
  statDivider: {
    width: 1, height: 40, backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionCount: {
    fontSize: 16, fontWeight: '500', color: colors.textMuted,
  },
  sectionCard: { padding: spacing.md },
  descriptionText: {
    color: colors.textSecondary, fontSize: 14, lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row', gap: spacing.sm,
  },
  infoCard: {
    flex: 1, padding: spacing.md, alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12, fontWeight: '500', color: colors.textMuted,
    marginTop: spacing.xs,
  },
  infoValue: {
    fontSize: 14, fontWeight: '600', color: colors.text,
    marginTop: 2, textAlign: 'center',
  },
  skillsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs,
  },
  skillChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
  },
  skillChipText: {
    fontSize: 12, fontWeight: '500', color: colors.primary,
  },
  jobCard: { marginBottom: spacing.sm },
  jobHeader: { flexDirection: 'row', alignItems: 'center' },
  jobIconSmall: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  jobIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  jobMetaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  jobMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  jobMetaText: { fontSize: 11, color: colors.textMuted },
  jobSkillsRow: {
    flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm,
    alignItems: 'center', flexWrap: 'wrap',
  },
  jobSkillChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
  },
  jobSkillChipText: {
    fontSize: 11, fontWeight: '500', color: colors.primary,
  },
  moreSkillsText: {
    fontSize: 11, color: colors.textMuted,
  },
  jobFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
  },
  salaryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.sm,
  },
  salaryText: {
    fontSize: 12, fontWeight: '600', color: colors.success,
  },
});
