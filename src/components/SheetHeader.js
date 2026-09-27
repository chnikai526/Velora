import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, type } from '../theme';
import IconButton from './IconButton';

// Shared sheet header: grabber (iOS, where sheets swipe down), a rimmed
// circular close/back button, a centered title with optional subtitle, and an
// optional circled action on the right.
//
// Close icons follow one rule across the app: `close` for forms you're
// abandoning, `chevron-down` for sheets you're browsing, `arrow-back` for a
// step inside a sheet.
export default function SheetHeader({ title, subtitle, onClose, closeIcon = 'chevron-down', closeLabel, right = null, grabber = Platform.OS === 'ios' }) {
  const insets = useSafeAreaInsets();
  // `presentationStyle="pageSheet"` is iOS-only — Android renders every sheet
  // full-screen, so without the status-bar inset the header sits under it.
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : Platform.OS === 'ios' ? 10 : 18;
  const label = closeLabel || (closeIcon === 'arrow-back' ? 'Back' : 'Close');

  return (
    <View style={[styles.header, { paddingTop }]}>
      {grabber ? <View style={styles.grabber} /> : null}
      <View style={styles.row}>
        <IconButton variant="outline" accessibilityLabel={label} onPress={onClose} icon={<Ionicons name={closeIcon} size={20} color={colors.text} />} />
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={styles.side}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: GUTTER, paddingBottom: 14 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  titleWrap: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  title: { ...type.heading, fontSize: 19, lineHeight: 24, color: colors.text, textAlign: 'center' },
  subtitle: { ...type.caption, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  side: { width: 40, alignItems: 'flex-end' },
});
