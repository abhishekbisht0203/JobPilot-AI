import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../lib/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  multiline,
  numberOfLines = 1,
  icon,
  style,
  autoCapitalize = 'none',
  keyboardType = 'default',
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, colors.primary],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2],
  });

  return (
    <View style={[styles.container, style as ViewStyle]}>
      {label && (
        <Text style={[styles.label, focused && styles.labelFocused, error && styles.labelError]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor, borderWidth },
          multiline && styles.multiline,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  labelFocused: { color: colors.primary },
  labelError: { color: colors.error },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  multiline: { height: 'auto', minHeight: 110, alignItems: 'flex-start' },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    height: '100%',
  },
  multilineInput: {
    height: 'auto',
    minHeight: 100,
    paddingTop: spacing.sm + 4,
    textAlignVertical: 'top',
  },
  icon: { marginRight: spacing.sm },
  eyeIcon: { padding: spacing.xs },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
    fontSize: 12,
  },
});
