import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { notificationsApi } from '../../../lib/api';
import { Notification } from '../../../types';
import { timeAgo } from '../../../lib/helpers';

const NOTIF_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; gradient: readonly [string, string] }> = {
  application: { icon: 'send', gradient: colors.gradient.blue },
  interview: { icon: 'calendar', gradient: colors.gradient.purple },
  message: { icon: 'chatbubble', gradient: colors.gradient.teal },
  offer: { icon: 'trophy', gradient: colors.gradient.success },
  system: { icon: 'settings', gradient: colors.gradient.midnight },
  reminder: { icon: 'alarm', gradient: colors.gradient.warning },
};

function NotificationCard({ item, onMarkRead }: { item: Notification; onMarkRead: (id: string) => void }) {
  const config = NOTIF_ICONS[item.type] || NOTIF_ICONS.system;

  return (
    <Animated.View entering={FadeInUp.springify().damping(14)}>
      <TouchableOpacity
        onPress={() => { if (!item.read) onMarkRead(item.id); }}
        activeOpacity={0.7}
      >
        <GlassCard style={[styles.notifCard, !item.read && styles.notifUnread]} glowColor={!item.read ? colors.primary : undefined}>
          <View style={styles.notifRow}>
            <LinearGradient colors={config.gradient} style={styles.notifIcon}>
              <Ionicons name={config.icon} size={16} color="#FFFFFF" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.notifTime}>{timeAgo(item.created_at)}</Text>
              </View>
              <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          try {
            await Promise.all(notifications.map((n) => notificationsApi.markRead(n.id)));
            setNotifications([]);
          } catch {}
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationCard item={item} onMarkRead={handleMarkRead} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.title}>Notifications</Text>
                  <Text style={styles.subtitle}>{unreadCount} unread</Text>
                </View>
                {notifications.length > 0 && (
                  <View style={styles.headerActions}>
                    {unreadCount > 0 && (
                      <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerAction}>
                        <Ionicons name="checkmark-done" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleClearAll} style={styles.headerAction}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Animated.View>

            {unreadCount > 0 && (
              <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
                <GlassCard style={styles.unreadSummary} glowColor={colors.primary}>
                  <View style={styles.unreadRow}>
                    <Ionicons name="notifications" size={18} color={colors.primary} />
                    <Text style={styles.unreadText}>
                      You have <Text style={styles.unreadCount}>{unreadCount}</Text> unread notification{unreadCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? <Loader /> : (
            <EmptyState
              icon="notifications-off-outline"
              title="All caught up"
              message="You have no notifications right now."
            />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  headerAction: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadow.xs },
  unreadSummary: { padding: spacing.md, marginBottom: spacing.md },
  unreadRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  unreadText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  unreadCount: { color: colors.primary, fontWeight: '700' },
  notifCard: { padding: spacing.md },
  notifUnread: {},
  notifRow: { flexDirection: 'row', alignItems: 'flex-start' },
  notifIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '500', color: colors.text, flex: 1 },
  notifTitleUnread: { fontWeight: '700' },
  notifTime: { fontSize: 11, color: colors.textMuted, marginLeft: spacing.xs },
  notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.xs, marginTop: 4 },
});
