import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';

export default function TermsScreen() {
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
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.updated}>Last updated: July 2026</Text>
        </Animated.View>

        {[
          { title: 'Acceptance of Terms', content: 'By using JobPilot AI, you agree to these terms. If you do not agree, please do not use our services.' },
          { title: 'Account Registration', content: 'You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials.' },
          { title: 'Usage Limits', content: 'Free accounts have daily usage limits. Pro and Team plans have higher or unlimited usage depending on the plan.' },
          { title: 'AI-Generated Content', content: 'AI-generated content is provided as a starting point. You are responsible for reviewing and customizing generated content before use.' },
          { title: 'Prohibited Activities', content: 'You may not use our services for spam, fraudulent activities, or any purpose that violates applicable laws.' },
          { title: 'Subscription & Billing', content: 'Subscriptions auto-renew unless cancelled. Refunds are handled on a case-by-case basis within 14 days of purchase.' },
          { title: 'Limitation of Liability', content: 'JobPilot AI is not responsible for any damages arising from the use of our services, including but not limited to lost job opportunities.' },
          { title: 'Changes to Terms', content: 'We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.' },
        ].map((section, index) => (
          <Animated.View key={section.title} entering={FadeInDown.delay(100 + index * 50).springify().damping(16)} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  updated: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  sectionContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
