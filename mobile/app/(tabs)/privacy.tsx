import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';

export default function PrivacyScreen() {
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
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.updated}>Last updated: July 2026</Text>
        </Animated.View>

        {[
          { title: 'Information We Collect', content: 'We collect information you provide directly, including name, email, resume data, and usage information. We also automatically collect device information and browsing activity.' },
          { title: 'How We Use Your Information', content: 'Your information is used to provide job matching, AI-powered career tools, improve our services, and communicate with you about relevant opportunities.' },
          { title: 'Data Sharing', content: 'We do not sell your personal data. We may share anonymized data with partners for job matching purposes. Your resume is only shared with companies you choose to apply to.' },
          { title: 'Data Security', content: 'We implement industry-standard encryption and security measures to protect your data. All data is encrypted in transit and at rest.' },
          { title: 'Your Rights', content: 'You can access, modify, or delete your data at any time from your account settings. You can also download a copy of your data.' },
          { title: 'Cookies', content: 'We use essential cookies for authentication and analytics cookies to improve your experience. You can manage cookie preferences in your browser settings.' },
          { title: 'Contact Us', content: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@jobpilot.ai.' },
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
