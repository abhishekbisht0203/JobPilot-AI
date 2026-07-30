import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert, Linking,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming, useAnimatedStyle,
  interpolate, Extrapolation, Easing, SlideInDown, SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { useAuthStore, useDashboardStore } from '../../store';
import { userApi, resumeApi } from '../../lib/api';
import { getInitials } from '../../lib/helpers';

type ThemeMode = 'system' | 'light' | 'dark';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  badge?: string;
  isTheme?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'notifications-outline', label: 'Notifications', route: '/(tabs)/settings' },
      { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/(tabs)/privacy' },
    ],
  },
  {
    title: 'AI & Preferences',
    items: [
      { icon: 'sparkles-outline', label: 'AI Model', route: '/(tabs)/profile', badge: 'GPT-4' },
      { icon: 'language-outline', label: 'Language', route: '/(tabs)/profile', badge: 'English' },
      { icon: 'color-palette-outline', label: 'Appearance', route: '/(tabs)/profile', isTheme: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: '/(tabs)/resources/help-center' },
      { icon: 'document-text-outline', label: 'Terms of Service', route: '/(tabs)/terms' },
      { icon: 'information-circle-outline', label: 'About', route: '/(tabs)/about', badge: 'v1.0.0' },
    ],
  },
];

interface Skill { id: string; name: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert'; }
interface Experience { id: string; company: string; role: string; startDate: string; endDate: string; description: string; }
interface Education { id: string; school: string; degree: string; field: string; startYear: string; endYear: string; }
interface Certificate { id: string; name: string; issuer: string; date: string; url: string; }
interface Achievement { id: string; title: string; description: string; icon: string; }
interface PortfolioLink { id: string; label: string; url: string; icon: keyof typeof Ionicons.glyphMap; }
interface SocialLink { id: string; platform: string; handle: string; url: string; icon: keyof typeof Ionicons.glyphMap; }

const DEFAULT_SKILLS: Skill[] = [
  { id: '1', name: 'React Native', level: 'advanced' },
  { id: '2', name: 'TypeScript', level: 'advanced' },
  { id: '3', name: 'Node.js', level: 'intermediate' },
  { id: '4', name: 'Python', level: 'intermediate' },
  { id: '5', name: 'UI/UX Design', level: 'beginner' },
];

const DEFAULT_EXPERIENCE: Experience[] = [
  { id: '1', company: 'TechCorp Inc.', role: 'Senior Frontend Developer', startDate: 'Jan 2023', endDate: 'Present', description: 'Building cross-platform mobile apps with React Native.' },
  { id: '2', company: 'StartupXYZ', role: 'Full Stack Developer', startDate: 'Jun 2021', endDate: 'Dec 2022', description: 'Developed web and mobile solutions for clients.' },
];

const DEFAULT_EDUCATION: Education[] = [
  { id: '1', school: 'University of Technology', degree: "Bachelor's", field: 'Computer Science', startYear: '2017', endYear: '2021' },
];

const DEFAULT_CERTIFICATES: Certificate[] = [
  { id: '1', name: 'React Native Specialist', issuer: 'Meta', date: 'Mar 2024', url: '' },
  { id: '2', name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: 'Jan 2024', url: '' },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: '50 Applications', description: 'Submitted 50 job applications', icon: 'rocket' },
  { id: '2', title: '5 Interviews', description: 'Completed 5 interviews', icon: 'chatbubbles' },
  { id: '3', title: 'Top Performer', description: 'Top 10% of job seekers this month', icon: 'trophy' },
];

const DEFAULT_PORTFOLIO: PortfolioLink[] = [
  { id: '1', label: 'Portfolio', url: 'https://portfolio.dev', icon: 'globe-outline' },
  { id: '2', label: 'GitHub', url: 'https://github.com/username', icon: 'logo-github' },
  { id: '3', label: 'LinkedIn', url: 'https://linkedin.com/in/username', icon: 'logo-linkedin' },
];

const DEFAULT_SOCIAL: SocialLink[] = [
  { id: '1', platform: 'Twitter', handle: '@username', url: 'https://twitter.com/username', icon: 'logo-twitter' },
  { id: '2', platform: 'Instagram', handle: '@username', url: 'https://instagram.com/username', icon: 'logo-instagram' },
];

