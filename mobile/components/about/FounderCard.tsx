import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';

export interface Founder {
  name: string;
  initials: string;
  avatarGradient: readonly [string, string];
  position: string;
  specialties: string;
  bio: string;
  skills: string[];
  badges: { label: string; icon: keyof typeof Ionicons.glyphMap; gradient: readonly [string, string] }[];
  photo?: any;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  email?: string;
  phone?: string;
  projects?: { name: string; url: string }[];
}

const FOUNDER_STATS = [
  { label: 'Years Exp.', value: '5+', icon: 'ribbon-outline' as const },
  { label: 'AI Apps', value: '20+', icon: 'sparkles-outline' as const },
  { label: 'Technologies', value: '15+', icon: 'code-slash-outline' as const },
];

const SOCIAL_LINKS = [
  { key: 'linkedInUrl', label: 'LinkedIn', icon: 'logo-linkedin' as const },
  { key: 'githubUrl', label: 'GitHub', icon: 'logo-github' as const },
  { key: 'portfolioUrl', label: 'Portfolio', icon: 'globe-outline' as const },
  { key: 'email', label: 'Email', icon: 'mail-outline' as const },
  { key: 'phone', label: 'Phone', icon: 'call-outline' as const },
] as const;

const VISIBLE_SKILLS = 6;

export function FounderCard({ founder }: { founder: Founder }) {
  const visibleSkills = founder.skills.slice(0, VISIBLE_SKILLS);
  const overflowCount = founder.skills.length - VISIBLE_SKILLS;

  const openSocial = (key: string) => {
    const value = (founder as any)[key];
    if (!value) return;
    let url = value;
    if (key === 'email') url = `mailto:${value}`;
    else if (key === 'phone') url = `tel:${value.replace(/[^+\d]/g, '')}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={founder.avatarGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            {founder.photo ? (
              <Image source={founder.photo} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarInitials}>{founder.initials}</Text>
            )}
          </LinearGradient>
          <View style={styles.statusDot}>
            <View style={styles.statusDotInner} />
          </View>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{founder.name}</Text>
          <Text style={styles.position}>{founder.position}</Text>
          <Text style={styles.specialties}>{founder.specialties}</Text>
        </View>
      </View>

      <Text style={styles.bio}>{founder.bio}</Text>

      <View style={styles.statsRow}>
        {FOUNDER_STATS.map((stat) => (
          <View key={stat.label} style={styles.statBox}>
            <Ionicons name={stat.icon} size={16} color={colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.skillsRow}>
        {visibleSkills.map((skill) => (
          <View key={skill} style={styles.skillPill}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {overflowCount > 0 && (
          <View style={styles.overflowPill}>
            <Text style={styles.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.badgesRow}>
        {founder.badges.map((badge) => (
          <LinearGradient
            key={badge.label}
            colors={badge.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Ionicons name={badge.icon} size={12} color="#FFF" />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {founder.projects && founder.projects.length > 0 && (
        <View style={styles.projectsSection}>
          <Text style={styles.projectsLabel}>Projects</Text>
          <View style={styles.projectsRow}>
            {founder.projects.map((p) => (
              <TouchableOpacity
                key={p.name}
                style={styles.projectChip}
                onPress={() => Linking.openURL(p.url).catch(() => {})}
                activeOpacity={0.7}
              >
                <Ionicons name="link-outline" size={12} color={colors.primary} />
                <Text style={styles.projectChipText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.socialRow}>
        {SOCIAL_LINKS.filter((s) => (founder as any)[s.key]).map((social) => (
          <TouchableOpacity
            key={social.key}
            style={styles.socialLink}
            onPress={() => openSocial(social.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={social.icon} size={16} color={colors.textSecondary} />
            <Text style={styles.socialLabel}>{social.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadow.lg,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  avatarWrap: { position: 'relative', marginRight: spacing.md },
  avatar: {
    width: 72, height: 72, borderRadius: borderRadius.xl,
    justifyContent: 'center', alignItems: 'center', ...shadow.md,
  },
  avatarInitials: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  avatarImage: {
    width: '100%', height: '100%',
    borderRadius: borderRadius.xl,
  },
  statusDot: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.success,
    borderWidth: 2, borderColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  statusDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  headerText: { flex: 1, minWidth: 0 },
  name: { fontSize: 19, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  position: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 2 },
  specialties: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 17 },
  bio: { fontSize: 13.5, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  statBox: {
    flex: 1, alignItems: 'center', gap: 4,
    paddingVertical: spacing.sm, borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryBg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  statValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 9, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  skillPill: {
    backgroundColor: colors.primaryBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  skillText: { fontSize: 11.5, fontWeight: '600', color: colors.primary },
  overflowPill: {
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  overflowText: { fontSize: 11.5, fontWeight: '600', color: colors.textMuted },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full,
  },
  badgeText: { fontSize: 11.5, fontWeight: '700', color: '#FFF' },
  projectsSection: { marginBottom: spacing.md },
  projectsLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 },
  projectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  projectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg, borderWidth: 1, borderColor: colors.border,
  },
  projectChipText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  socialRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  socialLink: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  socialLabel: { fontSize: 11.5, fontWeight: '600', color: colors.textSecondary },
});
