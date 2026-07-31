import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../lib/theme';
import { useDrawerStore } from '../store';

export function GlobalHeader() {
  const insets = useSafeAreaInsets();
  const openDrawer = useDrawerStore((s) => s.open);

  return (
    <View style={[styles.headerBar, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity
        style={styles.hamburgerBtn}
        onPress={openDrawer}
        activeOpacity={0.7}
        accessibilityLabel="Open navigation menu"
        accessibilityRole="button"
      >
        <Ionicons name="menu-outline" size={24} color={colors.text} />
      </TouchableOpacity>
      <LinearGradient
        colors={['#3B82F6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerLogoSmall}
      >
        <Ionicons name="briefcase" size={16} color="#FFF" />
      </LinearGradient>
      <Text style={styles.headerTitle}>JobPilot AI</Text>
      <TouchableOpacity
        style={styles.notifBtn}
        onPress={() => router.push('/(tabs)/quick-actions/notifications' as any)}
        activeOpacity={0.7}
        accessibilityLabel="Notifications"
        accessibilityRole="button"
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.06)',
    zIndex: 10,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerLogoSmall: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
