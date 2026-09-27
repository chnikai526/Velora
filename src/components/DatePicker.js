import React, { useCallback, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { colors, GUTTER, radius, shadows, type } from '../theme';
import { toLocalDateInput, toLocalTimeInput } from '../lib/format';
import Chip from './Chip';

// Cross-platform date / date-and-time picker.
//
//   const picker = useDatePicker();
//   picker.open({ value, mode: 'datetime', title: 'Date', onPick });
//   ...render {picker.panel} as the last child of the screen or sheet.
//
// Android gets the native dialogs, opened imperatively: the declarative
// <DateTimePicker> re-opens its dialog whenever `value` or `onChange`
// changes, so an inline arrow handler re-opened it after every pick. iOS gets
// a themed bottom panel with the native picker, and web (where the native
// picker renders nothing) gets the browser's own date input.
export function useDatePicker() {
  const [request, setRequest] = useState(null);

  const open = useCallback((options) => {
    Keyboard.dismiss();
    const value = options.value instanceof Date && !Number.isNaN(options.value.getTime()) ? options.value : new Date();
    if (Platform.OS === 'android') {
      openAndroidPicker({ ...options, value });
      return;
    }
    setRequest({ ...options, value });
  }, []);

  const close = useCallback(() => setRequest(null), []);

  const panel = request ? <DatePanel request={request} onClose={close} /> : null;
  return { open, panel };
}

function openAndroidPicker({ value, mode = 'date', minimumDate, maximumDate, onPick }) {
  DateTimePickerAndroid.open({
    value,
    mode: 'date',
    minimumDate,
    maximumDate,
    onChange: (event, picked) => {
      if (event.type !== 'set' || !picked) return;
      if (mode !== 'datetime') {
        onPick(picked);
        return;
      }
      DateTimePickerAndroid.open({
        value: picked,
        mode: 'time',
        onChange: (timeEvent, pickedTime) => {
          if (timeEvent.type === 'set' && pickedTime) onPick(pickedTime);
        },
      });
    },
  });
}

const startOfDayOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Keep the picked day but take the time from `timeSource`.
const withTime = (day, timeSource) => {
  const next = new Date(day);
  next.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);
  return next;
};

function DatePanel({ request, onClose }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(request.value);
  const { mode = 'date', title = 'Choose date', display, minimumDate, maximumDate, quickPicks = false } = request;
  const today = new Date();
  const yesterday = startOfDayOffset(1);

  const done = () => {
    request.onPick(draft);
    onClose();
  };

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(160)} style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss date picker" />
      <Animated.View entering={SlideInDown.duration(260)} style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={done} hitSlop={10} accessibilityRole="button">
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        {quickPicks ? (
          <View style={styles.quickRow}>
            <Chip label="Today" icon="sunny-outline" selected={draft.toDateString() === today.toDateString()} onPress={() => setDraft(withTime(today, draft))} />
            <Chip label="Yesterday" icon="arrow-undo-outline" selected={draft.toDateString() === yesterday.toDateString()} onPress={() => setDraft(withTime(yesterday, draft))} />
          </View>
        ) : null}

        {Platform.OS === 'web' ? (
          <WebDateInput mode={mode} value={draft} onChange={setDraft} minimumDate={minimumDate} maximumDate={maximumDate} />
        ) : (
          <DateTimePicker
            value={draft}
            mode={mode}
            display={display || (mode === 'datetime' ? 'inline' : 'spinner')}
            themeVariant="dark"
            accentColor={colors.accent}
            textColor={colors.text}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_event, picked) => picked && setDraft(picked)}
            style={styles.picker}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}

function WebDateInput({ mode, value, onChange, minimumDate, maximumDate }) {
  const format = (date) => (mode === 'datetime' ? `${toLocalDateInput(date)}T${toLocalTimeInput(date)}` : toLocalDateInput(date));
  return React.createElement('input', {
    type: mode === 'datetime' ? 'datetime-local' : 'date',
    value: format(value),
    min: minimumDate ? format(minimumDate) : undefined,
    max: maximumDate ? format(maximumDate) : undefined,
    onChange: (event) => {
      const raw = event.target.value;
      if (!raw) return;
      // Date-only strings parse as UTC midnight; anchor them to local noon.
      const next = new Date(mode === 'datetime' ? raw : `${raw}T12:00`);
      if (!Number.isNaN(next.getTime())) onChange(next);
    },
    style: {
      margin: `8px ${GUTTER}px 4px`,
      height: 54,
      padding: '0 18px',
      borderRadius: radius.md,
      border: 'none',
      outline: 'none',
      background: 'rgba(255,255,255,0.06)',
      color: colors.text,
      colorScheme: 'dark',
      fontFamily: 'Inter_400Regular, system-ui, sans-serif',
      fontSize: 16,
    },
  });
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    ...shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  cancel: { ...type.label, fontSize: 15, color: colors.textMuted },
  title: { ...type.heading, fontSize: 17, color: colors.text },
  done: { ...type.label, fontSize: 15, color: colors.accent },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: GUTTER, paddingTop: 14 },
  picker: { alignSelf: 'stretch', marginHorizontal: 8 },
});
