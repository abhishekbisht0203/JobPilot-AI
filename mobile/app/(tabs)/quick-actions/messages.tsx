import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../../lib/theme';
import { useResponsive } from '../../../lib/responsive';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import { getTabListBottomPadding } from '../../../components/ui/TabBarHeight';
import { messageApi } from '../../../lib/api';
import { Message } from '../../../types';
import { timeAgo, getInitials } from '../../../lib/helpers';

function MessageCard({ item }: { item: Message }) {
  return (
    <Animated.View entering={FadeInUp.springify().damping(14)}>
      <TouchableOpacity activeOpacity={0.7}>
        <Card style={styles.msgCard} glowColor={!item.read ? colors.primary : undefined}>
          <View style={styles.msgRow}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={item.read ? ['#E2E8F0', '#CBD5E1'] : ['#3B82F6', '#6366F1']}
                style={styles.avatar}
              >
                <Text style={[styles.avatarText, !item.read && styles.avatarTextActive]}>
                  {getInitials(item.sender_name || "")}
                </Text>
              </LinearGradient>
              {!item.read && <View style={styles.onlineDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.msgHeader}>
                <Text style={[styles.msgName, !item.read && styles.msgNameUnread]} numberOfLines={1}>
                  {item.sender_name}
                </Text>
                <Text style={styles.msgTime}>{timeAgo(item.created_at)}</Text>
              </View>
              <Text style={[styles.msgPreview, !item.read && styles.msgPreviewUnread]} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadIndicator} />}
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    try {
      const res = await messageApi.list();
      setMessages(res.data.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageCard item={item} />}
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
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.title}>Messages</Text>
                <Text style={styles.subtitle}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'No unread messages'}
                </Text>
              </View>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.composeBtn}>
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          loading ? <Loader /> : (
            <EmptyState
              icon="chatbubbles-outline"
              title="No messages yet"
              message="Your messages from recruiters will appear here."
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2, flex: 1 },
  composeBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', ...shadow.glow.primary },
  msgCard: { marginBottom: 0 },
  msgRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  avatarTextActive: { color: '#FFFFFF' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.surface,
  },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgName: { fontSize: 15, fontWeight: '500', color: colors.text, flex: 1 },
  msgNameUnread: { fontWeight: '700' },
  msgTime: { fontSize: 11, color: colors.textMuted, marginLeft: spacing.xs },
  msgPreview: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginTop: 2 },
  msgPreviewUnread: { color: colors.textSecondary, fontWeight: '500' },
  unreadIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.sm },
});