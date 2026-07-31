import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming, useAnimatedStyle, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { FounderCard, Founder } from '../../components/about/FounderCard';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  color: string;
  gradient: readonly [string, string];
}

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  gradient: readonly [string, string];
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  initials: string;
}

interface Achievement {
  year: string;
  title: string;
  description: string;
  icon: string;
}

interface TechItem {
  name: string;
  icon: string;
  color: string;
}

const STATS: Stat[] = [
  { label: 'Jobs Posted', value: 125000, suffix: '+', icon: 'briefcase', color: colors.primary, gradient: colors.gradient.blue },
  { label: 'Happy Candidates', value: 85000, suffix: '+', icon: 'happy', color: colors.success, gradient: colors.gradient.success },
  { label: 'Companies', value: 4200, suffix: '+', icon: 'business', color: colors.secondary, gradient: colors.gradient.purple },
  { label: 'Countries', value: 48, suffix: '', icon: 'globe', color: colors.accent.teal, gradient: colors.gradient.teal },
];

const FULL_STACK_GRADIENT = ['#0A66C2', '#06B6D4'] as const;
const AI_ML_GRADIENT = ['#9333EA', '#DB2777'] as const;
const ROLE_GRADIENT = ['#059669', '#0D9488'] as const;

const FOUNDERS: Founder[] = [
  {
    name: 'Darshan Goswami',
    initials: 'DG',
    avatarGradient: colors.gradient.blue,
    position: 'CTO & Co-Founder',
    specialties: 'Software Engineer • AI/ML Engineer • Full Stack Developer',
    bio: 'Darshan Goswami is responsible for the technology, AI systems, backend architecture, and product engineering of JobPilot AI. He specializes in Full Stack Development, Artificial Intelligence, Machine Learning, scalable backend systems, cloud deployment, and modern web technologies. His vision is to build AI-powered career solutions that simplify job searching and career growth for millions of users.',
    skills: ['Artificial Intelligence', 'Machine Learning', 'Full Stack Development', 'React', 'Next.js', 'FastAPI', 'Django', 'Node.js', 'PostgreSQL', 'Docker', 'LangChain', 'LangGraph', 'RAG', 'MCP', 'Cloud Computing'],
    badges: [
      { label: 'Full Stack', icon: 'ribbon', gradient: FULL_STACK_GRADIENT },
      { label: 'AI/ML', icon: 'sparkles', gradient: AI_ML_GRADIENT },
      { label: 'Engineering', icon: 'code-slash', gradient: ROLE_GRADIENT },
    ],
    linkedInUrl: 'https://linkedin.com/in/darshan-goswami',
    githubUrl: 'https://github.com/Darshangoswami07',
    portfolioUrl: 'https://darshangoswami.com',
    email: 'darshan@jobpilot.ai',
  },
  {
    name: 'Abhishek Bisht',
    initials: 'AB',
    avatarGradient: colors.gradient.purple,
    position: 'CEO & Co-Founder',
    specialties: 'Full Stack Developer • Software Engineer • AI/ML Engineer • Product Strategist',
    bio: 'Abhishek Bisht leads the overall vision, product strategy, business development, and growth of JobPilot AI. He also works as a Full Stack Developer, managing the database, backend, and frontend of the JobPilot AI platform. He works closely on AI-driven innovation, user experience, and building a world-class platform that connects job seekers with the best career opportunities through intelligent automation.',
    skills: ['Artificial Intelligence', 'Machine Learning', 'Full Stack Development', 'React', 'Next.js', 'Python', 'Node.js', 'Django', 'PostgreSQL', 'MongoDB', 'Product Management', 'UI/UX Design', 'Cloud Computing', 'Business Strategy'],
    badges: [
      { label: 'Full Stack', icon: 'ribbon', gradient: FULL_STACK_GRADIENT },
      { label: 'AI/ML', icon: 'sparkles', gradient: AI_ML_GRADIENT },
      { label: 'Leadership', icon: 'code-slash', gradient: ROLE_GRADIENT },
    ],
    linkedInUrl: 'https://linkedin.com/in/abhishek-bisht',
    githubUrl: 'https://github.com/abhishekbisht',
    portfolioUrl: 'https://abhishekbisht.com',
    email: 'abhishek@jobpilot.ai',
  },
];

