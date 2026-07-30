import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Share, Alert, Dimensions, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { coverLetterApi } from '../../lib/api';
import { formatDate } from '../../lib/helpers';
import {
  ToolHeader, GradientButton, SectionHeader, TabBar, InfoCard,
  EmptyToolState, AnimatedScoreRing,
} from '../../components/career-tools';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

const EXPERIENCE_OPTIONS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
];

const TONE_OPTIONS = [
  { value: 'formal', label: 'Professional' },
  { value: 'conversational', label: 'Casual' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
];

const IMPROVEMENTS = [
  { key: 'professional', label: 'Professional', icon: 'ribbon' },
  { key: 'friendly', label: 'Friendly', icon: 'happy' },
  { key: 'shorten', label: 'Shorten', icon: 'contract' },
  { key: 'expand', label: 'Expand', icon: 'expand' },
  { key: 'ats', label: 'ATS Optimized', icon: 'shield-checkmark' },
  { key: 'grammar', label: 'Grammar Fix', icon: 'checkmark-circle' },
  { key: 'rewrite', label: 'Rewrite', icon: 'refresh' },
];

interface CoverLetter {
  _id: string;
  id?: string;
  title?: string;
  content?: string;
  companyName?: string;
  jobTitle?: string;
  yourName?: string;
  skills?: string[];
  experienceLevel?: string;
  tone?: string;
  isGenerated?: boolean;
  createdAt?: string;
}

function SkeletonCard() {
  return (
    <View style={listStyles.skeletonCard}>
      <View style={listStyles.skelLine} />
      <View style={[listStyles.skelLine, { width: '60%' }]} />
      <View style={[listStyles.skelLine, { width: '40%' }]} />
      <View style={listStyles.skelRow}>
        <View style={listStyles.skelBtn} />
        <View style={listStyles.skelBtn} />
        <View style={listStyles.skelBtn} />
      </View>
    </View>
  );
}

function ListSkeleton() {
  return (
    <View style={listStyles.grid}>
      {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
    </View>
  );
}

const initialForm = {
  jobTitle: '',
  companyName: '',
  yourName: '',
  skills: '',
  experienceLevel: 'mid',
  tone: 'formal',
};

export default function CoverLetterScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ jobTitle?: string; company?: string; jobDescription?: string }>();

  const [view, setView] = useState<'list' | 'editor'>('list');
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  const contentRef = useRef('');

  const fetchCoverLetters = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await coverLetterApi.list();
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCoverLetters(Array.isArray(arr) ? arr : []);
    } catch (err: any) {
      setListError(err?.response?.data?.message || 'Failed to fetch cover letters.');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoverLetters();
  }, [fetchCoverLetters]);

  useEffect(() => {
    if (params.jobTitle) setFormData(f => ({ ...f, jobTitle: params.jobTitle! }));
    if (params.company) setFormData(f => ({ ...f, companyName: params.company! }));
    if (params.jobTitle || params.company) setView('editor');
  }, [params.jobTitle, params.company, params.jobDescription]);

  const handleGenerate = async () => {
    if (!formData.jobTitle.trim() || !formData.companyName.trim()) {
      Alert.alert('Required', 'Job Title and Company Name are required.');
      return;
    }
    setGenerating(true);
    setGeneratedContent('');
    contentRef.current = '';
    try {
      const skills = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const res = await coverLetterApi.generate({
        job_title: formData.jobTitle.trim(),
        company: formData.companyName.trim(),
        tone: formData.tone,
        job_description: '',
      });
      const obj = res.data?.data || res.data;
      const content = obj?.content || '';
      if (!content) {
        Alert.alert('Error', 'Generated content is empty. Please try again.');
        setGenerating(false);
        return;
      }
      setGeneratedContent(content);
      contentRef.current = content;
      const newId = obj?.id || obj?._id;
      if (newId) setEditId(newId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to generate cover letter.';
      Alert.alert('Error', msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!formData.jobTitle.trim() || !formData.companyName.trim()) {
      Alert.alert('Required', 'Job Title and Company Name are required.');
      return;
    }
    setGenerating(true);
    try {
      const skills = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const res = await coverLetterApi.generate({
        job_title: formData.jobTitle.trim(),
        company: formData.companyName.trim(),
        tone: formData.tone,
        job_description: '',
      });
      const obj = res.data?.data || res.data;
      const content = obj?.content || '';
      if (content) {
        setGeneratedContent(content);
        contentRef.current = content;
        const newId = obj?.id || obj?._id;
        if (newId) setEditId(newId);
      }
    } catch {
      Alert.alert('Error', 'Failed to regenerate.');
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await coverLetterApi.get(id);
      const cl = res.data?.data || res.data;
      setFormData({
        jobTitle: cl.jobTitle || '',
        companyName: cl.companyName || '',
        yourName: cl.yourName || '',
        skills: Array.isArray(cl.skills) ? cl.skills.join(', ') : '',
        experienceLevel: cl.experienceLevel || 'mid',
        tone: cl.tone || 'formal',
      });
      const content = cl.content || '';
      setGeneratedContent(content);
      contentRef.current = content;
      setEditId(id);
      setView('editor');
    } catch {
      Alert.alert('Error', 'Failed to load cover letter.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Cover Letter', 'Are you sure you want to delete this cover letter?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await coverLetterApi.delete(id);
            fetchCoverLetters();
          } catch {
            Alert.alert('Error', 'Failed to delete.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleCopy = async () => {
    const text = generatedContent || contentRef.current;
    try {
      await Share.share({ message: text });
    } catch {
      // ignore
    }
  };

  const handleNew = () => {
    setFormData(initialForm);
    setGeneratedContent('');
    contentRef.current = '';
    setEditId(null);
    setActiveTab('editor');
  };

  const handleImprove = async (action: string) => {
    setImproving(true);
    try {
      const current = generatedContent || contentRef.current;
      const lines = current.split('\n').filter(Boolean);
      let improved = current;

      switch (action) {
        case 'professional':
          improved = lines.map(l => {
            if (l.match(/^(hi|hey|hello)/i)) return 'Dear Hiring Manager,';
            if (l.match(/^best/i)) return 'Sincerely';
            if (l.match(/^thanks/i)) return 'Thank you for your time and consideration.';
            return l;
          }).join('\n');
          break;
        case 'friendly':
          improved = lines.map(l => {
            if (l.match(/^dear/i)) return 'Hi there,';
            if (l.match(/^sincerely/i)) return 'Best regards';
            return l;
          }).join('\n');
          break;
        case 'shorten':
          improved = lines.filter((l, i) => {
            if (i === 0 || i === lines.length - 1) return true;
            return l.split(' ').length > 5;
          }).slice(0, Math.max(6, Math.ceil(lines.length * 0.7))).join('\n');
          break;
        case 'expand': {
          const middle = Math.floor(lines.length / 2);
          const insertIdx = middle > 0 ? middle : lines.length;
          const expansion = `\n\nI am particularly excited about this opportunity because my background in ${formData.skills || 'relevant technologies'} aligns perfectly with the requirements of this role. I have consistently delivered results that exceed expectations, and I am confident I can bring the same level of dedication and expertise to ${formData.companyName || 'your organization'}.`;
          lines.splice(insertIdx, 0, expansion);
          improved = lines.join('\n');
          break;
        }
        case 'ats': {
          const keywords = (formData.skills || '').split(',').map(s => s.trim()).filter(Boolean);
          if (keywords.length > 0) {
            improved = current + `\n\nCore competencies include: ${keywords.join(', ')}.`;
          }
          break;
        }
        case 'grammar':
          improved = current
            .replace(/\bi\b/g, 'I')
            .replace(/\bi'm\b/g, "I'm")
            .replace(/\bi've\b/g, "I've")
            .replace(/\bi'll\b/g, "I'll")
            .replace(/\bi'd\b/g, "I'd")
            .replace(/\bcan't\b/g, 'cannot')
            .replace(/\bwont\b/g, "won't")
            .replace(/\bdont\b/g, "don't");
          break;
        case 'rewrite':
          await handleRegenerate();
          setImproving(false);
          return;
      }

      setGeneratedContent(improved);
      contentRef.current = improved;
    } catch {
      Alert.alert('Error', 'Failed to improve content.');
    } finally {
      setImproving(false);
    }
  };

  const previewTime = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const hasContent = generatedContent.trim().length > 0;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {view === 'list' ? (
        <>
          <ToolHeader
            title="Cover Letter Generator"
            subtitle="Craft compelling cover letters that hiring managers actually read."
            gradient={['#6366F1', '#8B5CF6']}
            icon="document-text"
          />
          <ScrollView
            style={s.scrollArea}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.listHeader}>
              <SectionHeader
                title="Saved Cover Letters"
                icon="folder"
                badge={coverLetters.length}
                action={
                  <TouchableOpacity
                    onPress={() => {
                      handleNew();
                      setView('editor');
                    }}
                    style={s.newBtn}
                  >
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={s.newBtnText}>New</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {listLoading ? (
              <ListSkeleton />
            ) : listError ? (
              <Animated.View entering={FadeInUp.springify().damping(14)} style={s.centerWrap}>
                <View style={s.errorIcon}>
                  <Ionicons name="alert-circle" size={40} color={colors.error} />
                </View>
                <Text style={s.errorText}>{listError}</Text>
                <Button title="Retry" onPress={fetchCoverLetters} variant="outline" size="sm" />
              </Animated.View>
            ) : coverLetters.length === 0 ? (
              <EmptyToolState
                icon="document-text"
                title="No cover letters yet"
                message="Create your first one to get started."
                actionLabel="Generate Cover Letter"
                onAction={() => {
                  handleNew();
                  setView('editor');
                }}
              />
            ) : (
              <Animated.View entering={FadeInDown.springify().damping(14)} style={listStyles.grid}>
                {coverLetters.map((cl, i) => (
                  <Animated.View
                    key={cl.id || cl._id || i}
                    entering={FadeInUp.delay(i * 50).springify().damping(14)}
                    style={{ width: CARD_WIDTH }}
                  >
                    <TouchableOpacity
                      onPress={() => handleEdit(cl.id || cl._id)}
                      activeOpacity={0.9}
                      style={listStyles.card}
                    >
                      <View style={listStyles.cardTop}>
                        <Text style={listStyles.cardTitle} numberOfLines={1}>
                          {cl.title || 'Untitled'}
                        </Text>
                        {cl.isGenerated && (
                          <Badge label="AI" variant="primary" size="sm" icon="sparkles" />
                        )}
                      </View>
                      <View style={listStyles.cardBody}>
                        {cl.companyName ? (
                          <View style={listStyles.cardMeta}>
                            <Ionicons name="briefcase" size={13} color={colors.textMuted} />
                            <Text style={listStyles.cardMetaText} numberOfLines={1}>{cl.companyName}</Text>
                          </View>
                        ) : null}
                        {cl.jobTitle ? (
                          <View style={listStyles.cardMeta}>
                            <Ionicons name="pricetag" size={13} color={colors.textMuted} />
                            <Text style={listStyles.cardMetaText} numberOfLines={1}>{cl.jobTitle}</Text>
                          </View>
                        ) : null}
                        {cl.createdAt ? (
                          <View style={listStyles.cardMeta}>
                            <Ionicons name="create" size={12} color={colors.textMuted} />
                            <Text style={listStyles.cardMetaText}>{formatDate(cl.createdAt)}</Text>
                          </View>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(cl.id || cl._id)}
                        disabled={deletingId === (cl.id || cl._id)}
                        style={listStyles.deleteBtn}
                      >
                        <Ionicons
                          name={deletingId === (cl.id || cl._id) ? 'hourglass' : 'trash-outline'}
                          size={16}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView
          style={s.scrollArea}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.editorHeader}>
            <TouchableOpacity onPress={() => setView('list')} style={s.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={s.editorTitle}>Cover Letter</Text>
          </View>

          <View style={s.editorLayout}>
            <View style={s.formColumn}>
              <Animated.View entering={FadeInUp.springify().damping(14)}>
                <GlassCard style={s.glassCard}>
                  <View style={s.formTitleRow}>
                    <Ionicons name="settings-outline" size={18} color={colors.primary} />
                    <Text style={s.formTitle}>Details</Text>
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.label}>Job Title <Text style={s.required}>*</Text></Text>
                    <TextInput
                      style={s.input}
                      placeholder="e.g. Software Engineer"
                      placeholderTextColor={colors.textMuted}
                      value={formData.jobTitle}
                      onChangeText={t => setFormData(f => ({ ...f, jobTitle: t }))}
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.label}>Company <Text style={s.required}>*</Text></Text>
                    <TextInput
                      style={s.input}
                      placeholder="e.g. Acme Corp"
                      placeholderTextColor={colors.textMuted}
                      value={formData.companyName}
                      onChangeText={t => setFormData(f => ({ ...f, companyName: t }))}
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.label}>Your Name</Text>
                    <TextInput
                      style={s.input}
                      placeholder="Your name"
                      placeholderTextColor={colors.textMuted}
                      value={formData.yourName}
                      onChangeText={t => setFormData(f => ({ ...f, yourName: t }))}
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.label}>Skills (comma-separated)</Text>
                    <TextInput
                      style={s.input}
                      placeholder="React, Node.js, TypeScript"
                      placeholderTextColor={colors.textMuted}
                      value={formData.skills}
                      onChangeText={t => setFormData(f => ({ ...f, skills: t }))}
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.label}>Experience Level</Text>
                    <View style={s.selectWrap}>
                      <TextInput
                        style={[s.input, s.selectInput]}
                        value={EXPERIENCE_OPTIONS.find(o => o.value === formData.experienceLevel)?.label || ''}
                        editable={false}
                      />
                      <View style={s.selectOverlay}>
                        {EXPERIENCE_OPTIONS.map(opt => (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => setFormData(f => ({ ...f, experienceLevel: opt.value }))}
                            style={[
                              s.selectOption,
                              formData.experienceLevel === opt.value && s.selectOptionActive,
                            ]}
                          >
                            <Text style={[
                              s.selectOptionText,
                              formData.experienceLevel === opt.value && s.selectOptionTextActive,
                            ]}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.label}>Tone</Text>
                    <View style={s.selectWrap}>
                      <TextInput
                        style={[s.input, s.selectInput]}
                        value={TONE_OPTIONS.find(o => o.value === formData.tone)?.label || ''}
                        editable={false}
                      />
                      <View style={s.selectOverlay}>
                        {TONE_OPTIONS.map(opt => (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => setFormData(f => ({ ...f, tone: opt.value }))}
                            style={[
                              s.selectOption,
                              formData.tone === opt.value && s.selectOptionActive,
                            ]}
                          >
                            <Text style={[
                              s.selectOptionText,
                              formData.tone === opt.value && s.selectOptionTextActive,
                            ]}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <GradientButton
                    title={generating ? 'Generating...' : 'Generate Cover Letter'}
                    icon="wand"
                    onPress={handleGenerate}
                    loading={generating}
                    gradient={['#6366F1', '#8B5CF6']}
                  />
                </GlassCard>
              </Animated.View>

              {hasContent && (
                <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
                  <GlassCard style={[s.glassCard, s.improvementsCard]}>
                    <View style={s.formTitleRow}>
                      <Ionicons name="sparkles" size={18} color={colors.warning} />
                      <Text style={s.formTitle}>AI Improvements</Text>
                    </View>
                    <View style={s.improvementsGrid}>
                      {IMPROVEMENTS.map(imp => (
                        <TouchableOpacity
                          key={imp.key}
                          onPress={() => handleImprove(imp.key)}
                          disabled={improving}
                          style={[
                            s.improveBtn,
                            imp.key === 'rewrite' && s.improveBtnFull,
                          ]}
                        >
                          <Ionicons name={imp.icon as any} size={14} color={colors.primary} />
                          <Text style={s.improveBtnText}>{imp.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </GlassCard>
                </Animated.View>
              )}
            </View>

            <View style={s.resultColumn}>
              <Animated.View entering={FadeInUp.delay(50).springify().damping(14)} style={{ flex: 1 }}>
                <GlassCard style={[s.glassCard, s.resultCard]}>
                  {!hasContent && !generating ? (
                    <View style={s.emptyResult}>
                      <View style={s.emptyResultIcon}>
                        <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                      </View>
                      <Text style={s.emptyResultTitle}>No content yet</Text>
                      <Text style={s.emptyResultSub}>
                        Fill in the details and tap "Generate Cover Letter"
                      </Text>
                    </View>
                  ) : generating && !hasContent ? (
                    <View style={s.emptyResult}>
                      <Loader message="Generating your cover letter..." />
                    </View>
                  ) : (
                    <>
                      <TabBar
                        tabs={[
                          { key: 'editor', label: 'Editor', icon: 'create' },
                          { key: 'preview', label: 'Preview', icon: 'eye' },
                        ]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                      />

                      <View style={s.tabContent}>
                        {activeTab === 'editor' ? (
                          <TextInput
                            style={s.editorTextArea}
                            value={generatedContent}
                            onChangeText={t => {
                              setGeneratedContent(t);
                              contentRef.current = t;
                            }}
                            multiline
                            textAlignVertical="top"
                            scrollEnabled
                          />
                        ) : (
                          <ScrollView style={s.previewScroll}>
                            <View style={s.previewInner}>
                              <View style={s.previewCenter}>
                                {(formData.yourName) ? (
                                  <Text style={s.previewName}>{formData.yourName}</Text>
                                ) : null}
                                <Text style={s.previewDate}>{previewTime}</Text>
                              </View>
                              {formData.companyName ? (
                                <View style={s.previewAddress}>
                                  <Text style={s.previewAddrText}>Hiring Manager</Text>
                                  <Text style={s.previewAddrText}>{formData.companyName}</Text>
                                </View>
                              ) : null}
                              {formData.jobTitle ? (
                                <Text style={s.previewRe}>Re: <Text style={s.previewReItalic}>{formData.jobTitle}</Text></Text>
                              ) : null}
                              <View style={s.previewDivider} />
                              <Text style={s.previewBody}>{generatedContent}</Text>
                            </View>
                          </ScrollView>
                        )}
                      </View>

                      {hasContent && (
                        <View style={s.toolbar}>
                          <TouchableOpacity onPress={handleCopy} style={s.toolbarBtn}>
                            <Ionicons name="share-outline" size={18} color={colors.primary} />
                            <Text style={s.toolbarBtnText}>Copy</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleRegenerate} disabled={generating} style={s.toolbarBtn}>
                            <Ionicons name="refresh" size={18} color={colors.primary} />
                            <Text style={s.toolbarBtnText}>Regenerate</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleNew} style={s.toolbarBtn}>
                            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                            <Text style={s.toolbarBtnText}>New</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </GlassCard>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  listHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, borderRadius: borderRadius.full,
  },
  newBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  centerWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  errorIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.errorLight, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.error, fontSize: 14, textAlign: 'center' },

  editorHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center', ...shadow.sm,
  },
  editorTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  editorLayout: { paddingHorizontal: spacing.lg, gap: spacing.md },
  formColumn: { gap: spacing.md },
  resultColumn: { minHeight: 400 },
  glassCard: { padding: spacing.md, gap: spacing.sm },
  improvementsCard: { marginTop: 0 },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  inputGroup: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  required: { color: colors.error },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, height: 48, color: colors.text, fontSize: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  selectWrap: { position: 'relative' },
  selectInput: { color: colors.textMuted },
  selectOverlay: {
    flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs,
  },
  selectOption: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight,
    borderWidth: 1, borderColor: colors.border,
  },
  selectOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectOptionText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  selectOptionTextActive: { color: colors.white },
  emptyResult: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyResultIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  emptyResultTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  emptyResultSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  resultCard: { minHeight: 450 },
  tabContent: { flex: 1, minHeight: 300 },
  editorTextArea: {
    flex: 1, minHeight: 300, backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md, padding: spacing.md, color: colors.text,
    fontSize: 14, lineHeight: 22, borderWidth: 1, borderColor: colors.border,
    textAlignVertical: 'top',
  },
  previewScroll: { maxHeight: 400 },
  previewInner: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  previewCenter: { alignItems: 'center', marginBottom: spacing.md },
  previewName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 2 },
  previewDate: { fontSize: 13, color: colors.textMuted },
  previewAddress: { marginBottom: spacing.md },
  previewAddrText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  previewRe: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  previewReItalic: { fontStyle: 'italic', fontWeight: '400' },
  previewDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  previewBody: {
    fontSize: 14, lineHeight: 22, color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  toolbar: {
    flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm,
  },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md, backgroundColor: colors.primaryBg,
  },
  toolbarBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  improvementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs,
  },
  improveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight,
    borderWidth: 1, borderColor: colors.border,
  },
  improveBtnFull: { width: '100%' },
  improveBtnText: { fontSize: 12, fontWeight: '500', color: colors.primary },
});

const listStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    padding: spacing.md, ...shadow.md,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: spacing.xs },
  cardBody: { gap: spacing.xs, marginBottom: spacing.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  deleteBtn: { alignSelf: 'flex-end', padding: spacing.xs },
  skeletonCard: {
    width: CARD_WIDTH, padding: spacing.md, borderRadius: borderRadius.xl,
    backgroundColor: colors.surface, gap: spacing.sm, ...shadow.sm,
  },
  skelLine: {
    height: 14, borderRadius: 7, backgroundColor: colors.borderLight,
    width: '80%',
  },
  skelRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  skelBtn: {
    height: 28, width: 48, borderRadius: 8, backgroundColor: colors.borderLight,
  },
});
