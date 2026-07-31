import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, Alert, Share, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming,
  useAnimatedStyle, interpolate, Extrapolation, Easing,
} from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlobalHeader } from '../../components/GlobalHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { resumeApi } from '../../lib/api';
import { formatDate } from '../../lib/helpers';
import {
  ToolHeader, GradientButton, SectionHeader, AnimatedScoreRing,
  InfoCard, TabBar, EmptyToolState,
} from '../../components/career-tools';
import {
  GradientCard, FeatureList, PrimaryButton,
} from '../../components/career-tools/shared';
import { ResumeBuilderIllus } from '../../components/career-tools/illustrations';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', color: '#0A66C2' },
  { id: 'professional', name: 'Professional', color: '#1f2937' },
  { id: 'minimal', name: 'Minimal', color: '#6b7280' },
  { id: 'executive', name: 'Executive', color: '#1e3a5f' },
  { id: 'creative', name: 'Creative', color: '#7c3aed' },
  { id: 'ats-friendly', name: 'ATS Friendly', color: '#059669' },
];

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

const SECTION_ICONS: Record<string, string> = {
  personal: 'person',
  social: 'link',
  education: 'school',
  experience: 'briefcase',
  projects: 'code-slash',
  certifications: 'ribbon',
  skills: 'options',
  languages: 'language',
  achievements: 'star',
};

const HERO_GRADIENT = ['#7C3AED', '#4F46E5'] as const;

const HERO_FEATURES = [
  { icon: 'sparkles', text: 'AI Content' },
  { icon: 'shield-checkmark', text: 'ATS Templates' },
  { icon: 'download', text: 'Download PDF' },
];

const emptyForm = {
  template: 'modern',
  fullName: '', email: '', phone: '', location: '', headline: '', summary: '',
  website: '', linkedin: '', github: '',
  education: [] as any[],
  experience: [] as any[],
  projects: [] as any[],
  certifications: [] as any[],
  skills: [] as string[],
  languages: [] as string[],
  achievements: [] as string[],
};

function TagInput({ tags, onChange, placeholder }: {
  tags: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [val, setVal] = useState('');
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal('');
  };
  return (
    <View>
      <View style={tagStyles.row}>
        {tags.map((t, i) => (
          <View key={i} style={tagStyles.chip}>
            <Text style={tagStyles.chipText}>{t}</Text>
            <TouchableOpacity onPress={() => onChange(tags.filter((_, j) => j !== i))}>
              <Ionicons name="close-circle" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={tagStyles.inputRow}>
        <TextInput
          style={tagStyles.input}
          value={val}
          onChangeText={setVal}
          onSubmitEditing={add}
          placeholder={placeholder || 'Add...'}
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={add} style={tagStyles.addBtn}>
          <Ionicons name="add" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full, backgroundColor: colors.primary + '12',
  },
  chipText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  inputRow: { flexDirection: 'row', gap: spacing.xs },
  input: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md, height: 42, color: colors.text, fontSize: 14,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  addBtn: {
    width: 42, height: 42, borderRadius: borderRadius.lg,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    ...shadow.sm,
  },
});

function CollapsibleSection({ title, icon, children, defaultOpen = false }: {
  title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={cs.section}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={cs.header} activeOpacity={0.7}>
        <View style={cs.headerLeft}>
          <View style={cs.iconWrap}>
            <Ionicons name={icon as any} size={16} color={colors.primary} />
          </View>
          <Text style={cs.title}>{title}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {open && <View style={cs.body}>{children}</View>}
    </View>
  );
}

const cs = StyleSheet.create({
  section: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.sm,
    overflow: 'hidden', ...shadow.sm,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
});

function FormInput({ label, value, onChangeText, placeholder, multiline, keyboardType }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: any;
}) {
  return (
    <View>
      <Text style={fi.label}>{label}</Text>
      <TextInput
        style={[fi.input, multiline && fi.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : undefined}
      />
    </View>
  );
}

const fi = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md, height: 46, color: colors.text, fontSize: 14,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  multiline: { height: 80, paddingTop: spacing.sm },
});

