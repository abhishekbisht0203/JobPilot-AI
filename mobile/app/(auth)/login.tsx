import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AnimatedH, {
  FadeInDown, FadeInUp, withSpring, withTiming, useSharedValue, useAnimatedStyle,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useAuthStore } from '../../store';
import { authApi } from '../../lib/api';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';

function FloatIcon({ children }: { children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] }) }] }}>
      {children}
    </Animated.View>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const pwRef = useRef<TextInput>(null);
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const emailFocus = useSharedValue(0);
  const passFocus = useSharedValue(0);

  const handleLogin = async () => {
    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Enter a valid email address'); valid = false;
    } else { setEmailErr(''); }
    if (!password || password.length < 6) {
      setPassErr('Password must be at least 6 characters'); valid = false;
    } else { setPassErr(''); }
    if (!valid) return;

    setLoading(true); setError(''); setEmailErr(''); setPassErr('');
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.root}>
      <MeshGradient />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <AnimatedH.View entering={FadeInDown.delay(100).springify().damping(15)} style={styles.hero}>
            <FloatIcon>
              <LinearGradient colors={['#3B82F6', '#6366F1', '#8B5CF6']} style={styles.iconBg}>
                <Ionicons name="briefcase" size={28} color="#FFF" />
              </LinearGradient>
            </FloatIcon>
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSub}>Sign in to continue your career journey</Text>
          </AnimatedH.View>

          <AnimatedH.View entering={FadeInUp.delay(200).springify().damping(15)} style={styles.cardWrapper}>
            <GlassCard style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrap, emailErr ? styles.inputError : null]}>
                  <Ionicons name="mail-outline" size={18} color={emailErr ? colors.error : colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setEmailErr(''); setError(''); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => pwRef.current?.focus()}
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
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setPassErr(''); setError(''); }}
                    secureTextEntry
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                </View>
                {passErr ? <Text style={styles.fieldError}>{passErr}</Text> : null}
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.optionsRow}>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.rememberRow}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Ionicons name="checkmark" size={11} color="#FFF" />}
                  </View>
                  <Text style={styles.optionText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.9}>
                <LinearGradient colors={['#3B82F6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                  {loading ? (
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <View style={styles.loadingDot} />
                      <Text style={styles.loginBtnText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginBtnText}>Continue</Text>
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
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </AnimatedH.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingBottom: 40,
  },
  hero: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  iconBg: {
    width: 72, height: 72, borderRadius: 24, marginBottom: 16,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow.primary,
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  heroSub: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
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
  optionsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white,
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  loginBtn: {
    height: 50, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.glow.primary,
  },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: 0.8 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  dividerText: { color: colors.textMuted, fontSize: 12, fontWeight: '500', marginHorizontal: 12 },
  socialRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  socialBtn: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  footer: { marginTop: spacing.lg },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: colors.textSecondary, fontSize: 13 },
  footerLink: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