const TEAM: TeamMember[] = [
  { name: 'Alex Rivera', role: 'CEO & Co-Founder', initials: 'AR', gradient: colors.gradient.blue },
  { name: 'Sarah Chen', role: 'CTO & Co-Founder', initials: 'SC', gradient: colors.gradient.purple },
  { name: 'Marcus Johnson', role: 'Head of AI', initials: 'MJ', gradient: colors.gradient.coral },
  { name: 'Priya Sharma', role: 'Head of Product', initials: 'PS', gradient: colors.gradient.sunset },
  { name: 'David Kim', role: 'Lead Engineer', initials: 'DK', gradient: colors.gradient.teal },
  { name: 'Emma Williams', role: 'Head of Design', initials: 'EW', gradient: colors.gradient.indigo },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Jessica Martinez',
    role: 'Software Engineer at Google',
    text: 'JobPilot AI completely transformed my job search. The AI resume optimization helped me get interviews at top tech companies. I landed my dream role within 3 weeks!',
    rating: 5,
    initials: 'JM',
  },
  {
    name: 'Ryan Thompson',
    role: 'Product Manager at Airbnb',
    text: 'The mock interview feature is incredible. It asked me real interview questions and gave me detailed feedback. I felt fully prepared going into every interview.',
    rating: 5,
    initials: 'RT',
  },
  {
    name: 'Aisha Patel',
    role: 'Data Scientist at Microsoft',
    text: 'Skill gap analysis showed me exactly what I needed to learn. I upskilled in 3 areas and got a promotion within 2 months. Worth every penny.',
    rating: 5,
    initials: 'AP',
  },
];

const ACHIEVEMENTS: Achievement[] = [
  { year: '2023 Q1', title: 'Company Founded', description: 'JobPilot AI was born with a mission to democratize career growth using AI.', icon: 'rocket-outline' },
  { year: '2023 Q2', title: '10K Users', description: 'Reached 10,000 active users within the first 3 months of launch.', icon: 'people-outline' },
  { year: '2023 Q3', title: 'AI Launch', description: 'Released AI-powered resume optimization and cover letter generation.', icon: 'sparkles-outline' },
  { year: '2023 Q4', title: 'Seed Funding', description: 'Raised $2.5M in seed funding to accelerate product development.', icon: 'trending-up-outline' },
  { year: '2024 Q1', title: 'Enterprise Launch', description: 'Launched enterprise plans with team collaboration and API access.', icon: 'business-outline' },
  { year: '2024 Q2', title: 'Global Expansion', description: 'Expanded to 48 countries with multi-language support.', icon: 'globe-outline' },
];

