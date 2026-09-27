import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';

// Row used inside a single Card for long lists (menus, rates, history). Rows
// are separated by a hairline inset past the leading icon.
export default function ListRow({
  left,
  icon,
  iconColor = colors.textSoft,
  iconBg = colors.glass,
  title,
  subtitle,
  right,
  onPress,
  onLongPress,
  showDivider = true,
  style,
}) {
  return (
    <View style={style}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={!onPress && !onLongPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        style={({ pressed }) => [styles.row, pressed && (onPress || onLongPress) && styles.pressed]}
      >
        <View style={styles.left}>
          {left || (
            <View style={[styles.iconTile, { backgroundColor: iconBg }]}>
              {icon ? React.cloneElement(icon, { size: icon.props.size ?? 18, color: icon.props.color ?? iconColor }) : null}
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </Pressable>
      {showDivider && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 66, paddingVertical: 10 },
  pressed: { opacity: 0.7 },
  left: { marginRight: 14 },
  iconTile: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  title: { ...type.label, fontSize: 15, color: colors.text },
  subtitle: { ...type.caption, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  right: { marginLeft: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.09)', marginLeft: 54 },
});
