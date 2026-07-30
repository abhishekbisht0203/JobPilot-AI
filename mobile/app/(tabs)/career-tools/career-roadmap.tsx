import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { aiApi } from '../../../lib/api';
import { SkillGapAnalysis } from '../../../types';

const STEP_ICONS = ['flag', 'book', 'analytics', 'school', 'trending-up'] as const;

const ROLE_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Engineer',
  'Data Scientist', 'DevOps Engineer', 'Product Manager',
];

export default function CareerRoadmapScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [targetRole, setTargetRole] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!targetRole.trim() || !skillsInput.trim()) return;
    setLoading(true);
    try {
      const currentSkills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const res = await aiApi.skillGap({ target_role: targetRole.trim(), current_skills: currentSkills });
      setAnalysis(res.data.data || res.data);
      setAnalyzed(true);
    } catch {} finally {
      setLoading(false);
    }
  }, [targetRole, skillsInput]);

  const handleReset = () => {
    setAnalysis(null);
    setAnalyzed(false);
    setTargetRole('');
    setSkillsInput('');
  };

  const missingSkills = analysis?.missing_skills || [];
  const recommendations = analysis?.recommendations || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Career Roadmap</Text>
          <Text style={styles.subtitle}>Discover skills and steps for your dream role</Text>
        </Animated.View>

        {!analyzed ? (
          <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
            <GlassCard style={styles.formCard} glowColor={colors.secondary}>
              <Text style={styles.formTitle}>What's your target role?</Text>

              <Text style={styles.inputLabel}>Target Role</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Full Stack Developer"
                  placeholderTextColor={colors.textMuted}
                  value={targetRole}
                  onChangeText={setTargetRole}
                />
              </View>

              <View style={styles.suggestionRow}>
                {ROLE_SUGGESTIONS.slice(0, 3).map(role => (
                  <TouchableOpacity key={role} onPress={() => setTargetRole(role)}>
                    <Badge label={role} variant="default" size="sm" />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: spacing.md }]}>Your Current Skills</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="code-slash-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="React, TypeScript, Node.js"
                  placeholderTextColor={colors.textMuted}
                  value={skillsInput}
                  onChangeText={setSkillsInput}
                />
              </View>

              <TouchableOpacity
                onPress={handleAnalyze}
                disabled={loading || !targetRole.trim() || !skillsInput.trim()}
                activeOpacity={0.8}
                style={[styles.analyzeBtn, (!targetRole.trim() || !skillsInput.trim()) && styles.analyzeBtnDisabled]}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.analyzeGradient}
                >
                  <Ionicons name={loading ? 'hourglass-outline' : 'trending-up'} size={18} color="#FFFFFF" />
                  <Text style={styles.analyzeText}>{loading ? 'Analyzing...' : 'Analyze Skills'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>
        ) : (
          <>
            {analysis && (
              <>
                <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
                  <GlassCard style={styles.resultHeader} glowColor={colors.success}>
                    <View style={styles.resultHeaderRow}>
                      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.roleIcon}>
                        <Ionicons name="briefcase" size={22} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={styles.resultRole}>{analysis.target_role}</Text>
                        <Text style={styles.resultSub}>
                          {missingSkills.length} skills to acquire
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>

                <Text style={styles.sectionTitle}>
                  <Ionicons name="layers-outline" size={16} color={colors.text} /> Skills to Develop
                </Text>
                {missingSkills.length > 0 ? (
                  <View style={styles.skillsGrid}>
                    {missingSkills.map((skill, index) => (
                      <Animated.View key={index} entering={FadeInDown.delay(200 + index * 40).springify().damping(14)}>
                        <BlurView intensity={40} tint="light" style={styles.skillCard}>
                          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.skillBadge}>
                            <Ionicons name="add-circle" size={14} color="#FFFFFF" />
                          </LinearGradient>
                          <Text style={styles.skillName}>{skill}</Text>
                        </BlurView>
                      </Animated.View>
                    ))}
                  </View>
                ) : (
                  <GlassCard style={styles.noMissingCard}>
                    <Text style={styles.noMissingText}>You already have all the key skills for this role!</Text>
                  </GlassCard>
                )}

                <Text style={styles.sectionTitle}>
                  <Ionicons name="compass-outline" size={16} color={colors.text} /> Recommended Steps
                </Text>
                {recommendations.map((rec, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(250 + index * 60).springify().damping(14)}>
                    <GlassCard style={styles.roadmapStep} glowColor={colors.secondary}>
                      <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.stepCircle}>
                            <Text style={styles.stepNumText}>{index + 1}</Text>
                          </LinearGradient>
                          {index < recommendations.length - 1 && <View style={styles.stepLine} />}
                        </View>
                        <View style={styles.stepContent}>
                          <Text style={styles.stepText}>{rec}</Text>
                        </View>
                      </View>
                    </GlassCard>
                  </Animated.View>
                ))}
              </>
            )}

            <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={styles.resetText}>Start Over</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() },
  header: { paddingBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  formCard: { marginBottom: spacing.md },
  formTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.text },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  analyzeBtn: { marginTop: spacing.md },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm, ...shadow.glow.purple },
  analyzeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resultHeader: { marginBottom: spacing.md },
  resultHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  roleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  resultRole: { fontSize: 18, fontWeight: '700', color: colors.text },
  resultSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden', gap: spacing.xs },
  skillBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  skillName: { fontSize: 13, fontWeight: '500', color: colors.text },
  noMissingCard: { padding: spacing.md, marginBottom: spacing.md },
  noMissingText: { fontSize: 14, color: colors.success, fontWeight: '500', textAlign: 'center' },
  roadmapStep: { marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row' },
  stepNumber: { alignItems: 'center', width: 36, marginRight: spacing.sm },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.borderLight, marginTop: 4 },
  stepContent: { flex: 1, paddingBottom: spacing.md },
  stepText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md, marginTop: spacing.md },
  resetText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
