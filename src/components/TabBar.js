import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, GUTTER, NAV, radius, shadows, type } from '../theme';

const TABS = {
  Home: { icon: 'home', label: 'Home' },
  Friends: { icon: 'people', label: 'Friends' },
  Profile: { icon: 'person', label: 'Profile' },
};

const BAR_PADDING = 6;
// Below this slot width the label no longer fits beside the icon.
const LABEL_MIN_SLOT = 78;

// Floating navigation: a warm-glass pill of tabs with a gold pill that slides
// to the active tab. Adding a transaction lives on Home (FloatingAddButton),
// so the bar is tabs only. Rendered through the navigator's `tabBar` prop, so
// it owns layout, focus and the tabPress event.
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const [slotWidth, setSlotWidth] = useState(0);
  const position = useSharedValue(state.index);

  useEffect(() => {
    position.value = withSpring(state.index, { damping: 20, stiffness: 220, mass: 0.8 });
  }, [position, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: position.value * slotWidth }] }));
  const showLabel = slotWidth >= LABEL_MIN_SLOT;

  const onBarLayout = (event) => {
    const inner = event.nativeEvent.layout.width - BAR_PADDING * 2;
    setSlotWidth(inner / state.routes.length);
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + NAV.TAB_BAR_GAP }]}>
      <View style={styles.barShadow}>
        <View style={styles.bar} onLayout={onBarLayout} accessibilityRole="tablist">
          <GlassFill />
          {slotWidth > 0 ? (
            <Animated.View pointerEvents="none" style={[styles.indicator, { width: slotWidth }, indicatorStyle]}>
              <LinearGradient colors={colors.accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.indicatorFill} />
            </Animated.View>
          ) : null}
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const tab = TABS[route.name] || { icon: 'ellipse', label: route.name };
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            };
            const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
            return (
              <TabItem key={route.key} tab={tab} focused={focused} showLabel={showLabel} onPress={onPress} onLongPress={onLongPress} />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function GlassFill() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.glass]} pointerEvents="none">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.glassTint]} />
      {/* Faint warm light along the top edge, echoing the hero halo. */}
      <LinearGradient colors={['rgba(234,201,140,0.10)', 'rgba(234,201,140,0)']} style={styles.glassSheen} />
    </View>
  );
}

function TabItem({ tab, focused, showLabel, onPress, onLongPress }) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [focused, progress]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: progress.value, maxWidth: progress.value * 80, marginLeft: progress.value * 6 }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: focused }}
      style={styles.slot}
    >
      <View style={styles.slotInner}>
        <Ionicons name={focused ? tab.icon : `${tab.icon}-outline`} size={20} color={focused ? colors.accentText : colors.textMuted} />
        {showLabel ? (
          <Animated.View style={[styles.labelWrap, labelStyle]}>
            {/* allowFontScaling off so the OS "Larger Text" setting can't push
                the label out of the pill. */}
            <Text numberOfLines={1} allowFontScaling={false} style={styles.label}>{tab.label}</Text>
          </Animated.View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    height: NAV.TAB_BAR_HEIGHT,
  },
  // Shadow and clipping live on separate views — RN can't render a shadow
  // and clip children (overflow:hidden) on the same view.
  barShadow: { flex: 1, height: NAV.TAB_BAR_HEIGHT, borderRadius: radius.pill, ...shadows.floating },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BAR_PADDING,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  glass: { borderRadius: radius.pill, overflow: 'hidden' },
  // Android's BlurView only tints unless an experimental blur method is
  // opted into, so the tint alone has to carry the surface there.
  glassTint: { backgroundColor: Platform.OS === 'android' ? 'rgba(30,27,24,0.97)' : 'rgba(30,27,24,0.86)' },
  glassSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 22 },
  indicator: { position: 'absolute', left: BAR_PADDING, top: BAR_PADDING, bottom: BAR_PADDING, paddingHorizontal: 2 },
  indicatorFill: { flex: 1, borderRadius: radius.pill },
  slot: { flex: 1, height: NAV.TAB_BAR_HEIGHT - BAR_PADDING * 2, alignItems: 'center', justifyContent: 'center' },
  slotInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  labelWrap: { overflow: 'hidden' },
  label: { ...type.label, fontSize: 14, color: colors.accentText },
});
