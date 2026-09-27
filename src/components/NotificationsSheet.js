import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, radius, type } from '../theme';
import { buildNotifications, loadReadIds, saveReadIds } from '../lib/notifications';
import { loadMonthlyBudget } from '../lib/budget';
import IconButton from './IconButton';
import Sheet from './Sheet';

const TONE_COLORS = {
  danger: colors.negative,
  warning: colors.accent,
  info: colors.textSoft,
  neutral: colors.textSoft,
};

const formatRelative = (value) => {
  const date = new Date(value);
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationsSheet({ visible, uid, transactions, onClose }) {
  const insets = useSafeAreaInsets();
  const [readIds, setReadIds] = useState(new Set());
  const [budget, setBudget] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  // Collapse everything each time the sheet reopens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) setExpandedId(null);
  }

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    Promise.all([loadReadIds(uid), loadMonthlyBudget(uid)]).then(([ids, amount]) => {
      if (!active) return;
      setReadIds(ids);
      setBudget(amount);
    });
    return () => { active = false; };
  }, [visible, uid]);

  const notifications = useMemo(() => buildNotifications({ transactions: transactions || [], budgetAmount: budget }), [transactions, budget]);
  const unreadCount = notifications.filter((item) => !readIds.has(item.id)).length;

  const markRead = (id) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(uid, next).catch(() => undefined);
  };

  const markAllRead = () => {
    const next = new Set([...readIds, ...notifications.map((item) => item.id)]);
    setReadIds(next);
    saveReadIds(uid, next).catch(() => undefined);
  };

  const toggleExpand = (id) => {
    markRead(id);
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Notifications"
      subtitle={notifications.length ? (unreadCount ? `${unreadCount} unread` : 'All caught up') : null}
      headerRight={notifications.length ? (
        <IconButton
          variant="outline"
          accessibilityLabel="Mark all read"
          disabled={unreadCount === 0}
          onPress={markAllRead}
          icon={<Ionicons name="checkmark-done" size={19} color={unreadCount ? colors.accent : colors.textFaint} />}
        />
      ) : null}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={22} color={colors.textSoft} />
            </View>
            <Text style={styles.emptyTitle}>You’re all caught up</Text>
            <Text style={styles.emptyCopy}>Budget alerts and recent activity will show up here.</Text>
          </View>
        ) : notifications.map((item) => {
          const unread = !readIds.has(item.id);
          const expanded = expandedId === item.id;
          const tint = TONE_COLORS[item.tone] || colors.textSoft;
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleExpand(item.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={({ pressed }) => [styles.card, unread && styles.cardUnread, pressed && styles.pressed]}
            >
              <View style={[styles.icon, { backgroundColor: `${tint}24` }]}>
                <Ionicons name={item.icon} size={18} color={tint} />
              </View>
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.rowTitle} numberOfLines={expanded ? undefined : 1}>{item.title}</Text>
                  {unread && <View style={styles.dot} />}
                </View>
                <Text style={styles.rowBody} numberOfLines={expanded ? undefined : 2}>{item.body}</Text>
                <View style={styles.rowFooter}>
                  <Text style={styles.rowTime}>{item.timeLabel || formatRelative(item.date)}</Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textFaint} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 8 },
  empty: { alignItems: 'center', marginTop: 12, paddingVertical: 36, paddingHorizontal: 24, borderRadius: radius.lg, backgroundColor: colors.surface },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...type.heading, color: colors.text, marginTop: 14, marginBottom: 6 },
  emptyCopy: { ...type.body, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  card: { flexDirection: 'row', gap: 14, padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  cardUnread: { borderColor: colors.accentBorder, backgroundColor: '#24211C' },
  pressed: { opacity: 0.85 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { ...type.label, fontSize: 15, color: colors.text, flexShrink: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  rowBody: { ...type.body, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 4 },
  rowFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  rowTime: { ...type.caption, color: colors.textFaint },
});