function SkillLevelBadge({ level }: { level: Skill['level'] }) {
  const config = {
    beginner: { label: 'Beginner', color: colors.warning },
    intermediate: { label: 'Intermediate', color: colors.info },
    advanced: { label: 'Advanced', color: colors.primary },
    expert: { label: 'Expert', color: colors.secondary },
  };
  const c = config[level];
  return (
    <View style={[s.skillLevelBadge, { backgroundColor: c.color + '18' }]}>
      <View style={[s.skillLevelDot, { backgroundColor: c.color }]} />
      <Text style={[s.skillLevelText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

function MenuRow({ item, theme, onThemeChange }: {
  item: MenuItem; theme: ThemeMode; onThemeChange: (t: ThemeMode) => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => item.isTheme ? null : router.push(item.route as any)}
        onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
        style={s.menuRow}
      >
        <View style={s.menuIconRing}>
          <Ionicons name={item.icon} size={18} color={colors.textSecondary} />
        </View>
        <Text style={s.menuLabel}>{item.label}</Text>
        <View style={s.menuRight}>
          {item.badge && !item.isTheme && (
            <Text style={s.menuBadge}>{item.badge}</Text>
          )}
          {item.isTheme ? (
            <View style={s.themeOptions}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
                const active = theme === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => onThemeChange(mode)}
                    style={[s.themeOption, active && s.themeOptionActive]}
                  >
                    <Ionicons
                      name={
                        mode === 'light' ? 'sunny-outline' :
                        mode === 'dark' ? 'moon-outline' : 'settings-outline'
                      }
                      size={13}
                      color={active ? colors.white : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  sections: { key: string; label: string; }[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  skills: Skill[];
  onSkillsChange: (s: Skill[]) => void;
  experience: Experience[];
  onExperienceChange: (e: Experience[]) => void;
  education: Education[];
  onEducationChange: (e: Education[]) => void;
  certificates: Certificate[];
  onCertificatesChange: (c: Certificate[]) => void;
  achievements: Achievement[];
  onAchievementsChange: (a: Achievement[]) => void;
  portfolio: PortfolioLink[];
  onPortfolioChange: (p: PortfolioLink[]) => void;
  social: SocialLink[];
  onSocialChange: (s: SocialLink[]) => void;
  phone: string;
  onPhoneChange: (p: string) => void;
  location: string;
  onLocationChange: (l: string) => void;
  bio: string;
  onBioChange: (b: string) => void;
}

function EditModal({
  visible, onClose, sections, activeSection, onSectionChange,
  skills, onSkillsChange, experience, onExperienceChange,
  education, onEducationChange, certificates, onCertificatesChange,
  achievements, onAchievementsChange, portfolio, onPortfolioChange,
  social, onSocialChange, phone, onPhoneChange, location, onLocationChange, bio, onBioChange,
}: EditModalProps) {
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <View style={{ gap: spacing.md }}>
            <View>
              <Text style={s.modalFieldLabel}>Bio</Text>
              <TextInput style={s.modalInput} value={bio} onChangeText={onBioChange} multiline numberOfLines={3} placeholder="Tell us about yourself..." placeholderTextColor={colors.textMuted} />
            </View>
            <View>
              <Text style={s.modalFieldLabel}>Phone</Text>
              <TextInput style={s.modalInput} value={phone} onChangeText={onPhoneChange} placeholder="+1 (555) 123-4567" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
            </View>
            <View>
              <Text style={s.modalFieldLabel}>Location</Text>
              <TextInput style={s.modalInput} value={location} onChangeText={onLocationChange} placeholder="San Francisco, CA" placeholderTextColor={colors.textMuted} />
            </View>
          </View>
        );
      case 'skills':
        return (
          <View style={{ gap: spacing.sm }}>
            <Text style={s.modalHint}>Tap a skill to remove. Add new skills below.</Text>
            <View style={s.modalChipContainer}>
              {skills.map((skill) => (
                <TouchableOpacity key={skill.id} style={s.modalChip} onPress={() => onSkillsChange(skills.filter(s => s.id !== skill.id))}>
                  <Text style={s.modalChipText}>{skill.name}</Text>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                style={[s.modalInput, { flex: 1 }]}
                placeholder="Add skill..." placeholderTextColor={colors.textMuted}
                onSubmitEditing={(e) => {
                  const name = e.nativeEvent.text.trim();
                  if (name) {
                    onSkillsChange([...skills, { id: Date.now().toString(), name, level: 'intermediate' }]);
                    (e.target as any)?.clear?.();
                  }
                }}
                returnKeyType="done"
              />
            </View>
          </View>
        );
      case 'experience':
        return (
          <View style={{ gap: spacing.md }}>
            {experience.map((exp) => (
              <View key={exp.id} style={s.modalExpCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.modalExpRole}>{exp.role}</Text>
                  <TouchableOpacity onPress={() => onExperienceChange(experience.filter(e => e.id !== exp.id))}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={s.modalExpCompany}>{exp.company}</Text>
                <Text style={s.modalExpDate}>{exp.startDate} — {exp.endDate}</Text>
                <Text style={s.modalExpDesc}>{exp.description}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={s.modalAddBtn}
              onPress={() => {
                const newExp: Experience = {
                  id: Date.now().toString(), company: '', role: '',
                  startDate: '', endDate: '', description: '',
                };
                onExperienceChange([...experience, newExp]);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={s.modalAddBtnText}>Add Experience</Text>
            </TouchableOpacity>
          </View>
        );
      case 'education':
        return (
          <View style={{ gap: spacing.md }}>
            {education.map((edu) => (
              <View key={edu.id} style={s.modalExpCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.modalExpRole}>{edu.degree} in {edu.field}</Text>
                  <TouchableOpacity onPress={() => onEducationChange(education.filter(e => e.id !== edu.id))}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={s.modalExpCompany}>{edu.school}</Text>
                <Text style={s.modalExpDate}>{edu.startYear} — {edu.endYear}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={s.modalAddBtn}
              onPress={() => {
                const newEdu: Education = {
                  id: Date.now().toString(), school: '', degree: '',
                  field: '', startYear: '', endYear: '',
                };
                onEducationChange([...education, newEdu]);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={s.modalAddBtnText}>Add Education</Text>
            </TouchableOpacity>
          </View>
        );
      case 'certificates':
        return (
          <View style={{ gap: spacing.md }}>
            {certificates.map((cert) => (
              <View key={cert.id} style={s.modalExpCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.modalExpRole}>{cert.name}</Text>
                  <TouchableOpacity onPress={() => onCertificatesChange(certificates.filter(c => c.id !== cert.id))}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={s.modalExpCompany}>{cert.issuer}</Text>
                <Text style={s.modalExpDate}>{cert.date}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={s.modalAddBtn}
              onPress={() => {
                const newCert: Certificate = {
                  id: Date.now().toString(), name: '', issuer: '', date: '', url: '',
                };
                onCertificatesChange([...certificates, newCert]);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={s.modalAddBtnText}>Add Certificate</Text>
            </TouchableOpacity>
          </View>
        );
      case 'portfolio':
        return (
          <View style={{ gap: spacing.md }}>
            {portfolio.map((link) => (
              <View key={link.id} style={s.modalExpCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Ionicons name={link.icon} size={16} color={colors.primary} />
                    <Text style={s.modalExpRole}>{link.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onPortfolioChange(portfolio.filter(p => p.id !== link.id))}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={s.modalExpDate}>{link.url}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={s.modalAddBtn}
              onPress={() => {
                const newLink: PortfolioLink = {
                  id: Date.now().toString(), label: '', url: '', icon: 'globe-outline',
                };
                onPortfolioChange([...portfolio, newLink]);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={s.modalAddBtnText}>Add Link</Text>
            </TouchableOpacity>
          </View>
        );
      case 'social':
        return (
          <View style={{ gap: spacing.md }}>
            {social.map((link) => (
              <View key={link.id} style={s.modalExpCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Ionicons name={link.icon} size={16} color={colors.primary} />
                    <Text style={s.modalExpRole}>{link.platform}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onSocialChange(social.filter(s => s.id !== link.id))}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={s.modalExpDate}>{link.handle}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={s.modalAddBtn}
              onPress={() => {
                const newLink: SocialLink = {
                  id: Date.now().toString(), platform: '', handle: '', url: '', icon: 'logo-twitter',
                };
                onSocialChange([...social, newLink]);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={s.modalAddBtnText}>Add Social Account</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose}>
          <BlurView intensity={20} tint="dark" style={{ flex: 1 }} />
        </TouchableOpacity>
        <Animated.View entering={SlideInDown.springify().damping(20)} exiting={SlideOutDown.springify().damping(20)} style={s.modalSheet}>
          <View style={s.modalHandle} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.modalTabs} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}>
            {sections.map((sec) => (
              <TouchableOpacity
                key={sec.key}
                style={[s.modalTab, activeSection === sec.key && s.modalTabActive]}
                onPress={() => onSectionChange(sec.key)}
              >
                <Text style={[s.modalTabText, activeSection === sec.key && s.modalTabTextActive]}>{sec.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView style={s.modalContent} contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
            {renderSectionContent()}
          </ScrollView>
          <View style={s.modalFooter}>
            <TouchableOpacity style={s.modalSaveBtn} onPress={onClose}>
              <LinearGradient colors={colors.gradient.primary} style={s.modalSaveBtnGrad}>
                <Text style={s.modalSaveBtnText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [notifications, setNotifications] = useState(true);
  const [usageData, setUsageData] = useState<any>({});
  const dash = useDashboardStore();

  const [editVisible, setEditVisible] = useState(false);
  const [editSection, setEditSection] = useState('basic');

  const [bio, setBio] = useState('Passionate software developer building impactful applications.');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [location, setLocation] = useState('San Francisco, CA');
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [experience, setExperience] = useState<Experience[]>(DEFAULT_EXPERIENCE);
  const [education, setEducation] = useState<Education[]>(DEFAULT_EDUCATION);
  const [certificates, setCertificates] = useState<Certificate[]>(DEFAULT_CERTIFICATES);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [portfolio, setPortfolio] = useState<PortfolioLink[]>(DEFAULT_PORTFOLIO);
  const [social, setSocial] = useState<SocialLink[]>(DEFAULT_SOCIAL);
  const [resumes, setResumes] = useState<any[]>([]);

  const scrollY = useSharedValue(0);

  const editSections = [
    { key: 'basic', label: 'Basic' },
    { key: 'skills', label: 'Skills' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'social', label: 'Social' },
  ];

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await Promise.resolve({ data: { data: {} } });
      setUsageData(res.data.data || {});
    } catch {}
  }, []);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeApi.list();
      setResumes(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchAnalytics(); fetchResumes(); }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const usagePercent = Math.min((usageData.daily_usage_count || 0) / (usageData.daily_limit || 100) * 100, 100);

  const completedSections = [bio, phone, location, skills.length > 0, experience.length > 0, education.length > 0, certificates.length > 0, portfolio.length > 0, social.length > 0].filter(Boolean).length;
  const totalSections = 9;
  const profileCompletion = Math.round((completedSections / totalSections) * 100);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 200], [0, -60], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollY.value, [0, 150], [1, 0.6], Extrapolation.CLAMP),
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, 200], [0, -20], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [0, 200], [1, 0.85], Extrapolation.CLAMP) },
    ],
  }));

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        const formData = new FormData();
        formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as any);
        await resumeApi.upload(formData);
        fetchResumes();
      }
    } catch {}
  };

  const openLink = (url: string) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const getPlanColor = () => {
    if (user?.plan_tier === 'pro') return colors.gradient.purple;
    if (user?.plan_tier === 'team') return colors.gradient.indigo;
    return colors.gradient.blue;
  };

  const getPlanLabel = () => {
    if (user?.plan_tier === 'pro') return 'Pro Plan';
    if (user?.plan_tier === 'team') return 'Team Plan';
    return 'Free Plan';
  };

  const handleUpgrade = () => {
    router.push('/(tabs)/settings');
  };

  return (
    <View style={s.container}>
      <Animated.ScrollView
        onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: getTabListBottomPadding() + spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[s.coverWrap, headerAnimatedStyle]}>
          <LinearGradient colors={['#3B82F6', '#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.coverGradient}>
            <BlurView intensity={30} tint="dark" style={s.coverBlur} />
          </LinearGradient>
          <View style={[s.coverContent, { paddingTop: insets.top + spacing.lg, paddingHorizontal: horizontalPadding }]}>
            <View style={s.coverTopRow}>
              <Text style={s.coverTitle}>Profile</Text>
              <TouchableOpacity style={s.editBtn} onPress={() => setEditVisible(true)}>
                <LinearGradient colors={colors.gradient.primary} style={s.editBtnGrad}>
                  <Ionicons name="pencil" size={14} color={colors.white} />
                  <Text style={s.editBtnText}>Edit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Animated.View style={[s.avatarSection, avatarAnimatedStyle]}>
              <LinearGradient colors={['#3B82F6', '#6366F1', '#8B5CF6']} style={s.avatar}>
                <Text style={s.avatarText}>{getInitials(user?.name || 'User')}</Text>
              </LinearGradient>
              <View style={s.avatarInfo}>
                <Text style={s.profileName} numberOfLines={1}>{user?.name || 'User'}</Text>
                <Text style={s.profileEmail} numberOfLines={1}>{user?.email || 'user@example.com'}</Text>
                {location ? <Text style={s.profileLocation}><Ionicons name="location-outline" size={12} color={colors.textMuted} /> {location}</Text> : null}
                <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
                  {user?.plan_tier && (
                    <Badge
                      label={user.plan_tier === 'pro' ? 'Pro' : user.plan_tier === 'team' ? 'Team' : 'Free'}
                      variant={user.plan_tier !== 'free' ? 'premium' : 'default'}
                      size="sm"
                      animated
                    />
                  )}
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            <GlassCard style={s.profileCompletionCard} glowColor={colors.primary}>
              <View style={s.profileCompletionHeader}>
                <Text style={s.profileCompletionTitle}>Profile Completion</Text>
                <Text style={s.profileCompletionPercent}>{profileCompletion}%</Text>
              </View>
              <View style={s.profileCompletionBarBg}>
                <View style={[s.profileCompletionBarFill, { width: `${profileCompletion}%` }]} />
              </View>
              <Text style={s.profileCompletionSub}>{completedSections}/{totalSections} sections completed</Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify().damping(14)}>
            <GlassCard style={s.statsCard} glowColor={colors.primary}>
              <View style={s.statsGrid}>
                <View style={s.statCell}>
                  <AnimatedCounter value={dash.totalApplications} style={s.statNumber} spring />
                  <Text style={s.statLabel}>Applications</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statCell}>
                  <AnimatedCounter value={dash.interviewsScheduled} style={s.statNumber} spring />
                  <Text style={s.statLabel}>Interviews</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statCell}>
                  <AnimatedCounter value={dash.currentStreak} style={s.statNumber} spring />
                  <Text style={s.statLabel}>Day Streak</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
            <GlassCard style={s.usageCard} glowColor={colors.secondary}>
              <View style={s.usageHeader}>
                <Text style={s.usageTitle}>Daily Usage</Text>
                <Text style={s.usageCount}>
                  {usageData.daily_usage_count || 0} / {usageData.daily_limit || 100}
                </Text>
              </View>
              <View style={s.usageBarBg}>
                <View style={[s.usageBarFill, { width: `${usagePercent}%` }]} />
              </View>
              <Text style={s.usageReset}>
                Resets {usageData.usage_reset_at ? new Date(usageData.usage_reset_at).toLocaleDateString() : 'daily'}
              </Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.indigo}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.indigo} style={s.sectionIconRing}>
                  <Ionicons name="code-slash" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Skills</Text>
              </View>
              <View style={s.skillsWrap}>
                {skills.map((skill) => (
                  <View key={skill.id} style={s.skillChip}>
                    <Text style={s.skillChipText}>{skill.name}</Text>
                    <SkillLevelBadge level={skill.level} />
                  </View>
                ))}
                {skills.length === 0 && <Text style={s.emptyText}>No skills added yet</Text>}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.teal}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.teal} style={s.sectionIconRing}>
                  <Ionicons name="briefcase" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Experience</Text>
              </View>
              {experience.map((exp, idx) => (
                <View key={exp.id}>
                  {idx > 0 && <View style={s.expDivider} />}
                  <View style={s.expCard}>
                    <View style={s.expDotRow}>
                      <View style={s.expDot} />
                      {idx < experience.length - 1 && <View style={s.expLine} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.expRole}>{exp.role}</Text>
                      <Text style={s.expCompany}>{exp.company}</Text>
                      <Text style={s.expDate}>{exp.startDate} — {exp.endDate}</Text>
                      {exp.description ? <Text style={s.expDesc}>{exp.description}</Text> : null}
                    </View>
                  </View>
                </View>
              ))}
              {experience.length === 0 && <Text style={s.emptyText}>No experience added yet</Text>}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.violet}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.purple} style={s.sectionIconRing}>
                  <Ionicons name="school" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Education</Text>
              </View>
              {education.map((edu) => (
                <View key={edu.id} style={s.eduCard}>
                  <View style={s.eduIconWrap}>
                    <Ionicons name="library" size={20} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.eduDegree}>{edu.degree} in {edu.field}</Text>
                    <Text style={s.eduSchool}>{edu.school}</Text>
                    <Text style={s.expDate}>{edu.startYear} — {edu.endYear}</Text>
                  </View>
                </View>
              ))}
              {education.length === 0 && <Text style={s.emptyText}>No education added yet</Text>}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.emerald}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.success} style={s.sectionIconRing}>
                  <Ionicons name="document-text" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Resume</Text>
              </View>
              {resumes.length > 0 ? (
                <View style={{ gap: spacing.sm }}>
                  {resumes.map((r: any) => (
                    <TouchableOpacity key={r.id} style={s.resumeCard} onPress={() => openLink(r.file_url)}>
                      <LinearGradient colors={colors.gradient.primary} style={s.resumeIconWrap}>
                        <Ionicons name="document" size={18} color={colors.white} />
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={s.resumeName}>{r.original_filename}</Text>
                        <Text style={s.resumeDate}>Uploaded {new Date(r.created_at).toLocaleDateString()}</Text>
                      </View>
                      <Ionicons name="download-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={s.emptyText}>No resumes uploaded yet</Text>
              )}
              <TouchableOpacity style={s.uploadBtn} onPress={pickResume}>
                <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
                <Text style={s.uploadBtnText}>Upload Resume</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.amber}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.warning} style={s.sectionIconRing}>
                  <Ionicons name="ribbon" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Certificates</Text>
              </View>
              {certificates.map((cert) => (
                <View key={cert.id} style={s.certCard}>
                  <LinearGradient colors={colors.gradient.warning} style={s.certIconWrap}>
                    <Ionicons name="ribbon-outline" size={18} color={colors.white} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={s.certName}>{cert.name}</Text>
                    <Text style={s.certIssuer}>{cert.issuer}</Text>
                    <Text style={s.certDate}>{cert.date}</Text>
                  </View>
                  {cert.url ? (
                    <TouchableOpacity onPress={() => openLink(cert.url)}>
                      <Ionicons name="open-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
              {certificates.length === 0 && <Text style={s.emptyText}>No certificates added yet</Text>}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.rose}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.coral} style={s.sectionIconRing}>
                  <Ionicons name="trophy" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Achievements</Text>
              </View>
              <View style={s.achievementsGrid}>
                {achievements.map((ach) => (
                  <View key={ach.id} style={s.achievementCard}>
                    <LinearGradient colors={colors.gradient.nebula} style={s.achievementIcon}>
                      <Ionicons name={ach.icon as any} size={20} color={colors.white} />
                    </LinearGradient>
                    <Text style={s.achievementTitle}>{ach.title}</Text>
                    <Text style={s.achievementDesc}>{ach.description}</Text>
                  </View>
                ))}
              </View>
              {achievements.length === 0 && <Text style={s.emptyText}>No achievements yet</Text>}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(550).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.blue}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.blue} style={s.sectionIconRing}>
                  <Ionicons name="link" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Portfolio & Links</Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                {portfolio.map((link) => (
                  <TouchableOpacity key={link.id} style={s.linkRow} onPress={() => openLink(link.url)}>
                    <View style={s.linkIconRing}>
                      <Ionicons name={link.icon} size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.linkLabel}>{link.label}</Text>
                      <Text style={s.linkUrl} numberOfLines={1}>{link.url}</Text>
                    </View>
                    <Ionicons name="open-outline" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={colors.accent.blue}>
              <View style={s.sectionHeader}>
                <LinearGradient colors={colors.gradient.aurora} style={s.sectionIconRing}>
                  <Ionicons name="people" size={16} color={colors.white} />
                </LinearGradient>
                <Text style={s.sectionTitle}>Social</Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                {social.map((link) => (
                  <TouchableOpacity key={link.id} style={s.linkRow} onPress={() => openLink(link.url)}>
                    <View style={s.linkIconRing}>
                      <Ionicons name={link.icon} size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.linkLabel}>{link.platform}</Text>
                      <Text style={s.linkUrl}>{link.handle}</Text>
                    </View>
                    <Ionicons name="open-outline" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(650).springify().damping(14)}>
            <GlassCard style={s.sectionCard} glowColor={user?.plan_tier !== 'free' ? colors.accent.amber : undefined}>
              <View style={s.planCard}>
                <LinearGradient colors={getPlanColor()} style={s.planGradient}>
                  <Ionicons name={user?.plan_tier !== 'free' ? 'diamond' : 'rocket'} size={24} color={colors.white} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={s.planName}>{getPlanLabel()}</Text>
                  <Text style={s.planDesc}>
                    {user?.plan_tier === 'pro' ? 'Unlimited access to all features' :
                     user?.plan_tier === 'team' ? 'For teams and organizations' :
                     'Basic features with daily limits'}
                  </Text>
                </View>
                {user?.plan_tier === 'free' && (
                  <TouchableOpacity onPress={handleUpgrade}>
                    <LinearGradient colors={colors.gradient.primary} style={s.upgradeBtn}>
                      <Text style={s.upgradeBtnText}>Upgrade</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {MENU_SECTIONS.map((section, sIdx) => (
            <Animated.View key={section.title} entering={FadeInUp.delay(700 + sIdx * 60).springify().damping(14)}>
              <Text style={s.sectionTitleLabel}>{section.title}</Text>
              <GlassCard style={s.menuCard}>
                {section.items.map((item, iIdx) => (
                  <React.Fragment key={iIdx}>
                    {iIdx > 0 && <View style={s.menuDivider} />}
                    <MenuRow item={item} theme={theme} onThemeChange={setTheme} />
                  </React.Fragment>
                ))}
              </GlassCard>
            </Animated.View>
          ))}

          <Animated.View entering={FadeInUp.delay(900).springify().damping(14)}>
            <Text style={s.sectionTitleLabel}>Notifications</Text>
            <GlassCard style={s.menuCard}>
              <View style={s.switchRow}>
                <View style={s.menuIconRing}>
                  <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
                </View>
                <Text style={s.switchLabel}>Push Notifications</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.borderLight, true: colors.primaryBg }}
                  thumbColor={notifications ? colors.primary : colors.textMuted}
                />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(950).springify().damping(14)}>
            <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
              <Text style={s.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={s.version}>JobPilot AI v1.0.0</Text>
        </View>
      </Animated.ScrollView>

      <EditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        sections={editSections}
        activeSection={editSection}
        onSectionChange={setEditSection}
        skills={skills}
        onSkillsChange={setSkills}
        experience={experience}
        onExperienceChange={setExperience}
        education={education}
        onEducationChange={setEducation}
        certificates={certificates}
        onCertificatesChange={setCertificates}
        achievements={achievements}
        onAchievementsChange={setAchievements}
        portfolio={portfolio}
        onPortfolioChange={setPortfolio}
        social={social}
        onSocialChange={setSocial}
        phone={phone}
        onPhoneChange={setPhone}
        location={location}
        onLocationChange={setLocation}
        bio={bio}
        onBioChange={setBio}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  coverWrap: { overflow: 'hidden' },
  coverGradient: { height: 240, position: 'relative' },
  coverBlur: { ...StyleSheet.absoluteFillObject },
  coverContent: { position: 'absolute', inset: 0 },
  coverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coverTitle: { color: colors.white, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  editBtn: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  editBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg },
  editBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  avatarSection: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  avatarInfo: { flex: 1, marginLeft: spacing.md },
  profileName: { color: colors.white, fontSize: 22, fontWeight: '700' },
  profileEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 1 },
  profileLocation: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  profileCompletionCard: { padding: spacing.md, marginBottom: spacing.md, marginTop: spacing.md },
  profileCompletionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  profileCompletionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  profileCompletionPercent: { fontSize: 15, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'] },
  profileCompletionBarBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  profileCompletionBarFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  profileCompletionSub: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  statsCard: { padding: spacing.md, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statCell: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.borderLight },
  usageCard: { padding: spacing.md, marginBottom: spacing.md },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  usageTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  usageCount: { fontSize: 13, fontWeight: '600', color: colors.primary },
  usageBarBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  usageBarFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  usageReset: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  sectionCard: { padding: spacing.md, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionIconRing: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionTitleLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: {
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  skillChipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  skillLevelBadge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  skillLevelDot: { width: 5, height: 5, borderRadius: 2.5 },
  skillLevelText: { fontSize: 10, fontWeight: '600' },
  expCard: { flexDirection: 'row', gap: spacing.md },
  expDotRow: { alignItems: 'center', width: 12 },
  expDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
  expLine: { width: 2, flex: 1, backgroundColor: colors.borderLight, marginTop: 4 },
  expDivider: { height: spacing.md },
  expRole: { color: colors.text, fontSize: 15, fontWeight: '600' },
  expCompany: { color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 1 },
  expDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  expDesc: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs, lineHeight: 18 },
  eduCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  eduIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.secondaryBg, justifyContent: 'center', alignItems: 'center' },
  eduDegree: { color: colors.text, fontSize: 15, fontWeight: '600' },
  eduSchool: { color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 1 },
  resumeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md },
  resumeIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  resumeName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  resumeDate: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: colors.primary + '40', borderRadius: borderRadius.md, borderStyle: 'dashed' },
  uploadBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  certCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  certIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  certName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  certIssuer: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  certDate: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  achievementCard: { width: '47%', backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', gap: spacing.xs },
  achievementIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementTitle: { color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  achievementDesc: { color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 14 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  linkIconRing: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center' },
  linkLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  linkUrl: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planGradient: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  planName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  planDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  upgradeBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.lg },
  upgradeBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  menuCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  menuIconRing: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  menuLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  menuBadge: { color: colors.textMuted, fontSize: 13 },
  menuDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.sm },
  themeOptions: { flexDirection: 'row', gap: 4 },
  themeOption: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.borderLight },
  themeOptionActive: { backgroundColor: colors.primary },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  switchLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500', marginLeft: spacing.sm },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, marginTop: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.errorLight },
  logoutText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  version: { color: colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: spacing.lg },
  emptyText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.sm },

  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl, maxHeight: '85%',
    ...shadow.xl,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderLight, alignSelf: 'center', marginTop: spacing.sm },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalTabs: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight },
  modalTabActive: { backgroundColor: colors.primary },
  modalTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  modalTabTextActive: { color: colors.white },
  modalContent: { paddingBottom: spacing.lg },
  modalFieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  modalInput: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border },
  modalHint: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  modalChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  modalChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryBg, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modalChipText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  modalExpCard: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  modalExpRole: { color: colors.text, fontSize: 14, fontWeight: '600' },
  modalExpCompany: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  modalExpDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  modalExpDesc: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs },
  modalAddBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.primary + '40', borderRadius: borderRadius.md, borderStyle: 'dashed' },
  modalAddBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  modalFooter: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight },
  modalSaveBtn: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  modalSaveBtnGrad: { paddingVertical: spacing.md, alignItems: 'center', borderRadius: borderRadius.lg },
  modalSaveBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
