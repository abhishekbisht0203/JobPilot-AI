import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import {
  X,
  Menu,
  House,
  Briefcase,
  Building2,
  CreditCard,
  Phone,
  Info,
  Sparkles,
  FileText,
  Mic,
  DollarSign,
  MapPin,
  ClipboardCheck,
  BookOpen,
  Lightbulb,
  CircleQuestionMark,
  Heart,
  Send,
  Bell,
  MessageSquare,
  Eye,
  Sun,
  Moon,
  Monitor,
  Globe,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Shield,
  AtSign,
  GitFork,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadow } from '../../lib/theme';
import { useAuthStore, useDrawerStore, useThemeStore } from '../../store';
import { ThemeMode } from '../../types';

export default function Drawer() {
  const { isOpen, close } = useDrawerStore();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 400);
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { stiffness: 300, damping: 28 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH, { stiffness: 300, damping: 28 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={close}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      </Animated.View>

      <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, paddingTop: insets.top }, drawerStyle]}>
        <DrawerContent close={close} insets={insets} drawerWidth={DRAWER_WIDTH} />
      </Animated.View>
    </View>
  );
}

function DrawerContent({ close, insets, drawerWidth }: { close: () => void; insets: any; drawerWidth: number }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = useCallback((route: string) => {
    close();
    setTimeout(() => router.push(route as any), 200);
  }, [close, router]);

  const handleLogout = useCallback(() => {
    close();
    setTimeout(() => { logout(); router.replace('/(auth)/login' as any); }, 200);
  }, [close, logout, router]);

  return (
    <View style={styles.drawerInner}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        bounces={true}
      >
        <DrawerHeader close={close} />
        <UserSection user={user} isAuthenticated={isAuthenticated} handleNav={handleNav} />
        <NavSection pathname={pathname} handleNav={handleNav} />
        <CareerToolsSection handleNav={handleNav} />
        <ResourcesSection handleNav={handleNav} />
        <QuickActionsSection handleNav={handleNav} drawerWidth={drawerWidth} />
        <ThemeSection />
        <DrawerFooter handleNav={handleNav} handleLogout={handleLogout} isAuthenticated={isAuthenticated} />
      </ScrollView>
    </View>
  );
}

