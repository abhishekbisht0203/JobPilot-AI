import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'password' | 'email';
  error?: string;
  returnKeyType?: 'next' | 'go' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

export default function PremiumInput({
  icon, label, value, onChangeText,
  type = 'text', error, returnKeyType, onSubmitEditing,
  inputRef, autoCapitalize, autoCorrect,
}: PremiumInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(type === 'password');
  const isPassword = type === 'password';
  const isEmail = type === 'email';
  const hasValue = value.length > 0;
  const isValid = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : hasValue;

  const labelAnim = useRef(new Animated.Value(hasValue || focused ? 1 : 0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: hasValue || focused ? 1 : 0,
      duration: 200, easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: false,
    }).start();
  }, [focused, hasValue]);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 250, easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: Platform.OS !== `web`,
    }).start();
  }, [focused]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 60, useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 60, useNativeDriver: Platform.OS !== `web` }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: Platform.OS !== `web` }),
      ]).start();
    }
  }, [error]);

  const borderColor = error ? '#EF4444' : focused ? '#4F7CFF' : 'rgba(226,232,240,0.8)';
  const iconColor = error ? '#EF4444' : focused ? '#4F7CFF' : '#9CA3AF';
  const labelColor = error ? '#EF4444' : focused ? '#4F7CFF' : '#9CA3AF';

  const labelStyle = {
    transform: [
      { translateY: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
      { scale: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
    ],
  };

  return (
    <View style={styles.wrap}>
      <Animated.View style={[
        styles.container,
        { borderColor, transform: [{ translateX: shakeAnim }, { scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] }) }] },
        focused && { shadowColor: 'rgba(79,124,255,0.15)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4 },
      ]}>
        <Ionicons name={icon} size={18} color={iconColor} style={styles.icon} />
        <View style={styles.inputWrap}>
          <Animated.Text style={[styles.floatingLabel, { color: labelColor }, labelStyle]}>{label}</Animated.Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder=""
            placeholderTextColor="transparent"
            secureTextEntry={showPassword}
            keyboardType={isEmail ? 'email-address' : 'default'}
            autoCapitalize={autoCapitalize || (isEmail ? 'none' : 'sentences')}
            autoCorrect={autoCorrect ?? false}
            returnKeyType={returnKeyType || 'next'}
            onSubmitEditing={onSubmitEditing}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor="#4F7CFF"
          />
        </View>
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8} style={styles.suffix}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {!isPassword && hasValue && isValid && !error && (
          <View style={styles.suffix}>
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          </View>
        )}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  container: {
    flexDirection: 'row', alignItems: 'center', height: 56,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    shadowColor: 'rgba(70,90,150,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: { marginRight: 12 },
  inputWrap: { flex: 1, justifyContent: 'center', height: '100%' },
  floatingLabel: {
    position: 'absolute', left: 0, top: 18,
    fontSize: 15, fontWeight: '500',
  },
  input: {
    flex: 1, color: '#111827', fontSize: 15, fontWeight: '500',
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
    height: '100%',
  },
  suffix: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '500', marginTop: 4, marginLeft: 4 },
});

