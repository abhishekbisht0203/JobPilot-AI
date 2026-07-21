import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { authApi } from '../../lib/api';
import { premium } from '../../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MAX_WIDTH = 420;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, CARD_MAX_WIDTH);

const AI_TRUST_INDICATORS = [
  { icon: '🤖', label: 'AI Powered' },
  { icon: '🔒', label: 'Secure' },
  { icon: '⚡', label: 'Fast Applications' },
] as const;

const FEATURE_PILLS = [
  { icon: '📄', label: 'Smart Resume' },
  { icon: '🤖', label: 'Auto Apply' },
  { icon: '📊', label: 'Track Progress' },
] as const;

function useEntranceAnimation(stagger: number) {
  const values = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = values.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 800,
        delay: stagger + i * 150,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    );
    Animated.stagger(0, animations).start();
  }, []);

  return values;
}

function useLogoFloat() {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });

  return { transform: [{ translateY }] };
}

function useButtonPress() {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
      stiffness: 400,
      damping: 25,
      useNativeDriver: true,
    }).start();
  }, []);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 400,
      damping: 25,
      useNativeDriver: true,
    }).start();
  }, []);

  return { scale, pressIn, pressOut };
}

function FadeUpView({
  anim,
  children,
  style,
}: {
  anim: Animated.Value;
  children: React.ReactNode;
  style?: any;
}) {
  const opacity = anim;
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const passwordRef = useRef<TextInput>(null);

  const entrance = useEntranceAnimation(200);
  const logoAnim = useLogoFloat();
  const { scale: btnScale, pressIn, pressOut } = useButtonPress();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login(email, password);
      setAuth(response.data.user, response.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.bgBase} />
            <View style={styles.bgGlow1} />
            <View style={styles.bgGlow2} />
          </View>

          <View style={styles.content}>
            <FadeUpView anim={entrance[0]} style={styles.logoSection}>
              <Animated.View style={[styles.logoOuter, logoAnim]}>
                <View style={styles.logoInner}>
                  <Ionicons name="briefcase" size={26} color={premium.primaryLight} />
                </View>
              </Animated.View>
              <Text style={styles.title}>JobPilot AI</Text>
              <Text style={styles.subtitle}>Your AI Career Copilot</Text>
            </FadeUpView>

            <FadeUpView anim={entrance[1]}>
              <View style={styles.trustRow}>
                {AI_TRUST_INDICATORS.map((item) => (
                  <View key={item.label} style={styles.chip}>
                    <Text style={styles.chipIcon}>{item.icon}</Text>
                    <Text style={styles.chipLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </FadeUpView>

            <FadeUpView anim={entrance[2]} style={styles.card}>
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    emailFocused && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={emailFocused ? premium.primaryLight : premium.textPlaceholder}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email address"
                    placeholderTextColor={premium.textPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    passwordFocused && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={passwordFocused ? premium.primaryLight : premium.textPlaceholder}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={premium.textPlaceholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={premium.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={14} color={premium.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Animated.View style={[{ transform: [{ scale: btnScale }] }, styles.btnWrapper]}>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleLogin}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.signInText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <View style={styles.googleIconBox}>
                  <Ionicons name="logo-google" size={16} color={premium.text} />
                </View>
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            </FadeUpView>

            <FadeUpView anim={entrance[4]} style={styles.footer}>
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.footerLinkMuted}>Forgot Password?</Text>
              </TouchableOpacity>
            </FadeUpView>

            <FadeUpView anim={entrance[5]} style={styles.featureRow}>
              {FEATURE_PILLS.map((item) => (
                <View key={item.label} style={styles.featurePill}>
                  <Text style={styles.featurePillIcon}>{item.icon}</Text>
                  <Text style={styles.featurePillLabel}>{item.label}</Text>
                </View>
              ))}
            </FadeUpView>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  bgBase: {
    flex: 1,
    backgroundColor: premium.bg,
  },
  bgGlow1: {
    position: 'absolute',
    top: -180,
    left: '50%',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: premium.primary,
    opacity: 0.035,
    transform: [{ translateX: -180 }],
  },
  bgGlow2: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: premium.primaryLight,
    opacity: 0.025,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoOuter: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(37,99,235,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premium.cardBorder,
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: premium.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: premium.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premium.chipBg,
    borderWidth: 1,
    borderColor: premium.chipBorder,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipLabel: {
    fontSize: 12,
    color: premium.textSecondary,
    fontWeight: '500',
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: premium.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: premium.cardBorder,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
  },

  inputGroup: {
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: premium.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: premium.primaryLight,
    shadowColor: premium.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: premium.text,
    fontSize: 15,
    fontWeight: '400',
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  errorText: {
    color: premium.error,
    fontSize: 13,
    fontWeight: '400',
  },

  btnWrapper: {
    marginBottom: 20,
  },
  signInButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: premium.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: premium.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  signInText: {
    color: premium.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dividerText: {
    color: premium.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    marginHorizontal: 12,
  },

  googleButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    color: premium.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },

  footer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: premium.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  footerLink: {
    color: premium.primaryLight,
    fontSize: 14,
    fontWeight: '500',
  },
  footerLinkMuted: {
    color: premium.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },

  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  featurePillIcon: {
    fontSize: 12,
  },
  featurePillLabel: {
    fontSize: 12,
    color: premium.textSecondary,
    fontWeight: '500',
  },
});
