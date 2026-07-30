import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming,
  useAnimatedStyle, interpolate, Extrapolation, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { resumeApi } from '../../lib/api';
import { formatDate } from '../../lib/helpers';

const TARGET_ROLES = [
  'Frontend', 'Backend', 'Full Stack', 'AI/ML',
  'DevOps', 'Data Engineer', 'Cloud Engineer', 'Cyber Security',
  'Product Manager', 'Custom',
];

const OPTIMIZATION_OPTIONS = [
  { key: 'ats', label: 'ATS Optimization', icon: 'document-text', desc: 'Optimize for Applicant Tracking Systems' },
  { key: 'keywords', label: 'Keyword Matching', icon: 'search', desc: 'Match keywords from job description' },
  { key: 'recruiter', label: 'Recruiter Friendly', icon: 'people', desc: 'Format for recruiter scanning' },
  { key: 'remote', label: 'Remote Jobs', icon: 'wifi', desc: 'Highlight remote-ready skills' },
  { key: 'senior', label: 'Senior Level', icon: 'trending-up', desc: 'Emphasize leadership experience' },
  { key: 'startup', label: 'Startup Focus', icon: 'rocket', desc: 'Showcase versatility & impact' },
  { key: 'faang', label: 'FAANG Focus', icon: 'star', desc: 'Align with big-tech expectations' },
  { key: 'international', label: 'International Jobs', icon: 'globe', desc: 'Global-friendly format' },
  { key: 'government', label: 'Government Jobs', icon: 'shield', desc: 'Government/Clearance format' },
];

