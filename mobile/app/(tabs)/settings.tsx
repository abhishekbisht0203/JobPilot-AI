import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, useSharedValue, withSpring, useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore, useThemeStore } from '../../store';
import { settingsApi } from '../../lib/api';
import { ThemeMode } from '../../types';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';

function AnimatedPressable({ onPress, children, style }: {
  onPress?: () => void; children: React.ReactNode; style?: any;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function SettingsRow({ icon, label, right, last }: {
  icon: keyof typeof Ionicons.glyphMap; label: string;
  right: React.ReactNode; last?: boolean;
}) {
  return (
    <>
      <View style={styles.settingsRow}>
        <View style={styles.rowIconRing}>
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.rowRight}>{right}</View>
      </View>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

function ToggleRow({ icon, label, value, onValueChange, last }: {
  icon: keyof typeof Ionicons.glyphMap; label: string;
  value: boolean; onValueChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      last={last}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.borderLight, true: colors.primaryBg }}
          thumbColor={value ? colors.primary : colors.textMuted}
        />
      }
    />
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [profileVisible, setProfileVisible] = useState(true);
  const [resumePublic, setResumePublic] = useState(true);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = useCallback(async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await settingsApi.updatePassword(currentPw, newPw);
      Alert.alert('Success', 'Password changed successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  }, [currentPw, newPw, confirmPw]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await settingsApi.deleteAccount();
            logout();
            router.replace('/(auth)/login');
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to delete account.');
          }
        }},
      ]
    );
  }, [logout]);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        logout();
        router.replace('/(auth)/login');
      }},
    ]);
  }, [logout]);

  const themeOptions: { value: ThemeMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { value: 'light', icon: 'sunny-outline', label: 'Light' },
    { value: 'dark', icon: 'moon-outline', label: 'Dark' },
    { value: 'system', icon: 'settings-outline', label: 'System' },
  ];

  const fontSizes = ['small', 'medium', 'large'] as const;
  const fontScale: Record<string, number> = { small: 14, medium: 17, large: 21 };

  const sectionDelays = [100, 180, 260, 340, 420, 500, 580];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).springify().damping(14)}>
          <View style={styles.header}>
            <AnimatedPressable onPress={() => router.back()}>
              <BlurView intensity={60} tint="light" style={styles.backBtn}>
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </BlurView>
            </AnimatedPressable>
            <Text style={styles.title}>Settings</Text>
            <View style={{ width: 40 }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[0]).springify().damping(14)}>
          <GlassCard style={styles.sectionCard} glowColor={colors.primary}>
            <View style={styles.profileHeader}>
              <LinearGradient colors={colors.gradient.primary} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'U')[0].toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || 'user@example.com'}</Text>
                {user?.plan_tier && (
                  <Badge
                    label={user.plan_tier === 'pro' ? 'Pro' : user.plan_tier === 'team' ? 'Team' : 'Free'}
                    variant={user.plan_tier !== 'free' ? 'premium' : 'default'}
                    size="sm"
                    animated
                  />
                )}
              </View>
              <AnimatedPressable onPress={() => router.push('/(tabs)/profile')}>
                <LinearGradient colors={colors.gradient.primary} style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.white} />
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[1]).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <GlassCard style={styles.sectionCard}>
            <ToggleRow icon="notifications-outline" label="Push Notifications" value={pushNotif} onValueChange={setPushNotif} />
            <ToggleRow icon="mail-outline" label="Email Notifications" value={emailNotif} onValueChange={setEmailNotif} />
            <ToggleRow icon="chatbubble-outline" label="SMS Notifications" value={smsNotif} onValueChange={setSmsNotif} />
            <ToggleRow icon="refresh-outline" label="Application Updates" value={appUpdates} onValueChange={setAppUpdates} />
            <ToggleRow icon="megaphone-outline" label="Marketing Emails" value={marketing} onValueChange={setMarketing} last />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[2]).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <GlassCard style={styles.sectionCard}>
            <View style={styles.settingsRow}>
              <View style={styles.rowIconRing}>
                <Ionicons name="color-palette-outline" size={18} color={colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>Theme</Text>
              <View style={styles.optionGroup}>
                {themeOptions.map((opt) => {
                  const active = theme === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setTheme(opt.value)}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={14}
                        color={active ? colors.white : colors.textMuted}
                      />
                      <Text style={[styles.optionChipLabel, active && styles.optionChipLabelActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.settingsRow}>
              <View style={styles.rowIconRing}>
                <Ionicons name="text-outline" size={18} color={colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>Font Size</Text>
              <View style={styles.optionGroup}>
                {fontSizes.map((size) => {
                  const active = fontSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setFontSize(size)}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                    >
                      <Text style={[styles.fontSizeLetter, { fontSize: fontScale[size] }, active && { color: colors.white }]}>
                        A
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[3]).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <GlassCard style={styles.sectionCard}>
            <ToggleRow icon="eye-outline" label="Show profile to recruiters" value={profileVisible} onValueChange={setProfileVisible} />
            <ToggleRow icon="document-text-outline" label="Make resume public" value={resumePublic} onValueChange={setResumePublic} />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Two-factor authentication"
              last
              right={
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              }
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[4]).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <GlassCard style={styles.sectionCard}>
            <View style={styles.pwContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Current password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={currentPw}
                  onChangeText={setCurrentPw}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-open-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={newPw}
                  onChangeText={setNewPw}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                />
              </View>
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={pwLoading}
                activeOpacity={0.8}
                style={styles.pwSubmitBtn}
              >
                <LinearGradient colors={colors.gradient.primary} style={styles.pwSubmitGradient}>
                  <Text style={styles.pwSubmitText}>
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[5]).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Account</Text>
          <GlassCard style={styles.sectionCard}>
            <AnimatedPressable onPress={handleDeleteAccount}>
              <View style={styles.dangerRow}>
                <View style={[styles.rowIconRing, { backgroundColor: colors.errorLight }]}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.error }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </AnimatedPressable>
            <View style={styles.rowDivider} />
            <AnimatedPressable onPress={handleLogout}>
              <View style={styles.dangerRow}>
                <View style={[styles.rowIconRing, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="log-out-outline" size={18} color={colors.warning} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.warning }]}>Sign Out</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </AnimatedPressable>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(sectionDelays[6]).springify().damping(14)}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <GlassCard style={styles.sectionCard}>
            <SettingsRow
              icon="information-circle-outline"
              label="Version"
              right={<Text style={styles.infoValue}>1.0.0</Text>}
            />
            <SettingsRow
              icon="code-slash-outline"
              label="Build"
              right={<Text style={styles.infoValue}>2024.1</Text>}
              last
            />
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', ...shadow.sm,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs, marginTop: spacing.md,
  },
  sectionCard: { padding: spacing.sm, marginBottom: spacing.xs },
  profileHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.xs },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary,
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '700' },
  profileInfo: { flex: 1, marginLeft: spacing.md },
  profileName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  profileEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 1 },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.glow.primary,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
  },
  rowIconRing: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm,
  },
  rowLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.sm },
  optionGroup: { flexDirection: 'row', gap: 6 },
  optionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, backgroundColor: colors.surfaceLight,
  },
  optionChipActive: { backgroundColor: colors.primary },
  optionChipLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  optionChipLabelActive: { color: colors.white },
  fontSizeLetter: { fontWeight: '700', color: colors.textMuted },
  comingSoonBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryBg,
  },
  comingSoonText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  pwContainer: { gap: spacing.sm, padding: spacing.xs },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, color: colors.text, fontSize: 15, height: '100%' },
  pwSubmitBtn: { marginTop: spacing.xs, borderRadius: borderRadius.md, overflow: 'hidden', ...shadow.md },
  pwSubmitGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  pwSubmitText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  dangerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
  },
  infoValue: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