function ArraySection({ items, fields, onChange, onAdd, onRemove, addLabel, fieldLabels }: {
  items: any[]; fields: string[]; onChange: (index: number, field: string, value: any) => void;
  onAdd: () => void; onRemove: (index: number) => void;
  addLabel: string; fieldLabels: Record<string, string>;
}) {
  return (
    <View>
      <TouchableOpacity onPress={onAdd} style={ar.addRow}>
        <Ionicons name="add-circle" size={18} color={colors.primary} />
        <Text style={ar.addText}>{addLabel}</Text>
      </TouchableOpacity>
      {items.length === 0 && <Text style={ar.empty}>No entries added.</Text>}
      {items.map((item, i) => (
        <View key={i} style={ar.item}>
          <TouchableOpacity onPress={() => onRemove(i)} style={ar.removeBtn}>
            <Ionicons name="close-circle" size={18} color={colors.error} />
          </TouchableOpacity>
          {fields.map((f) => (
            <FormInput
              key={f}
              label={fieldLabels[f] || f}
              value={item[f] || ''}
              onChangeText={(t) => onChange(i, f, t)}
              placeholder={fieldLabels[f] || f}
              multiline={f === 'description'}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const ar = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  addText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  empty: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  item: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.sm, position: 'relative',
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  removeBtn: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1 },
});

function buildResumeText(data: any): string {
  const parts: string[] = [];
  if (data.fullName) parts.push(data.fullName);
  if (data.headline) parts.push(data.headline);
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(' | ');
  if (contact) parts.push(contact);
  if (data.website) parts.push(`Website: ${data.website}`);
  if (data.linkedin) parts.push(`LinkedIn: ${data.linkedin}`);
  if (data.github) parts.push(`GitHub: ${data.github}`);
  parts.push('');
  if (data.summary) parts.push(`PROFESSIONAL SUMMARY\n${data.summary}\n`);
  if (data.experience?.length > 0) {
    parts.push('EXPERIENCE');
    data.experience.forEach((exp: any) => {
      parts.push(`${exp.title || ''} at ${exp.company || ''}`);
      if (exp.description) parts.push(exp.description);
      parts.push('');
    });
  }
  if (data.education?.length > 0) {
    parts.push('EDUCATION');
    data.education.forEach((edu: any) => {
      parts.push(`${edu.degree || ''} in ${edu.field || ''} - ${edu.institution || ''}`);
      parts.push('');
    });
  }
  if (data.projects?.length > 0) {
    parts.push('PROJECTS');
    data.projects.forEach((proj: any) => {
      parts.push(`${proj.name || ''}: ${proj.description || ''}`);
      if (proj.technologies?.length) parts.push(`Tech: ${proj.technologies.join(', ')}`);
      parts.push('');
    });
  }
  if (data.skills?.length > 0) parts.push(`SKILLS\n${data.skills.join(' • ')}\n`);
  if (data.certifications?.length > 0) {
    parts.push('CERTIFICATIONS');
    data.certifications.forEach((cert: any) => {
      parts.push(`${cert.name || ''} - ${cert.issuer || ''}`);
    });
    parts.push('');
  }
  if (data.languages?.length > 0) parts.push(`LANGUAGES\n${data.languages.join(', ')}\n`);
  if (data.achievements?.length > 0) parts.push(`ACHIEVEMENTS\n${data.achievements.join('\n')}\n`);
  return parts.join('\n');
}

export default function ResumeVersionScreen() {
  const { resumeId } = useLocalSearchParams<{ resumeId: string }>();

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

  const [tab, setTab] = useState<'form' | 'preview' | 'suggestions'>('form');
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const mountedRef = useRef(true);
  const saveTimerRef = useRef<any>(null);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/resume');
  }, []);

  const fetchData = useCallback(async () => {
    if (!resumeId) return;
    try {
      const [resumeRes, versionsRes] = await Promise.allSettled([
        resumeApi.get(resumeId),
        resumeApi.getVersions(resumeId),
      ]);
      if (!mountedRef.current) return;
      if (resumeRes.status === 'fulfilled') {
        const resumeData = resumeRes.value.data?.data || resumeRes.value.data;
        setResume(resumeData);
        if (resumeData) {
          setForm((prev) => ({
            ...prev,
            template: resumeData.template || 'modern',
          }));
        }
      }
      if (versionsRes.status === 'fulfilled') {
        const versionsData = Array.isArray(versionsRes.value.data)
          ? versionsRes.value.data
          : versionsRes.value.data?.data || [];
        setVersions(versionsData);
      }
      setError(null);
    } catch {
      if (mountedRef.current) setError('Failed to load resume data');
    } finally {
      if (mountedRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [resumeId]);

  useEffect(() => {
    mountedRef.current = true;
    if (!resumeId) { setLoading(false); setError('No resume selected. Please upload a resume first.'); }
    else fetchData();
    return () => { mountedRef.current = false; };
  }, [resumeId, fetchData]);

  const handleFormChange = useCallback((field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleArrayChange = useCallback((field: string, index: number, key: string, value: any) => {
    setForm((prev) => {
      const arr = [...(prev[field as keyof typeof prev] as any[] || [])];
      if (!arr[index]) return prev;
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  }, []);

  const handleArrayAdd = useCallback((field: string, template: any) => {
    setForm((prev) => ({ ...prev, [field]: [...(prev[field as keyof typeof prev] as any[] || []), { ...template }] }));
  }, []);

  const handleArrayRemove = useCallback((field: string, index: number) => {
    setForm((prev) => ({ ...prev, [field]: (prev[field as keyof typeof prev] as any[] || []).filter((_, i) => i !== index) }));
  }, []);

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
      const newVersion = res.data?.data || res.data;
      setVersions((prev) => [newVersion, ...prev]);
      setSelectedVersion(newVersion);
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

  const handleDownload = async () => {
    try {
      const text = buildResumeText(selectedVersion || form);
      const fileUri = FileSystem.documentDirectory + 'resume.txt';
      await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Share Resume' });
      } else {
        await Share.share({ message: text, title: 'Resume' });
      }
    } catch {
      Alert.alert('Error', 'Failed to share resume');
    }
  };

  const handleLoadSuggestions = async () => {
    if (!resumeId) return;
    setSuggestionsLoading(true);
    try {
      const res = await resumeApi.analyzeAts(resumeId, jobDescription || '');
      const score = res.data?.ats_score || res.data?.data?.ats_score || 0;
      setSuggestions({ ats_score: score });
    } catch {
      setSuggestions(null);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const toggleOption = (key: string) => {
    setSelectedOptions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const atsScore = resume?.ats_score ?? 0;

  const educationFields = ['institution', 'degree', 'field', 'startDate', 'endDate'];
  const experienceFields = ['company', 'title', 'location', 'startDate', 'endDate', 'description'];
  const projectFields = ['name', 'description', 'url'];
  const certFields = ['name', 'issuer', 'date', 'url'];

  if (loading) {
    return (
      <View style={styles.container}>
        <GlobalHeader />
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
      <GlobalHeader />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: spacing.md }]}
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
          {saving && (
            <View style={styles.savingBadge}>
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}
        </View>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(14)} style={styles.heroWrap}>
          <GradientCard colors={HERO_GRADIENT} illustration={<ResumeBuilderIllus />} title="Build a professional resume that passes ATS scanners">
            <Text style={styles.heroSub}>Pick a template, set your target role, and let AI optimize every section for recruiters and ATS systems.</Text>
            <FeatureList items={HERO_FEATURES} />
          </GradientCard>
        </Animated.View>

        {error && (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.errorCard}>
              <Ionicons name="cloud-offline-outline" size={24} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                {!resumeId && (
                  <TouchableOpacity onPress={() => router.push('/(tabs)/resume')} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Go to Resume</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={fetchData} style={[styles.retryBtn, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
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
                  <Text style={styles.previewName}>{resume.original_filename || 'Resume'}</Text>
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

        {/* Template Selector */}
        <Animated.View entering={FadeInDown.delay(170).springify().damping(14)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Template</Text>
            <Badge label="Choose a design" variant="default" size="sm" />
          </View>
          <View style={styles.templateRow}>
            {TEMPLATES.map((t) => {
              const active = form.template === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => handleFormChange('template', t.id)}
                  style={[styles.templateChip, active && styles.templateChipActive]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.templateSwatch, { backgroundColor: t.color }]}>
                    <View style={[styles.templateSwatchLine, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />
                    <View style={[styles.templateSwatchLine, { width: '55%', backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                    <View style={[styles.templateSwatchLine, { width: '70%', backgroundColor: 'rgba(255,255,255,0.25)' }]} />
                  </View>
                  <Text style={[styles.templateText, active && styles.templateTextActive]}>
                    {t.name}
                  </Text>
                  {active && (
                    <View style={styles.templateCheck}>
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Tab Bar */}
        <TabBar
          tabs={[
            { key: 'form', label: 'Editor', icon: 'create' },
            { key: 'preview', label: 'Preview', icon: 'eye' },
            { key: 'suggestions', label: 'ATS Analysis', icon: 'analytics' },
          ]}
          activeTab={tab}
          onTabChange={setTab as any}
        />

        {tab === 'form' && (
          <>
            {/* Target Role */}
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

            {/* Version Name */}
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

            {/* AI Optimization */}
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

            {/* Job Description */}
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

            {/* Full Form Editor */}
            <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Resume Details</Text>

            <CollapsibleSection title="Personal Info" icon="person" defaultOpen>
              <FormInput label="Full Name" value={form.fullName} onChangeText={(t) => handleFormChange('fullName', t)} placeholder="John Doe" />
              <FormInput label="Headline" value={form.headline} onChangeText={(t) => handleFormChange('headline', t)} placeholder="Full Stack Developer" />
              <FormInput label="Email" value={form.email} onChangeText={(t) => handleFormChange('email', t)} placeholder="john@example.com" keyboardType="email-address" />
              <FormInput label="Phone" value={form.phone} onChangeText={(t) => handleFormChange('phone', t)} placeholder="+1 234 567 890" keyboardType="phone-pad" />
              <FormInput label="Location" value={form.location} onChangeText={(t) => handleFormChange('location', t)} placeholder="San Francisco, CA" />
              <FormInput label="Summary" value={form.summary} onChangeText={(t) => handleFormChange('summary', t)} placeholder="Brief professional summary..." multiline />
            </CollapsibleSection>

            <CollapsibleSection title="Social Links" icon="link">
              <FormInput label="Website" value={form.website} onChangeText={(t) => handleFormChange('website', t)} placeholder="https://..." />
              <FormInput label="LinkedIn" value={form.linkedin} onChangeText={(t) => handleFormChange('linkedin', t)} placeholder="https://linkedin.com/in/..." />
              <FormInput label="GitHub" value={form.github} onChangeText={(t) => handleFormChange('github', t)} placeholder="https://github.com/..." />
            </CollapsibleSection>

            <CollapsibleSection title="Education" icon="school">
              <ArraySection
                items={form.education}
                fields={educationFields}
                fieldLabels={{ institution: 'Institution', degree: 'Degree', field: 'Field of Study', startDate: 'Start Date', endDate: 'End Date' }}
                onChange={(i, f, v) => handleArrayChange('education', i, f, v)}
                onAdd={() => handleArrayAdd('education', { institution: '', degree: '', field: '', startDate: '', endDate: '' })}
                onRemove={(i) => handleArrayRemove('education', i)}
                addLabel="Add Education"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Experience" icon="briefcase">
              <ArraySection
                items={form.experience}
                fields={experienceFields}
                fieldLabels={{ company: 'Company', title: 'Job Title', location: 'Location', startDate: 'Start Date', endDate: 'End Date', description: 'Description' }}
                onChange={(i, f, v) => handleArrayChange('experience', i, f, v)}
                onAdd={() => handleArrayAdd('experience', { company: '', title: '', location: '', startDate: '', endDate: '', description: '' })}
                onRemove={(i) => handleArrayRemove('experience', i)}
                addLabel="Add Experience"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Projects" icon="code-slash">
              <ArraySection
                items={form.projects}
                fields={projectFields}
                fieldLabels={{ name: 'Project Name', description: 'Description', url: 'URL' }}
                onChange={(i, f, v) => handleArrayChange('projects', i, f, v)}
                onAdd={() => handleArrayAdd('projects', { name: '', description: '', url: '' })}
                onRemove={(i) => handleArrayRemove('projects', i)}
                addLabel="Add Project"
              />
              {form.projects.map((p, i) => (
                <View key={`pt-${i}`} style={{ marginTop: spacing.xs }}>
                  <Text style={fi.label}>Technologies</Text>
                  <TagInput
                    tags={p.technologies || []}
                    onChange={(v) => handleArrayChange('projects', i, 'technologies', v)}
                    placeholder="Add technology..."
                  />
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection title="Certifications" icon="ribbon">
              <ArraySection
                items={form.certifications}
                fields={certFields}
                fieldLabels={{ name: 'Name', issuer: 'Issuer', date: 'Date', url: 'URL' }}
                onChange={(i, f, v) => handleArrayChange('certifications', i, f, v)}
                onAdd={() => handleArrayAdd('certifications', { name: '', issuer: '', date: '', url: '' })}
                onRemove={(i) => handleArrayRemove('certifications', i)}
                addLabel="Add Certification"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Skills" icon="options">
              <TagInput tags={form.skills} onChange={(v) => handleFormChange('skills', v)} placeholder="Add skill..." />
            </CollapsibleSection>

            <CollapsibleSection title="Languages" icon="language">
              <TagInput tags={form.languages} onChange={(v) => handleFormChange('languages', v)} placeholder="Add language..." />
            </CollapsibleSection>

            <CollapsibleSection title="Achievements" icon="star">
              <TagInput tags={form.achievements} onChange={(v) => handleFormChange('achievements', v)} placeholder="Add achievement..." />
            </CollapsibleSection>

            {/* Generate Button */}
            <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
              <PrimaryButton
                title={creating ? 'AI is optimizing...' : 'Generate Optimized Resume'}
                icon="sparkles"
                onPress={handleCreate}
                loading={creating}
                gradient={HERO_GRADIENT}
              />
            </Animated.View>
          </>
        )}

        {tab === 'preview' && (
          <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.previewContainer}>
            <View style={styles.previewInner2}>
              <LinearGradient colors={['#0A66C2', '#004182']} style={styles.previewHeader}>
                <Text style={styles.previewName2}>{form.fullName || 'Your Name'}</Text>
                {form.headline ? <Text style={styles.previewHeadline}>{form.headline}</Text> : null}
                <View style={styles.previewContact}>
                  {form.email ? <Text style={styles.previewContactItem}>{form.email}</Text> : null}
                  {form.phone ? <Text style={styles.previewContactItem}>{form.phone}</Text> : null}
                  {form.location ? <Text style={styles.previewContactItem}>{form.location}</Text> : null}
                </View>
                <View style={styles.previewLinks}>
                  {form.website ? <Text style={styles.previewLinkText}>Website</Text> : null}
                  {form.linkedin ? <Text style={styles.previewLinkText}>LinkedIn</Text> : null}
                  {form.github ? <Text style={styles.previewLinkText}>GitHub</Text> : null}
                </View>
              </LinearGradient>
              <View style={styles.previewBody2}>
                {form.summary ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Professional Summary</Text>
                    <Text style={styles.previewSectionBody}>{form.summary}</Text>
                  </View>
                ) : null}
                {form.experience?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Experience</Text>
                    {form.experience.map((exp: any, i: number) => (
                      <View key={i} style={styles.previewEntry}>
                        <Text style={styles.previewEntryTitle}>{exp.title || ''} at {exp.company || ''}</Text>
                        {exp.description ? <Text style={styles.previewEntryDesc}>{exp.description}</Text> : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {form.education?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Education</Text>
                    {form.education.map((edu: any, i: number) => (
                      <View key={i} style={styles.previewEntry}>
                        <Text style={styles.previewEntryTitle}>{edu.degree || ''} in {edu.field || ''}</Text>
                        <Text style={styles.previewEntryDesc}>{edu.institution || ''}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {form.skills?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Skills</Text>
                    <View style={styles.skillPills}>
                      {form.skills.map((s: string, i: number) => (
                        <View key={i} style={styles.skillPill}>
                          <Text style={styles.skillPillText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
                {form.projects?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Projects</Text>
                    {form.projects.map((proj: any, i: number) => (
                      <View key={i} style={styles.previewEntry}>
                        <Text style={styles.previewEntryTitle}>{proj.name || ''}</Text>
                        {proj.description ? <Text style={styles.previewEntryDesc}>{proj.description}</Text> : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {form.certifications?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Certifications</Text>
                    {form.certifications.map((cert: any, i: number) => (
                      <View key={i} style={styles.previewEntry}>
                        <Text style={styles.previewEntryTitle}>{cert.name || ''}</Text>
                        <Text style={styles.previewEntryDesc}>{cert.issuer || ''}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {form.languages?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Languages</Text>
                    <View style={styles.skillPills}>
                      {form.languages.map((l: string, i: number) => (
                        <View key={i} style={styles.skillPill}>
                          <Text style={styles.skillPillText}>{l}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
                {form.achievements?.length > 0 ? (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Achievements</Text>
                    {form.achievements.map((a: string, i: number) => (
                      <Text key={i} style={styles.previewEntryDesc}>- {a}</Text>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
            <TouchableOpacity onPress={handleDownload} style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={18} color="#FFF" />
              <Text style={styles.downloadBtnText}>Share Resume</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {tab === 'suggestions' && (
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <GlassCard style={styles.suggestionsCard}>
              <View style={styles.scoreRow}>
                <AnimatedScoreRing score={atsScore} size={80} label="ATS" />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.scoreTitle}>ATS Score</Text>
                  <Text style={styles.scoreSub}>
                    {atsScore >= 80 ? 'Great! Your resume is well-optimized.' : atsScore >= 50 ? 'Room for improvement.' : 'Needs significant optimization.'}
                  </Text>
                </View>
              </View>

              <GradientButton
                title={suggestionsLoading ? 'Analyzing...' : 'Analyze Resume'}
                icon="analytics"
                onPress={handleLoadSuggestions}
                loading={suggestionsLoading}
                gradient={['#0A66C2', '#2563EB']}
              />

              {suggestionsLoading && <Loader message="Analyzing your resume..." />}

              {suggestions && !suggestionsLoading && (
                <View style={styles.sugSection}>
                  <Text style={styles.sugSectionTitle}>
                    <Ionicons name="analytics" size={16} color={colors.primary} /> ATS Score: {suggestions.ats_score ?? 'N/A'}
                  </Text>
                  <Text style={styles.sugText}>
                    {suggestions.ats_score >= 80
                      ? 'Your resume is well-optimized for ATS systems. Keep up the great work!'
                      : suggestions.ats_score >= 50
                      ? 'Consider adding more relevant keywords from the job description to improve your score.'
                      : 'Your resume needs significant optimization. Try adding more industry-specific keywords and improving formatting.'}
                  </Text>
                </View>
              )}

              {!suggestions && !suggestionsLoading && (
                <Text style={styles.sugHint}>Tap "Analyze Resume" to get AI-powered suggestions.</Text>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Version History */}
        {versions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(550).springify().damping(14)} style={styles.versionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Version History</Text>
              <Badge label={`${versions.length} total`} variant="default" size="sm" />
            </View>
            {versions.map((v, index) => (
              <Animated.View key={v.id || v._id || index} entering={FadeInUp.delay(570 + index * 40).springify().damping(14)}>
                <Card style={styles.versionCard} glowColor={colors.primary}>
                  <View style={styles.versionRow}>
                    <LinearGradient colors={colors.gradient.blue} style={styles.versionIcon}>
                      <Ionicons name="document-text" size={18} color="#FFF" />
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.versionName2}>{v.title || 'Unnamed'}</Text>
                      <Text style={styles.versionRole}>{v.target_role || ''}</Text>
                      <Text style={styles.versionDate}>{v.created_at ? formatDate(v.created_at) : ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { setSelectedVersion(v); setTab('preview'); }} style={styles.versionAction}>
                      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
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
  savingBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  savingText: { fontSize: 11, fontWeight: '600', color: colors.primary },

  heroWrap: { marginBottom: spacing.lg },
  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 19, marginBottom: spacing.md },

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

  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  templateChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  templateChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08', ...shadow.glow.primary },
  templateSwatch: { width: 24, height: 24, borderRadius: 7, justifyContent: 'center', alignItems: 'flex-start', gap: 2, paddingHorizontal: 4 },
  templateSwatchLine: { width: '100%', height: 2, borderRadius: 1 },
  templateCheck: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  templateText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  templateTextActive: { color: colors.primary, fontWeight: '700' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  chipActive: { backgroundColor: colors.primary + '12', borderColor: colors.primary, ...shadow.glow.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '700' },

  customInputWrap: { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.md, ...shadow.sm },
  customInput: { paddingHorizontal: spacing.md, height: 48, color: colors.text, fontSize: 14 },

  floatingInputWrap: { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.lg, paddingTop: 6, ...shadow.sm },
  floatingLabel: { position: 'absolute', left: spacing.md, top: 14, color: colors.textMuted, fontSize: 14 },
  floatingLabelUp: { top: 6, fontSize: 11, color: colors.primary },
  floatingInput: { paddingHorizontal: spacing.md, paddingTop: 18, paddingBottom: 10, color: colors.text, fontSize: 15 },

  optionGrid: { gap: spacing.sm, marginBottom: spacing.lg },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.borderLight, gap: spacing.sm, ...shadow.sm,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '06', ...shadow.glow.primary },
  optionCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  optionCheckActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  optionLabelActive: { color: colors.primary },
  optionDesc: { color: colors.textMuted, fontSize: 11, marginTop: 1 },

  jdInputWrap: { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.lg, ...shadow.sm },
  jdInput: { padding: spacing.md, color: colors.text, fontSize: 14, minHeight: 140 },

  previewContainer: { marginBottom: spacing.lg },
  previewInner2: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    overflow: 'hidden', ...shadow.lg,
  },
  previewHeader: { padding: spacing.lg },
  previewName2: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  previewHeadline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: spacing.xs },
  previewContact: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  previewContactItem: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  previewLinks: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  previewLinkText: { color: '#93C5FD', fontSize: 12, textDecorationLine: 'underline' },
  previewBody2: { padding: spacing.lg },
  previewSection: { marginBottom: spacing.md },
  previewSectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    paddingBottom: spacing.xs, marginBottom: spacing.sm,
  },
  previewSectionBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  previewEntry: { marginBottom: spacing.sm },
  previewEntryTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  previewEntryDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 2 },
  skillPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  skillPill: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full, backgroundColor: colors.primaryBg,
    borderWidth: 1, borderColor: colors.primary + '30',
  },
  skillPillText: { fontSize: 11, fontWeight: '500', color: colors.primary },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, marginTop: spacing.md, ...shadow.glow.primary,
  },
  downloadBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  suggestionsCard: { padding: spacing.md, gap: spacing.md, marginBottom: spacing.lg },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  scoreSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sugSection: { marginTop: spacing.sm },
  sugSectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, flexDirection: 'row' as const, alignItems: 'center', gap: spacing.xs },
  sugItem: { marginBottom: spacing.sm, gap: spacing.xs },
  sugText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  keywordChip: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full, backgroundColor: colors.warningLight,
    borderWidth: 1, borderColor: colors.warning + '30',
  },
  keywordText: { fontSize: 11, fontWeight: '500', color: colors.warning },
  sugHint: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },

  versionsSection: { marginTop: spacing.sm },
  versionCard: { marginBottom: spacing.sm },
  versionRow: { flexDirection: 'row', alignItems: 'center' },
  versionIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  versionName2: { color: colors.text, fontSize: 15, fontWeight: '500' },
  versionRole: { color: colors.textSecondary, fontSize: 12 },
  versionDate: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  versionAction: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center' },
});
