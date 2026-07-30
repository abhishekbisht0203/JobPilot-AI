import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedH, {
  FadeInDown, FadeInUp,
} from 'react-native-reanimated';
import { useAuthStore } from '../../store';
import { authApi } from '../../lib/api';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';
import PasswordStrength from '../../components/auth/PasswordStrength';

function FloatIcon({ children }: { children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] }) }] }}>
      {children}
    </Animated.View>
  );
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const emailRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [confirmErr, setConfirmErr] = useState('');

  const handleRegister = async () => {
    let valid = true;
    setNameErr(''); setEmailErr(''); setPassErr(''); setConfirmErr(''); setError('');
    if (!name || name.trim().length < 2) { setNameErr('Enter your full name'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr('Enter a valid email'); valid = false; }
    if (!password || password.length < 6) { setPassErr('Min 6 characters'); valid = false; }
    if (password !== confirmPassword) { setConfirmErr('Passwords do not match'); valid = false; }
    if (!valid) return;

    setLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      setAuth(res.data.user, res.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <MeshGradient />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AnimatedH.View entering={FadeInDown.delay(50).springify().damping(15)} style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </AnimatedH.View>

        <AnimatedH.View entering={FadeInDown.delay(100).springify().damping(15)} style={styles.hero}>
          <FloatIcon>
            <LinearGradient colors={['#3B82F6', '#6366F1', '#8B5CF6']} style={styles.iconBg}>
              <Ionicons name="rocket" size={26} color="#FFF" />
            </LinearGradient>
          </FloatIcon>
          <Text style={styles.heroTitle}>Create Your Future</Text>
          <Text style={styles.heroSub}>Build your profile once and let AI do the rest.</Text>
        </AnimatedH.View>

        <AnimatedH.View entering={FadeInUp.delay(200).springify().damping(15)} style={styles.cardWrapper}>
          <GlassCard style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputWrap, nameErr ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color={nameErr ? colors.error : colors.textMuted} />
                <TextInput
                  style={styles.input} placeholder="John Doe" placeholderTextColor={colors.textMuted}
                  value={name} onChangeText={(t) => { setName(t); setNameErr(''); setError(''); }}
                  returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
              {nameErr ? <Text style={styles.fieldError}>{nameErr}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrap, emailErr ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color={emailErr ? colors.error : colors.textMuted} />
                <TextInput
                  ref={emailRef}
                  style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.textMuted}
                  value={email} onChangeText={(t) => { setEmail(t); setEmailErr(''); setError(''); }}
                  autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
                  returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()}
                />
              </View>
              {emailErr ? <Text style={styles.fieldError}>{emailErr}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrap, passErr ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color={passErr ? colors.error : colors.textMuted} />
                <TextInput
                  ref={pwRef}
                  style={styles.input} placeholder="Min 6 characters" placeholderTextColor={colors.textMuted}
                  value={password} onChangeText={(t) => { setPassword(t); setPassErr(''); setError(''); }}
                  secureTextEntry returnKeyType="next" onSubmitEditing={() => confirmRef.current?.focus()}
                />
              </View>
              {passErr ? <Text style={styles.fieldError}>{passErr}</Text> : null}
            </View>
            <PasswordStrength password={password} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrap, confirmErr ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color={confirmErr ? colors.error : colors.textMuted} />
                <TextInput
                  ref={confirmRef}
                  style={styles.input} placeholder="Re-enter password" placeholderTextColor={colors.textMuted}
                  value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); setConfirmErr(''); setError(''); }}
                  secureTextEntry returnKeyType="go" onSubmitEditing={handleRegister}
                />
              </View>
              {confirmErr ? <Text style={styles.fieldError}>{confirmErr}</Text> : null}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.9}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                {loading ? (
                  <Text style={styles.loginBtnText}>Creating account...</Text>
                ) : (
                  <Text style={styles.loginBtnText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={22} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-linkedin" size={22} color="#0A66C2" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </AnimatedH.View>

        <AnimatedH.View entering={FadeInUp.delay(400).springify().damping(15)} style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </AnimatedH.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40,
  },
  topBar: { alignSelf: 'stretch', marginBottom: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  hero: { alignItems: 'center', marginBottom: 24 },
  iconBg: {
    width: 68, height: 68, borderRadius: 22, marginBottom: 14,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow.primary,
  },
  heroTitle: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  heroSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  cardWrapper: { width: '100%', maxWidth: 400 },
  card: { padding: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, height: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0 },
  fieldError: { color: colors.error, fontSize: 12, marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '500' },
  loginBtn: {
    height: 50, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow.primary,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  dividerText: { color: colors.textMuted, fontSize: 12, fontWeight: '500', marginHorizontal: 12 },
  socialRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  socialBtn: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  footer: { marginTop: 20 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: colors.textSecondary, fontSize: 13 },
  footerLink: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