export default function ResumeVersionScreen() {
  const { resumeId } = useLocalSearchParams<{ resumeId: string }>();
  const insets = useSafeAreaInsets();

  const [resume, setResume] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetRole, setTargetRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [versionName, setVersionName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/resume');
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!resumeId) return;
    try {
      const [resumeRes, versionsRes] = await Promise.allSettled([
        resumeApi.get(resumeId),
        resumeApi.getVersions(resumeId),
      ]);
      if (!mountedRef.current) return;
      if (resumeRes.status === 'fulfilled') setResume(resumeRes.value.data.data || resumeRes.value.data);
      if (versionsRes.status === 'fulfilled') setVersions(versionsRes.value.data.data || versionsRes.value.data || []);
      setError(null);
    } catch {
      if (mountedRef.current) setError('Failed to load resume data');
    } finally {
      if (mountedRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [resumeId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const handleCreate = async () => {
    const role = targetRole === 'Custom' ? customRole : targetRole;
    if (!role) { Alert.alert('Required', 'Select a target role'); return; }
    const name = versionName.trim() || `${role} Resume ${new Date().toLocaleDateString()}`;
    if (!resumeId) return;

    setCreating(true);
    try {
      const payload: any = { title: name, target_role: role };
      if (jobDescription.trim()) payload.job_description = jobDescription.trim();
      if (selectedOptions.length > 0) payload.optimizations = selectedOptions;

      const res = await resumeApi.createVersion(resumeId, payload);
      const newVersion = res.data.data || res.data;
      setVersions((prev) => [newVersion, ...prev]);
      setVersionName('');
      setJobDescription('');
      setSelectedOptions([]);
      Alert.alert('Success', `"${name}" created successfully`);
    } catch {
      Alert.alert('Error', 'Failed to create version. Check your connection.');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (versionId: string) => {
    try {
      const res = await resumeApi.exportPdf(versionId);
      const blob = res.data;
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-v${versionId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      Alert.alert('Error', 'Download failed');
    }
  };

  const toggleOption = (key: string) => {
    setSelectedOptions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const atsScore = resume?.ats_score ?? 0;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.skeletonContent}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.skeletonBlock, { height: i === 1 ? 80 : i === 2 ? 120 : i === 3 ? 60 : 160 }]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Animated.Text entering={FadeInDown.delay(50).springify().damping(14)} style={styles.title}>
              AI Resume Builder
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(100).springify().damping(14)} style={styles.subtitle}>
              Optimize your resume for any role
            </Animated.Text>
          </View>
        </View>

        {error && (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.errorCard}>
              <Ionicons name="cloud-offline-outline" size={24} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>
        )}

        {!error && resume && (
          <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
            <GlassCard style={styles.resumePreviewCard} glowColor={colors.primary}>
              <View style={styles.previewRow}>
                <LinearGradient colors={colors.gradient.primary} style={styles.previewIcon}>
                  <Ionicons name="document-text" size={24} color="#FFF" />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.previewName}>{resume.original_filename || resume.name || 'Resume'}</Text>
                  <Text style={styles.previewDate}>Updated {formatDate(resume.created_at || resume.updated_at || new Date().toISOString())}</Text>
                  <View style={styles.previewBadgeRow}>
                    <Badge label={`${atsScore}% ATS`} variant={atsScore >= 80 ? 'success' : atsScore >= 60 ? 'warning' : 'error'} size="sm" />
                    <Badge label={`${versions.length} versions`} variant="default" size="sm" />
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Target Role</Text>
          <View style={styles.chipGrid}>
            {TARGET_ROLES.map((role, index) => (
              <Animated.View key={role} entering={FadeInUp.delay(220 + index * 30).springify().damping(14)}>
                <TouchableOpacity
                  style={[styles.chip, targetRole === role && styles.chipActive]}
                  onPress={() => { setTargetRole(role); if (role !== 'Custom') setCustomRole(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, targetRole === role && styles.chipTextActive]}>{role}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          {targetRole === 'Custom' && (
            <Animated.View entering={FadeInDown.springify().damping(14)}>
              <View style={styles.customInputWrap}>
                <TextInput
                  style={styles.customInput}
                  value={customRole}
                  onChangeText={setCustomRole}
                  placeholder="Enter custom role..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Version Name</Text>
          <View style={styles.floatingInputWrap}>
            <Text style={[styles.floatingLabel, versionName ? styles.floatingLabelUp : null]}>Name this version</Text>
            <TextInput
              style={styles.floatingInput}
              value={versionName}
              onChangeText={setVersionName}
              placeholder={targetRole ? `e.g. ${targetRole} Apply V1` : 'e.g. Google Apply V1'}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).springify().damping(14)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Optimization</Text>
            {selectedOptions.length > 0 && (
              <Badge label={`${selectedOptions.length}`} variant="primary" size="sm" animated />
            )}
          </View>
          <View style={styles.optionGrid}>
            {OPTIMIZATION_OPTIONS.map((opt, index) => (
              <Animated.View key={opt.key} entering={FadeInUp.delay(370 + index * 30).springify().damping(14)}>
                <TouchableOpacity
                  style={[styles.optionCard, selectedOptions.includes(opt.key) && styles.optionCardActive]}
                  onPress={() => toggleOption(opt.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionCheck, selectedOptions.includes(opt.key) && styles.optionCheckActive]}>
                    {selectedOptions.includes(opt.key) && <Ionicons name="checkmark" size={12} color="#FFF" />}
                  </View>
                  <Ionicons name={opt.icon as any} size={18} color={selectedOptions.includes(opt.key) ? colors.primary : colors.textMuted} />
                  <View style={{ flex: 1, marginLeft: spacing.xs }}>
                    <Text style={[styles.optionLabel, selectedOptions.includes(opt.key) && styles.optionLabelActive]}>{opt.label}</Text>
                    <Text style={styles.optionDesc} numberOfLines={1}>{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <View style={styles.jdInputWrap}>
            <TextInput
              style={styles.jdInput}
              value={jobDescription}
              onChangeText={setJobDescription}
              placeholder="Paste job description here... AI will extract keywords and optimize your resume."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={creating}
            activeOpacity={0.8}
            style={styles.generateBtn}
          >
            <LinearGradient
              colors={creating ? ['#9CA3AF', '#6B7280'] : colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGrad}
            >
              {creating ? (
                <Loader message="AI is optimizing..." />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFF" />
                  <Text style={styles.generateText}>Generate Optimized Resume</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {versions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(550).springify().damping(14)} style={styles.versionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Version History</Text>
              <Badge label={`${versions.length} total`} variant="default" size="sm" />
            </View>
            {versions.map((v, index) => (
              <Animated.View key={v.id || index} entering={FadeInUp.delay(570 + index * 40).springify().damping(14)}>
                <Card style={styles.versionCard} glowColor={colors.primary}>
                  <View style={styles.versionRow}>
                    <LinearGradient colors={colors.gradient.blue} style={styles.versionIcon}>
                      <Ionicons name="document-text" size={18} color="#FFF" />
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.versionName}>{v.title || 'Unnamed'}</Text>
                      <Text style={styles.versionRole}>{v.target_role || ''}</Text>
                      <Text style={styles.versionDate}>{v.created_at ? formatDate(v.created_at) : ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDownload(v.id)} style={styles.versionAction}>
                      <Ionicons name="download-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  skeletonContent: { padding: spacing.md, gap: spacing.md },
  skeletonBlock: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.xl, opacity: 0.5 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  errorCard: { padding: spacing.md, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: 14, textAlign: 'center' },
  retryBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.md },
  retryText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  resumePreviewCard: { padding: spacing.md, marginBottom: spacing.lg },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  previewName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  previewDate: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  previewBadgeRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  chipActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '600' },

  customInputWrap: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  customInput: { paddingHorizontal: spacing.md, height: 48, color: colors.text, fontSize: 14 },

  floatingInputWrap: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, paddingTop: 6 },
  floatingLabel: { position: 'absolute', left: spacing.md, top: 14, color: colors.textMuted, fontSize: 14 },
  floatingLabelUp: { top: 6, fontSize: 11, color: colors.primary },
  floatingInput: { paddingHorizontal: spacing.md, paddingTop: 18, paddingBottom: 10, color: colors.text, fontSize: 15 },

  optionGrid: { gap: spacing.xs, marginBottom: spacing.lg },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  optionCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  optionCheckActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionLabel: { color: colors.text, fontSize: 14, fontWeight: '500' },
  optionLabelActive: { color: colors.primary },
  optionDesc: { color: colors.textMuted, fontSize: 11, marginTop: 1 },

  jdInputWrap: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  jdInput: { padding: spacing.md, color: colors.text, fontSize: 14, minHeight: 140 },

  generateBtn: { borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.lg, ...shadow.glow.primary },
  generateGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  generateText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  versionsSection: { marginTop: spacing.sm },
  versionCard: { marginBottom: spacing.sm },
  versionRow: { flexDirection: 'row', alignItems: 'center' },
  versionIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  versionName: { color: colors.text, fontSize: 15, fontWeight: '500' },
  versionRole: { color: colors.textSecondary, fontSize: 12 },
  versionDate: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  versionAction: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center' },
});
