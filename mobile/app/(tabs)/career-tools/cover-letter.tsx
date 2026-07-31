import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { GradientCard, FeatureList, PrimaryButton, LoadingState } from '../../../components/career-tools/shared';
import { ScreenHeader } from '../../../components/career-tools';
import { CoverLetterIllus } from '../../../components/career-tools/illustrations';

const HERO_GRADIENT = colors.tool.coverLetter;

const HERO_FEATURES = [
  { icon: 'checkmark-circle', text: 'Personalized' },
  { icon: 'sparkles', text: 'AI Writing' },
  { icon: 'create', text: 'Editable' },
];

export default function CoverLetterScreen() {
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!jobRole.trim() || !company.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 2000);
  }, [jobRole, company]);

  const AnimatedInput = ({ label, value, onChange, placeholder, multiline, icon }: {
    label: string; value: string; onChange: (t: string) => void; placeholder?: string; multiline?: boolean; icon: string;
  }) => {
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.inputWrap}>
          <Ionicons name={icon as any} size={16} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline={multiline}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScreenHeader title="Cover Letter" subtitle="Generate personalized cover letters" icon="document-text" iconColors={HERO_GRADIENT} />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
            <GradientCard
              colors={HERO_GRADIENT}
              illustration={<CoverLetterIllus />}
              title="Create a cover letter that gets you noticed"
            >
              <FeatureList items={HERO_FEATURES} />
            </GradientCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={styles.formCard}>
            <BlurView intensity={40} tint="light" style={styles.formInner}>
              <AnimatedInput label="Job Role" value={jobRole} onChange={setJobRole} placeholder="e.g. Software Engineer" icon="briefcase-outline" />
              <AnimatedInput label="Company Name" value={company} onChange={setCompany} placeholder="e.g. Google" icon="business-outline" />
              <AnimatedInput label="Key Skills (comma separated)" value={skills} onChange={setSkills} placeholder="e.g. React, TypeScript, Node.js" multiline icon="sparkles-outline" />

              <PrimaryButton
                title={loading ? 'Generating...' : 'Generate Cover Letter'}
                icon={loading ? 'hourglass-outline' : 'sparkles'}
                onPress={handleGenerate}
                gradient={HERO_GRADIENT}
                disabled={loading || !jobRole.trim() || !company.trim()}
                style={{ marginTop: spacing.md }}
              />

              {loading && (
                <Animated.View entering={FadeInUp.springify()} style={{ marginTop: spacing.md }}>
                  <LoadingState count={2} />
                </Animated.View>
              )}

              {generated && !loading && (
                <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.successCard}>
                  <LinearGradient colors={HERO_GRADIENT} style={styles.successInner}>
                    <Ionicons name="checkmark-circle" size={40} color="#FFF" />
                    <Text style={styles.successTitle}>Cover Letter Generated!</Text>
                    <Text style={styles.successSub}>Your AI-powered cover letter is ready for review</Text>
                    <TouchableOpacity style={styles.viewBtn} onPress={() => router.push('/generate/cover-letter' as any)}>
                      <Text style={styles.viewBtnText}>View & Edit</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </Animated.View>
              )}
            </BlurView>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.xl, paddingTop: spacing.md },
  formCard: { marginTop: spacing.lg, marginBottom: spacing.xl },
  formInner: { borderRadius: borderRadius.xl, padding: spacing.lg, overflow: 'hidden', ...shadow.lg },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: spacing.sm + 4, fontSize: 15, color: colors.text, minHeight: 48 },
  successCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginTop: spacing.md },
  successInner: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  successTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  successSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
  viewBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)' },
  viewBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
