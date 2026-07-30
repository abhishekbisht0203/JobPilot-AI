import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
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

type TemplateCategory = 'All' | 'Modern' | 'Professional' | 'Creative' | 'Simple';

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  gradient: readonly [string, string];
  accentColor: string;
  features: string[];
  isNew?: boolean;
}

const TEMPLATES: ResumeTemplate[] = [
  { id: '1', name: 'Nova', description: 'Clean, modern layout with a bold header and skill bars', category: 'Modern', gradient: colors.gradient.blue, accentColor: colors.accent.blue, features: ['ATS-friendly', 'Two-column', 'Skill bars'], isNew: true },
  { id: '2', name: 'Apex', description: 'Professional design with clear section hierarchy', category: 'Professional', gradient: colors.gradient.indigo, accentColor: colors.accent.indigo, features: ['ATS-optimized', 'Single-column', 'Summary section'] },
  { id: '3', name: 'Vivid', description: 'Colorful creative layout perfect for design roles', category: 'Creative', gradient: colors.gradient.coral, accentColor: colors.accent.pink, features: ['Portfolio link', 'Icon-based', 'Color accent'] },
  { id: '4', name: 'Pulse', description: 'Minimalist design with clean typography and spacing', category: 'Simple', gradient: colors.gradient.teal, accentColor: colors.accent.teal, features: ['Minimal design', 'Great print', 'PDF-ready'] },
  { id: '5', name: 'Vertex', description: 'Executive-level template with professional polish', category: 'Professional', gradient: colors.gradient.purple, accentColor: colors.accent.violet, features: ['Executive focus', 'Achievement highlights', 'References'] },
  { id: '6', name: 'Flux', description: 'Contemporary design with modern typography', category: 'Modern', gradient: colors.gradient.sunset, accentColor: colors.accent.orange, features: ['Modern fonts', 'Timeline layout', 'Skills matrix'] },
  { id: '7', name: 'Sprint', description: 'Compact design to fit more content on one page', category: 'Simple', gradient: colors.gradient.success, accentColor: colors.accent.emerald, features: ['One-page', 'Compact layout', 'Keyword-optimized'] },
  { id: '8', name: 'Canvas', description: 'Portfolio-focused layout for creative professionals', category: 'Creative', gradient: colors.gradient.aurora, accentColor: colors.accent.cyan, features: ['Portfolio grid', 'Visual timeline', 'Project focus'] },
  { id: '9', name: 'Stratus', description: 'Tech-optimized template for engineering roles', category: 'Modern', gradient: colors.gradient.nebula, accentColor: colors.accent.pink, features: ['Tech-focused', 'Project showcase', 'Skill tags'] },
  { id: '10', name: 'Legacy', description: 'Traditional format trusted by recruiters worldwide', category: 'Professional', gradient: colors.gradient.midnight, accentColor: colors.textSecondary, features: ['Classic format', 'Recruiter-approved', 'Chronological'] },
  { id: '11', name: 'Zest', description: 'Energetic design that stands out in applications', category: 'Creative', gradient: colors.gradient.warning, accentColor: colors.accent.amber, features: ['Bold header', 'Color blocks', 'Infographic elements'] },
  { id: '12', name: 'Core', description: 'Straightforward no-frills design that gets results', category: 'Simple', gradient: colors.gradient.primary, accentColor: colors.accent.blue, features: ['Essential layout', 'Fast loading', 'Easy editing'] },
];

const CATEGORIES: TemplateCategory[] = ['All', 'Modern', 'Professional', 'Creative', 'Simple'];

