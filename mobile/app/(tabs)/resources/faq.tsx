import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';

type FAQCategory = 'All' | 'Account' | 'Features' | 'Billing' | 'Troubleshooting';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

const FAQ_ITEMS: FAQItem[] = [
  { id: '1', question: 'How do I create an account?', answer: 'Download the app and tap "Sign Up". You can register with your email or Google account. Fill in your basic details and you\'re ready to start your job search journey.', category: 'Account' },
  { id: '2', question: 'Can I delete my account?', answer: 'Yes, go to Profile > Settings > Account > Delete Account. This permanently removes all your data. You have 30 days to reactivate before complete deletion.', category: 'Account' },
  { id: '3', question: 'How do I reset my password?', answer: 'On the login screen, tap "Forgot Password". Enter your registered email and you\'ll receive a reset link. The link expires in 1 hour for security.', category: 'Account' },
  { id: '4', question: 'How does the resume parser work?', answer: 'Upload your resume as PDF or DOCX. Our AI extracts key information including skills, experience, education, and projects. It then analyzes ATS compatibility and provides a score.', category: 'Features' },
  { id: '5', question: 'What is the AI match score?', answer: 'The match score shows how well your profile aligns with a job description. It considers skills, experience, education, and keywords. Scores above 80% indicate strong alignment.', category: 'Features' },
  { id: '6', question: 'How do I generate a cover letter?', answer: 'Go to the Cover Letter tool, paste the job description, select your tone (professional, casual, or enthusiastic), and click Generate. Our AI creates a tailored cover letter in seconds.', category: 'Features' },
  { id: '7', question: 'Can I save job searches?', answer: 'Yes, you can save filters and searches. Tap the bookmark icon on search results to save individual jobs. Saved jobs appear in your profile under "Saved Jobs".', category: 'Features' },
  { id: '8', question: 'How do mock interviews work?', answer: 'Select a job description or role, and our AI generates relevant interview questions. Answer via text or voice, and receive feedback on your responses with improvement suggestions.', category: 'Features' },
  { id: '9', question: 'What subscription plans are available?', answer: 'We offer Free, Pro, and Team plans. Free includes basic features with daily usage limits. Pro unlocks unlimited AI generations and advanced analytics. Team includes collaboration tools.', category: 'Billing' },
  { id: '10', question: 'Can I upgrade or downgrade my plan?', answer: 'Yes, you can change your plan anytime from Settings > Subscription. Upgrades take effect immediately. Downgrades apply at the start of your next billing cycle.', category: 'Billing' },
  { id: '11', question: 'How do I cancel my subscription?', answer: 'Go to Settings > Subscription > Cancel. Your access continues until the current billing period ends. No partial refunds are provided for early cancellation.', category: 'Billing' },
  { id: '12', question: 'Is there a free trial?', answer: 'Yes, new users get a 7-day free trial of Pro features. No credit card is required. After the trial, you automatically revert to the Free plan unless you subscribe.', category: 'Billing' },
  { id: '13', question: 'The app is not loading properly', answer: 'Try these steps: 1) Check your internet connection. 2) Force close and restart the app. 3) Clear the app cache. 4) Update to the latest version. 5) Restart your device.', category: 'Troubleshooting' },
  { id: '14', question: 'My resume is not parsing correctly', answer: 'Ensure your resume is in PDF or DOCX format. Avoid tables, columns, or complex formatting. Try a simpler layout if parsing fails. Contact support if issues persist.', category: 'Troubleshooting' },
  { id: '15', question: 'I\'m not receiving notifications', answer: 'Check your device notification settings for the app. Ensure notifications are enabled in the app under Settings > Notifications. On iOS, check Focus/DND mode is off.', category: 'Troubleshooting' },
  { id: '16', question: 'How do I export my data?', answer: 'Go to Settings > Privacy > Export Data. You will receive a download link via email within 24 hours containing all your profile data, resumes, and documents.', category: 'Account' },
  { id: '17', question: 'Can I use the app offline?', answer: 'Some features like viewing saved jobs and downloaded resumes work offline. AI features, job search, and real-time updates require an internet connection.', category: 'Features' },
  { id: '18', question: 'What payment methods are accepted?', answer: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and Apple Pay. For team plans, we also support invoicing for annual subscriptions.', category: 'Billing' },
];

const CATEGORIES: FAQCategory[] = ['All', 'Account', 'Features', 'Billing', 'Troubleshooting'];

const CATEGORY_GRADIENTS: Record<FAQCategory, readonly [string, string]> = {
  All: colors.gradient.primary,
  Account: colors.gradient.blue,
  Features: colors.gradient.purple,
  Billing: colors.gradient.teal,
  Troubleshooting: colors.gradient.coral,
};

function AccordionItem({ item, index }: { item: FAQItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);
  const rotate = useSharedValue(0);

  const toggleExpand = () => {
    if (expanded) {
      height.value = withTiming(0, { duration: 250 });
      rotate.value = withTiming(0, { duration: 250 });
    } else {
      height.value = withSpring(120, { stiffness: 180, damping: 20 });
      rotate.value = withTiming(1, { duration: 250 });
    }
    setExpanded(!expanded);
  };

  const animatedHeight = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value > 0 ? withTiming(1, { duration: 200 }) : 0,
    overflow: 'hidden',
  }));

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 180}deg` }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(16)}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.85}>
        <BlurView intensity={45} tint="light" style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <LinearGradient colors={CATEGORY_GRADIENTS[item.category]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.faqDot} />
              <Text style={styles.faqQuestion}>{item.question}</Text>
            </View>
            <Animated.View style={animatedIcon}>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </Animated.View>
          </View>
          <Animated.View style={animatedHeight}>
            <View style={styles.faqAnswer}>
              <View style={styles.faqDivider} />
              <Text style={styles.faqAnswerText}>{item.answer}</Text>
              <View style={styles.faqCategoryTag}>
                <Badge label={item.category} variant={item.category === 'Account' ? 'primary' : item.category === 'Features' ? 'info' : item.category === 'Billing' ? 'warning' : 'error'} size="sm" />
              </View>
            </View>
          </Animated.View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('All');

  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (search && !item.question.toLowerCase().includes(search.toLowerCase()) && !item.answer.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, selectedCategory]);

  const counts = useMemo(() => ({
    all: FAQ_ITEMS.length,
    account: FAQ_ITEMS.filter(i => i.category === 'Account').length,
    features: FAQ_ITEMS.filter(i => i.category === 'Features').length,
    billing: FAQ_ITEMS.filter(i => i.category === 'Billing').length,
    troubleshooting: FAQ_ITEMS.filter(i => i.category === 'Troubleshooting').length,
  }), []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>Find answers to common questions</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <BlurView intensity={60} tint="light" style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQ..."
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} activeOpacity={0.7}>
                <BlurView intensity={selectedCategory === cat ? 70 : 40} tint="light" style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
                  <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                    {cat} ({cat === 'All' ? counts.all : counts[cat.toLowerCase() as keyof typeof counts]})
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          {filteredFAQs.map((faq, index) => (
            <AccordionItem key={faq.id} item={faq} index={index} />
          ))}
        </View>

        {filteredFAQs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No questions found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search or category filter</Text>
          </View>
        )}

        <GlassCard style={styles.supportCard} glowColor={colors.secondary}>
          <View style={styles.supportRow}>
            <LinearGradient colors={colors.gradient.purple} style={styles.supportIcon}>
              <Ionicons name="headset" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.supportTitle}>Still have questions?</Text>
              <Text style={styles.supportDesc}>Our support team is ready to help</Text>
            </View>
            <TouchableOpacity style={styles.supportBtn} activeOpacity={0.7}>
              <Text style={styles.supportBtnText}>Contact</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </GlassCard>
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
    borderRadius: borderRadius.xl, height: 48, marginBottom: spacing.xs, gap: spacing.sm,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: borderRadius.full, overflow: 'hidden' },
  catChipActive: { backgroundColor: colors.primaryBg },
  catChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: '600' },
  faqCard: { borderRadius: borderRadius.xl, overflow: 'hidden', ...shadow.sm },
  faqHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  faqDot: { width: 10, height: 10, borderRadius: 5 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, lineHeight: 18 },
  faqAnswer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  faqDivider: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.sm },
  faqAnswerText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  faqCategoryTag: { marginTop: spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textMuted },
  supportCard: { padding: spacing.md, marginTop: spacing.lg },
  supportRow: { flexDirection: 'row', alignItems: 'center' },
  supportIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  supportTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  supportDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  supportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  supportBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