const TECH_STACK: TechItem[] = [
  { name: 'React Native', icon: 'logo-react', color: '#61DAFB' },
  { name: 'Expo', icon: 'code-slash', color: '#000020' },
  { name: 'Python', icon: 'logo-python', color: '#3776AB' },
  { name: 'FastAPI', icon: 'server', color: '#009688' },
  { name: 'PostgreSQL', icon: 'server', color: '#336791' },
  { name: 'Redis', icon: 'layers', color: '#DC382D' },
  { name: 'AWS', icon: 'cloud', color: '#FF9900' },
  { name: 'Docker', icon: 'cube', color: '#2496ED' },
];

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 100).springify().damping(14)} style={{ width: '47%' }}>
      <BlurView intensity={50} tint="light" style={styles.statCard}>
        <LinearGradient colors={stat.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statIcon}>
          <Ionicons name={stat.icon as any} size={18} color="#FFF" />
        </LinearGradient>
        <View style={styles.statInfo}>
          <View style={styles.statValueRow}>
            <AnimatedCounter value={stat.value} style={[styles.statValue, { color: stat.color }]} spring />
            {stat.suffix ? <Text style={[styles.statSuffix, { color: stat.color }]}>{stat.suffix}</Text> : null}
          </View>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const scale = useSharedValue(1);

  return (
    <Animated.View entering={FadeInUp.delay(500 + index * 60).springify().damping(14)} style={{ width: '47%' }}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.95, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <BlurView intensity={45} tint="light" style={styles.teamCard}>
            <LinearGradient colors={member.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.teamAvatar}>
              <Text style={styles.teamInitials}>{member.initials}</Text>
            </LinearGradient>
            <Text style={styles.teamName}>{member.name}</Text>
            <Text style={styles.teamRole}>{member.role}</Text>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(600 + index * 100).springify().damping(14)}>
      <GlassCard style={styles.testimonialCard} glowColor={colors.primary}>
        <View style={styles.testimonialStars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Ionicons
              key={s}
              name={s <= testimonial.rating ? 'star' : 'star-outline'}
              size={14}
              color={s <= testimonial.rating ? '#F59E0B' : colors.textMuted}
            />
          ))}
        </View>
        <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
        <View style={styles.testimonialAuthor}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.testimonialAvatar}>
            <Text style={styles.testimonialInitials}>{testimonial.initials}</Text>
          </LinearGradient>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.testimonialName}>{testimonial.name}</Text>
            <Text style={styles.testimonialRole}>{testimonial.role}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function AchievementItem({ achievement, index }: { achievement: Achievement; index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(400 + index * 60).springify().damping(14)}>
      <View style={styles.timelineItem}>
        <View style={styles.timelineDot}>
          <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.timelineDotInner}>
            <Ionicons name={achievement.icon as any} size={14} color="#FFF" />
          </LinearGradient>
        </View>
        <View style={styles.timelineContent}>
          <Badge label={achievement.year} variant="primary" size="sm" />
          <Text style={styles.timelineTitle}>{achievement.title}</Text>
          <Text style={styles.timelineDesc}>{achievement.description}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TechBadge({ tech, index }: { tech: TechItem; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(400 + index * 40).springify().damping(14)}>
      <BlurView intensity={40} tint="light" style={styles.techBadge}>
        <Ionicons name={tech.icon as any} size={16} color={tech.color} />
        <Text style={styles.techName}>{tech.name}</Text>
      </BlurView>
    </Animated.View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isTablet } = useResponsive();

  return (
    <View style={styles.container}>
      <MeshGradient opacity={0.35} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <View style={styles.heroSection}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.heroLogo}>
              <Ionicons name="briefcase" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={styles.heroTitle}>JobPilot AI</Text>
            <Text style={styles.heroTagline}>
              Empowering careers with artificial intelligence
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
          <GlassCard style={styles.missionCard} glowColor={colors.primary}>
            <View style={styles.missionRow}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.missionIcon}>
                <Ionicons name="bulb-outline" size={24} color="#FFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.missionTitle}>Our Mission</Text>
                <Text style={styles.missionText}>
                  To democratize career growth by leveraging AI to provide every professional
                  with personalized tools for resume optimization, interview preparation, and
                  strategic job searching.
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify().damping(14)}>
          <GlassCard style={styles.visionCard} glowColor={colors.secondary}>
            <View style={styles.missionRow}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.missionIcon}>
                <Ionicons name="eye-outline" size={24} color="#FFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.missionTitle}>Our Vision</Text>
                <Text style={styles.missionText}>
                  A world where every professional, regardless of background, has access to
                  AI-powered career tools that level the playing field and unlock their full potential.
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          <View style={styles.statsGrid}>
            {STATS.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <GlassCard style={styles.storyCard} glowColor={colors.accent.teal}>
            <Text style={styles.storyText}>
              JobPilot AI started in early 2023 when our founders Alex and Sarah experienced
              firsthand the challenges of modern job searching. They realized that while AI was
              transforming industries, career tools had remained largely unchanged for decades.
            </Text>
            <Text style={[styles.storyText, { marginTop: spacing.sm }]}>
              They assembled a world-class team of engineers, AI researchers, and career coaches
              to build the most intelligent career assistant ever created. Today, JobPilot AI
              serves over 85,000 professionals across 48 countries.
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <View style={styles.techGrid}>
            {TECH_STACK.map((tech, index) => (
              <TechBadge key={tech.name} tech={tech} index={index} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <GlassCard style={styles.timelineCard}>
            {ACHIEVEMENTS.map((achievement, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.timelineLine} />}
                <AchievementItem achievement={achievement} index={index} />
              </React.Fragment>
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(480).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Our Founders</Text>
          <View style={{ gap: spacing.md }}>
            {FOUNDERS.map((founder) => (
              <FounderCard key={founder.name} founder={founder} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Meet the Team</Text>
          <View style={styles.teamGrid}>
            {TEAM.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550).springify().damping(14)}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    marginTop: spacing.xl, marginBottom: spacing.md, letterSpacing: -0.3,
  },
  heroSection: { alignItems: 'center', paddingVertical: spacing.lg },
  heroLogo: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary,
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: spacing.md, letterSpacing: -0.5 },
  heroTagline: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, maxWidth: 280 },
  missionCard: { padding: spacing.md, marginBottom: spacing.sm },
  visionCard: { padding: spacing.md, marginBottom: spacing.sm },
  missionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  missionIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  missionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  missionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginTop: spacing.xs },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '100%', borderRadius: borderRadius.xl, overflow: 'hidden',
    padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    ...shadow.md,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  statInfo: { flex: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  statValue: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statSuffix: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 1 },
  storyCard: { padding: spacing.md },
  storyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  techGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  techBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.full,
    overflow: 'hidden', ...shadow.sm,
  },
  techName: { fontSize: 13, fontWeight: '500', color: colors.text },
  timelineCard: { padding: spacing.md },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm },
  timelineDot: { width: 28, alignItems: 'center', marginRight: spacing.md, paddingTop: 2 },
  timelineDotInner: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  timelineContent: { flex: 1, gap: spacing.xs },
  timelineLine: {
    width: 2, backgroundColor: colors.borderLight,
    marginLeft: 13, height: 12,
  },
  timelineTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  timelineDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  teamCard: {
    borderRadius: borderRadius.xl, overflow: 'hidden',
    padding: spacing.md, alignItems: 'center', ...shadow.md,
  },
  teamAvatar: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  teamInitials: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  teamName: { fontSize: 15, fontWeight: '600', color: colors.text, textAlign: 'center' },
  teamRole: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  testimonialCard: { padding: spacing.md, marginBottom: spacing.sm },
  testimonialStars: { flexDirection: 'row', gap: 2, marginBottom: spacing.sm },
  testimonialText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21, fontStyle: 'italic' },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  testimonialAvatar: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  testimonialInitials: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  testimonialName: { fontSize: 14, fontWeight: '600', color: colors.text },
  testimonialRole: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
});