function DrawerHeader({ close }: { close: () => void }) {
  return (
    <LinearGradient
      colors={['rgba(59,130,246,0.06)', 'rgba(139,92,246,0.04)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerLeft}>
        <LinearGradient
          colors={['#3B82F6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerLogo}
        >
          <Briefcase size={18} color="#FFF" />
        </LinearGradient>
        <View>
          <Text style={styles.headerTitle}>JobPilot AI</Text>
          <Text style={styles.headerTagline}>Find Your Dream Career</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={close}
        style={styles.closeButton}
        accessibilityLabel="Close navigation menu"
        accessibilityRole="button"
      >
        <X size={20} color={colors.text} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

function UserSection({
  user,
  isAuthenticated,
  handleNav,
}: {
  user: any;
  isAuthenticated: boolean;
  handleNav: (route: string) => void;
}) {
  if (isAuthenticated && user) {
    const completion = user.plan_tier === 'pro' ? 100 : Math.min(Math.floor(Math.random() * 40) + 50, 95);
    return (
      <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.userSection}>
        <LinearGradient
          colors={['rgba(59,130,246,0.04)', 'rgba(139,92,246,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCard}
        >
          <View style={styles.userRow}>
            <LinearGradient
              colors={user.plan_tier === 'pro' ? ['#8B5CF6', '#6366F1'] : ['#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                {user.plan_tier === 'pro' && (
                  <LinearGradient
                    colors={['#8B5CF6', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.premiumBadge}
                  >
                    <Sparkles size={10} color="#FFF" />
                    <Text style={styles.premiumText}>PRO</Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${completion}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{completion}%</Text>
          </View>

          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => handleNav('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <User size={14} color={colors.primary} />
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.userSection}>
      <LinearGradient
        colors={['rgba(59,130,246,0.03)', 'rgba(139,92,246,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.guestCard}
      >
        <View style={styles.guestIconContainer}>
          <LinearGradient
            colors={['#3B82F6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guestIconCircle}
          >
            <Briefcase size={24} color="#FFF" />
          </LinearGradient>
        </View>
        <Text style={styles.guestTitle}>Get Started</Text>
        <Text style={styles.guestSubtitle}>Sign up to unlock your dream career</Text>
        <View style={styles.guestButtons}>
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => handleNav('/(auth)/register')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signupBtnGradient}
            >
              <Text style={styles.signupBtnText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => handleNav('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  desc: string;
  route: string;
}

const MAIN_NAV: NavItem[] = [
  { icon: <House size={20} color="#3B82F6" />, label: 'Home', desc: 'Back to dashboard', route: '/(tabs)' },
  { icon: <Briefcase size={20} color="#8B5CF6" />, label: 'Find Jobs', desc: 'Browse thousands of jobs', route: '/(tabs)/find-jobs' },
  { icon: <Building2 size={20} color="#10B981" />, label: 'Browse Companies', desc: 'Explore top employers', route: '/(tabs)/browse-companies' },
  { icon: <CreditCard size={20} color="#F59E0B" />, label: 'Pricing', desc: 'Choose your plan', route: '/(tabs)/pricing' },
  { icon: <Phone size={20} color="#EC4899" />, label: 'Contact', desc: 'Get in touch', route: '/(tabs)/contact' },
  { icon: <Info size={20} color="#06B6D4" />, label: 'About', desc: 'Learn about JobPilot AI', route: '/(tabs)/about' },
  { icon: <ShieldCheck size={20} color="#EF4444" />, label: 'Admin', desc: 'Manage platform', route: '/(tabs)/admin' },
];

function NavSection({ pathname, handleNav }: { pathname: string; handleNav: (route: string) => void }) {
  return (
    <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>NAVIGATION</Text>
      <View style={styles.navList}>
        {MAIN_NAV.map((item, i) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.7}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                {item.icon}
              </View>
              <View style={styles.navTextWrap}>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                <Text style={[styles.navDesc, isActive && styles.navDescActive]}>{item.desc}</Text>
              </View>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

interface ToolItem {
  icon: React.ReactNode;
  label: string;
  desc: string;
  route: string;
  color: string;
}

const TOOLS: ToolItem[] = [
  { icon: <Sparkles size={18} color="#FFF" />, label: 'AI Resume Builder', desc: 'Create ATS-friendly resumes', route: '/generate/resume-version', color: '#3B82F6' },
  { icon: <FileText size={18} color="#FFF" />, label: 'Cover Letter', desc: 'Generate personalized cover letters', route: '/generate/cover-letter', color: '#8B5CF6' },
  { icon: <ClipboardCheck size={18} color="#FFF" />, label: 'Resume Checker', desc: 'Check ATS score', route: '/(tabs)/career-tools/resume-checker', color: '#06B6D4' },
  { icon: <Mic size={18} color="#FFF" />, label: 'Mock Interview', desc: 'Practice with AI', route: '/ai/mock-interview', color: '#10B981' },
  { icon: <DollarSign size={18} color="#FFF" />, label: 'Salary Explorer', desc: 'Compare salaries worldwide', route: '/(tabs)/career-tools/salary-explorer', color: '#F59E0B' },
  { icon: <MapPin size={18} color="#FFF" />, label: 'Career Roadmap', desc: 'Plan your growth', route: '/(tabs)/career-tools/career-roadmap', color: '#EC4899' },
  { icon: <BookOpen size={18} color="#FFF" />, label: 'Interview Prep', desc: 'Practice questions', route: '/(tabs)/career-tools/interview-prep', color: '#06B6D4' },
  { icon: <Shield size={18} color="#FFF" />, label: 'ATS Score', desc: 'Analyze your resume', route: '/(tabs)/career-tools/ats-score', color: '#F59E0B' },
];

interface ResourceItem {
  icon: React.ReactNode;
  label: string;
  desc: string;
  route?: string;
  color: string;
}

const RESOURCES: ResourceItem[] = [
  { icon: <BookOpen size={18} color="#FFF" />, label: 'Blogs', desc: 'Career advice & insights', route: '/(tabs)/resources/blogs', color: '#3B82F6' },
  { icon: <Lightbulb size={18} color="#FFF" />, label: 'Career Guides', desc: 'Step-by-step guidance', route: '/(tabs)/resources/career-guides', color: '#8B5CF6' },
  { icon: <CircleQuestionMark size={18} color="#FFF" />, label: 'Interview Questions', desc: 'Common Q&A', route: '/(tabs)/resources/interview-questions', color: '#10B981' },
  { icon: <FileText size={18} color="#FFF" />, label: 'Resume Templates', desc: 'Professional templates', route: '/(tabs)/resources/resume-templates', color: '#F59E0B' },
  { icon: <Shield size={18} color="#FFF" />, label: 'Learning Resources', desc: 'Courses & tutorials', route: '/(tabs)/resources/learning-resources', color: '#6366F1' },
  { icon: <CircleQuestionMark size={18} color="#FFF" />, label: 'FAQ', desc: 'Frequently asked questions', route: '/(tabs)/resources/faq', color: '#14B8A6' },
  { icon: <Lightbulb size={18} color="#FFF" />, label: 'Help Center', desc: 'Get support', route: '/(tabs)/resources/help-center', color: '#EC4899' },
];

function AccordionSection({
  title,
  items,
  onItemPress,
  delay,
}: {
  title: string;
  items: (ToolItem | ResourceItem)[];
  onItemPress?: (route: string) => void;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);

  const toggle = useCallback(() => {
    if (expanded) {
      heightAnim.value = withTiming(0, { duration: 250 });
      rotateAnim.value = withTiming(0, { duration: 250 });
    } else {
      heightAnim.value = withTiming(items.length * 64, { duration: 300 });
      rotateAnim.value = withTiming(180, { duration: 250 });
    }
    setExpanded(!expanded);
  }, [expanded, items.length]);

  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: heightAnim.value,
    opacity: heightAnim.value > 0 ? withTiming(1, { duration: 200 }) : 0,
    overflow: 'hidden',
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={toggle}
          activeOpacity={0.7}
          accessibilityLabel={`${title} section`}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <Text style={styles.accordionTitle}>{title.replace('_', ' ')}</Text>
          <Animated.View style={chevronStyle}>
            <ChevronDown size={18} color={colors.textMuted} />
          </Animated.View>
        </TouchableOpacity>
        <Animated.View style={contentStyle}>
          {items.map((item: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={styles.accordionItem}
              onPress={() => {
                if (onItemPress && item.route) onItemPress(item.route);
              }}
              activeOpacity={0.7}
              accessibilityLabel={item.label}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[item.color, item.color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.accordionItemIcon}
              >
                {item.icon}
              </LinearGradient>
              <View style={styles.accordionItemText}>
                <Text style={styles.accordionItemLabel}>{item.label}</Text>
                <Text style={styles.accordionItemDesc}>{item.desc}</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function CareerToolsSection({ handleNav }: { handleNav: (route: string) => void }) {
  return (
    <AccordionSection
      title="CAREER TOOLS"
      items={TOOLS}
      onItemPress={handleNav}
      delay={280}
    />
  );
}

function ResourcesSection({ handleNav }: { handleNav: (route: string) => void }) {
  return (
    <AccordionSection
      title="RESOURCES"
      items={RESOURCES}
      delay={360}
    />
  );
}

const QUICK_ACTIONS = [
  { icon: <Heart size={18} color="#EF4444" />, label: 'Saved Jobs', desc: 'View your saved jobs', bgColor: '#FEE2E2' },
  { icon: <Send size={18} color="#3B82F6" />, label: 'Applied Jobs', desc: 'Track applications', bgColor: '#DBEAFE' },
  { icon: <Bell size={18} color="#F59E0B" />, label: 'Notifications', desc: 'Stay updated', bgColor: '#FEF3C7' },
  { icon: <MessageSquare size={18} color="#10B981" />, label: 'Messages', desc: 'Recruiter messages', bgColor: '#D1FAE5' },
  { icon: <Eye size={18} color="#8B5CF6" />, label: 'Recently Viewed', desc: 'Continue where you left', bgColor: '#EDE9FE' },
];

function QuickActionsSection({ handleNav, drawerWidth }: { handleNav: (route: string) => void; drawerWidth: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(440).springify()} style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.quickActionCard, { width: (drawerWidth - spacing.md * 2 - spacing.sm) / 2 }]}
            onPress={() => {
              if (item.label === 'Saved Jobs') handleNav('/(tabs)/quick-actions/saved-jobs');
              else if (item.label === 'Applied Jobs') handleNav('/(tabs)/quick-actions/applied-jobs');
              else if (item.label === 'Notifications') handleNav('/(tabs)/quick-actions/notifications');
              else if (item.label === 'Messages') handleNav('/(tabs)/quick-actions/messages');
              else if (item.label === 'Recently Viewed') handleNav('/(tabs)/quick-actions/recently-viewed');
              else handleNav('/(tabs)/quick-actions');
            }}
            activeOpacity={0.7}
            accessibilityLabel={item.label}
            accessibilityRole="button"
          >
            <View style={[styles.quickActionIcon, { backgroundColor: item.bgColor }]}>
              {item.icon}
            </View>
            <Text style={styles.quickActionLabel}>{item.label}</Text>
            <Text style={styles.quickActionDesc} numberOfLines={1}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

function ThemeSection() {
  const { theme, setTheme } = useThemeStore();
  const [currency, setCurrency] = useState('USD');
  const [showCurrency, setShowCurrency] = useState(false);

  const themes: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun size={16} color="#F59E0B" />, label: 'Light' },
    { mode: 'dark', icon: <Moon size={16} color="#6366F1" />, label: 'Dark' },
    { mode: 'system', icon: <Monitor size={16} color="#3B82F6" />, label: 'System' },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'];

  return (
    <Animated.View entering={FadeInDown.delay(520).springify()} style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>SETTINGS</Text>
      <View style={styles.themeCard}>
        <Text style={styles.themeLabel}>Appearance</Text>
        <View style={styles.themeOptions}>
          {themes.map((t) => (
            <TouchableOpacity
              key={t.mode}
              style={[styles.themeOption, theme === t.mode && styles.themeOptionActive]}
              onPress={() => setTheme(t.mode)}
              activeOpacity={0.7}
              accessibilityLabel={`${t.label} mode`}
              accessibilityRole="button"
              accessibilityState={{ selected: theme === t.mode }}
            >
              {t.icon}
              <Text style={[styles.themeOptionText, theme === t.mode && styles.themeOptionTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.themeDivider} />

        <TouchableOpacity
          style={styles.currencySelector}
          onPress={() => setShowCurrency(!showCurrency)}
          activeOpacity={0.7}
        >
          <Globe size={16} color={colors.textSecondary} />
          <Text style={styles.currencyLabel}>Currency</Text>
          <Text style={styles.currencyValue}>{currency}</Text>
          <ChevronDown size={14} color={colors.textMuted} />
        </TouchableOpacity>

        {showCurrency && (
          <View style={styles.currencyList}>
            {currencies.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.currencyItem, currency === c && styles.currencyItemActive]}
                onPress={() => { setCurrency(c); setShowCurrency(false); }}
              >
                <Text style={[styles.currencyItemText, currency === c && styles.currencyItemTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function DrawerFooter({
  handleNav,
  handleLogout,
  isAuthenticated,
}: {
  handleNav: (route: string) => void;
  handleLogout: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => handleNav('/(tabs)/settings')} accessibilityRole="button">
          <Text style={styles.footerLink}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}>•</Text>
        <TouchableOpacity onPress={() => handleNav('/(tabs)/privacy')} accessibilityRole="button">
          <Text style={styles.footerLink}>Privacy</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}>•</Text>
        <TouchableOpacity onPress={() => handleNav('/(tabs)/terms')} accessibilityRole="button">
          <Text style={styles.footerLink}>Terms</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}>•</Text>
        <TouchableOpacity onPress={() => handleNav('/(tabs)/contact')} accessibilityRole="button">
          <Text style={styles.footerLink}>Support</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}>•</Text>
        <TouchableOpacity onPress={() => handleNav('/(tabs)/about')} accessibilityRole="button">
          <Text style={styles.footerLink}>v1.0</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialRow}>
        {[AtSign, GitFork, Share2].map((Icon, i) => (
          <TouchableOpacity key={i} style={styles.socialIcon} accessibilityRole="button">
            <Icon size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {isAuthenticated && (
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <LogOut size={16} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.copyright}>© 2026 JobPilot AI. All rights reserved.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    zIndex: 101,
    ...shadow.xl,
  },
  drawerInner: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  userCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.08)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  premiumText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  guestCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.08)',
  },
  guestIconContainer: {
    marginBottom: spacing.sm,
  },
  guestIconCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  guestSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  guestButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  signupBtn: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  signupBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  signupBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  loginBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  sectionContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },

  navList: {
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  navItemActive: {
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  navTextWrap: {
    flex: 1,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  navLabelActive: {
    color: colors.primary,
  },
  navDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  navDescActive: {
    color: colors.primary + 'AA',
  },
  activeIndicator: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    right: -spacing.md,
  },

  accordionCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  accordionItemIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionItemText: {
    flex: 1,
  },
  accordionItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  accordionItemDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  quickActionDesc: {
    fontSize: 10,
    color: colors.textMuted,
  },

  themeCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderColor: colors.primary,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  themeOptionTextActive: {
    color: colors.primary,
  },
  themeDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  currencyLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  currencyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  currencyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  currencyItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  currencyItemActive: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  currencyItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  currencyItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerLink: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerDot: {
    fontSize: 12,
    color: colors.border,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.errorLight,
    backgroundColor: colors.errorLight + '66',
    width: '100%',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  copyright: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