function TemplatePreview({ template }: { template: ResumeTemplate }) {
  return (
    <View style={styles.preview}>
      <LinearGradient colors={template.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.5 }} style={styles.previewContainer}>
        <View style={styles.previewContent}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={{ flex: 1, marginLeft: 6 }}>
              <View style={[styles.previewLine, { width: '70%', backgroundColor: 'rgba(255,255,255,0.7)' }]} />
              <View style={[styles.previewLine, { width: '45%', backgroundColor: 'rgba(255,255,255,0.4)', marginTop: 3 }]} />
            </View>
          </View>
          <View style={[styles.previewDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.previewBody}>
            <View style={styles.previewCol}>
              <View style={[styles.previewLine, { width: '100%', backgroundColor: 'rgba(255,255,255,0.5)', height: 6 }]} />
              <View style={[styles.previewLine, { width: '85%', backgroundColor: 'rgba(255,255,255,0.3)', height: 4, marginTop: 4 }]} />
              <View style={[styles.previewLine, { width: '60%', backgroundColor: 'rgba(255,255,255,0.3)', height: 4, marginTop: 4 }]} />
            </View>
            {template.category !== 'Simple' && (
              <View style={styles.previewCol}>
                <View style={[styles.previewLine, { width: '90%', backgroundColor: 'rgba(255,255,255,0.4)', height: 5 }]} />
                <View style={[styles.previewLine, { width: '70%', backgroundColor: 'rgba(255,255,255,0.25)', height: 4, marginTop: 4 }]} />
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function ResumeTemplatesScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');

  const filteredTemplates = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50).springify().damping(14)}>
          <Text style={styles.title}>Resume Templates</Text>
          <Text style={styles.subtitle}>Choose from ATS-optimized, professionally designed templates</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} activeOpacity={0.7}>
                <BlurView intensity={selectedCategory === cat ? 70 : 40} tint="light" style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
                  <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <View style={styles.grid}>
          {filteredTemplates.map((template, index) => (
            <Animated.View key={template.id} entering={FadeInDown.delay(60 + index * 60).springify().damping(16)}>
              <TouchableOpacity activeOpacity={0.85}>
                <BlurView intensity={50} tint="light" style={styles.templateCard}>
                  {template.isNew && (
                    <View style={styles.newBadge}>
                      <Badge label="New" variant="info" size="sm" />
                    </View>
                  )}
                  <TemplatePreview template={template} />
                  <View style={styles.templateInfo}>
                    <View style={styles.templateHeader}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Badge label={template.category} variant="default" size="sm" />
                    </View>
                    <Text style={styles.templateDesc} numberOfLines={2}>{template.description}</Text>
                    <View style={styles.featureRow}>
                      {template.features.slice(0, 3).map((f, i) => (
                        <View key={i} style={styles.featureChip}>
                          <Text style={styles.featureText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.templateActions}>
                      <TouchableOpacity style={styles.previewBtn} activeOpacity={0.7}>
                        <Ionicons name="eye-outline" size={16} color={colors.primary} />
                        <Text style={styles.previewBtnText}>Preview</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7}>
                        <Ionicons name="download-outline" size={16} color={colors.textMuted} />
                        <Text style={styles.downloadBtnText}>Download</Text>
                        <View style={styles.comingSoonOverlay}>
                          <Text style={styles.comingSoonText}>Coming Soon</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: getTabListBottomPadding() + spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  catChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: borderRadius.full, overflow: 'hidden',
  },
  catChipActive: { backgroundColor: colors.primaryBg },
  catChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: '600' },
  grid: { gap: spacing.md, marginTop: spacing.sm },
  templateCard: {
    borderRadius: borderRadius.xl, overflow: 'hidden', position: 'relative', ...shadow.md,
  },
  newBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10 },
  preview: { height: 160, borderRadius: borderRadius.lg, overflow: 'hidden', margin: spacing.md, marginBottom: 0 },
  previewContainer: { flex: 1, padding: spacing.md },
  previewContent: { flex: 1 },
  previewHeader: { flexDirection: 'row', alignItems: 'center' },
  previewAvatar: { width: 28, height: 28, borderRadius: 14 },
  previewLine: { height: 5, borderRadius: 3 },
  previewDivider: { height: 1, marginVertical: spacing.sm },
  previewBody: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  previewCol: { flex: 1, gap: 4 },
  templateInfo: { padding: spacing.md, paddingTop: 0 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  templateName: { fontSize: 17, fontWeight: '700', color: colors.text },
  templateDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16, marginTop: 4 },
  featureRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  featureChip: {
    paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
  },
  featureText: { fontSize: 10, fontWeight: '500', color: colors.primary },
  templateActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  previewBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, backgroundColor: colors.primaryBg, borderRadius: borderRadius.md,
  },
  previewBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  downloadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    position: 'relative', overflow: 'hidden',
  },
  downloadBtnText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', borderRadius: borderRadius.md,
  },
  comingSoonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
});
