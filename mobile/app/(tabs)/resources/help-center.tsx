import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
}

const POPULAR_TOPICS: HelpTopic[] = [
  { id: '1', title: 'Account Setup', description: 'Create and manage your account', icon: 'person-add', gradient: colors.gradient.blue },
  { id: '2', title: 'Resume Upload', description: 'How to upload and parse resumes', icon: 'cloud-upload', gradient: colors.gradient.purple },
  { id: '3', title: 'Job Matching', description: 'Understanding match scores', icon: 'git-compare', gradient: colors.gradient.teal },
  { id: '4', title: 'AI Features', description: 'Using AI-powered tools', icon: 'sparkles', gradient: colors.gradient.coral },
  { id: '5', title: 'Subscription', description: 'Plans, billing and upgrades', icon: 'card', gradient: colors.gradient.sunset },
  { id: '6', title: 'Privacy & Security', description: 'Your data and privacy settings', icon: 'shield-checkmark', gradient: colors.gradient.indigo },
  { id: '7', title: 'Notifications', description: 'Managing alert preferences', icon: 'notifications', gradient: colors.gradient.success },
  { id: '8', title: 'Troubleshooting', description: 'Fix common issues', icon: 'bug', gradient: colors.gradient.aurora },
];

const FAQ_PREVIEW = [
  { q: 'How does the AI resume analysis work?', a: 'Our AI analyzes your resume against ATS algorithms and provides a score with specific improvement suggestions.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel at any time from your account settings. Your access continues until the billing period ends.' },
  { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption. Your data is never shared without your explicit consent.' },
];

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, width } = useResponsive();
  const [search, setSearch] = useState('');

  const isCompact = width < 380;
  const numColumns = isCompact ? 2 : 4;

  const filteredTopics = useMemo(() => {
    if (!search) return POPULAR_TOPICS;
    return POPULAR_TOPICS.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Help Center</Text>
          <Text style={styles.subtitle}>How can we help you today?</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <BlurView intensity={60} tint="light" style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help topics..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Popular Topics</Text>
        </Animated.View>

        <View style={[styles.topicsGrid, { gap: spacing.sm }]}>
          {filteredTopics.map((topic, index) => (
            <Animated.View key={topic.id} entering={FadeInDown.delay(150 + index * 50).springify().damping(16)} style={{ width: '48%', flexGrow: 1, minWidth: isCompact ? '100%' : 140 }}>
              <TouchableOpacity activeOpacity={0.8}>
                <BlurView intensity={50} tint="light" style={styles.topicCard}>
                  <LinearGradient colors={topic.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topicIcon}>
                    <Ionicons name={topic.icon} size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.topicTitle} numberOfLines={1}>{topic.title}</Text>
                  <Text style={styles.topicDesc} numberOfLines={2}>{topic.description}</Text>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.85} style={{ marginTop: spacing.md }}>
          <GlassCard style={styles.contactCard} glowColor={colors.secondary}>
            <View style={styles.contactRow}>
              <LinearGradient colors={colors.gradient.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.contactIcon}>
                <Ionicons name="headset" size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.contactTitle}>Need more help?</Text>
                <Text style={styles.contactDesc}>Our support team typically responds within 2 hours</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                <Text style={styles.contactBtnText}>Live Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
                <Ionicons name="mail" size={16} color={colors.primary} />
                <Text style={styles.contactBtnText}>Email Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_PREVIEW.map((faq, index) => (
            <Animated.View key={index} entering={FadeInUp.delay(200 + index * 80).springify().damping(16)}>
              <BlurView intensity={45} tint="light" style={styles.faqCard}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqA}>{faq.a}</Text>
              </BlurView>
            </Animated.View>
          ))}
          <TouchableOpacity style={styles.viewAllFaq} activeOpacity={0.7}>
            <Text style={styles.viewAllFaqText}>View all FAQs</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl, height: 48, marginBottom: spacing.lg, gap: spacing.sm,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  topicCard: {
    padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden',
    minHeight: 120, justifyContent: 'center',
  },
  topicIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  topicTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  topicDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 15, marginTop: 2 },
  contactCard: { padding: spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  contactTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  contactDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, backgroundColor: colors.primaryBg, borderRadius: borderRadius.md,
  },
  contactBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  faqCard: { padding: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.sm },
  faqQ: { fontSize: 14, fontWeight: '600', color: colors.text },
  faqA: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.xs },
  viewAllFaq: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: spacing.md,
  },
  viewAllFaqText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
