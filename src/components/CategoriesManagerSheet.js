import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, SECTION_GAP, type } from '../theme';
import { SUGGESTED_CATEGORIES, createCustomCategory, findSuggestedCategory, loadCategoryPrefs, resolveActiveCategories, saveCategoryPrefs } from '../lib/categories';
import Input from './Input';
import Button from './Button';
import Chip from './Chip';
import Card from './Card';
import ListRow from './ListRow';
import Sheet from './Sheet';

export default function CategoriesManagerSheet({ visible, uid, onClose }) {
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState({ enabledIds: [], custom: [] });
  const [newLabel, setNewLabel] = useState('');
  const [notice, setNotice] = useState('');

  // Clear the half-typed name each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) {
      setNewLabel('');
      setNotice('');
    }
  }

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    loadCategoryPrefs(uid).then((saved) => { if (active) setPrefs(saved); });
    return () => { active = false; };
  }, [visible, uid]);

  const persist = (next) => {
    setPrefs(next);
    saveCategoryPrefs(uid, next).catch(() => undefined);
  };

  const active = resolveActiveCategories(prefs);
  const activeLabels = active.map((item) => item.label.toLowerCase());
  const suggestions = SUGGESTED_CATEGORIES.filter((item) => !prefs.enabledIds.includes(item.id));
  // Keep at least one: with none left, the expense form silently fell back
  // to the entire catalog, which looked like the removals hadn't saved.
  const canRemove = active.length > 1;

  const addSuggested = (item) => persist({ ...prefs, enabledIds: [...prefs.enabledIds, item.id] });
  const remove = (item) => {
    if (!canRemove) return;
    if (item.id.startsWith('custom-')) persist({ ...prefs, custom: prefs.custom.filter((entry) => entry.id !== item.id) });
    else persist({ ...prefs, enabledIds: prefs.enabledIds.filter((id) => id !== item.id) });
  };

  const trimmed = newLabel.trim();
  const addCustom = () => {
    if (!trimmed) return;
    if (activeLabels.includes(trimmed.toLowerCase())) {
      setNotice(`“${trimmed}” is already in your categories.`);
      return;
    }
    // Typing the name of a built-in category re-enables it (with its icon)
    // instead of creating a duplicate custom one.
    const suggested = findSuggestedCategory(trimmed);
    if (suggested) persist({ ...prefs, enabledIds: [...prefs.enabledIds, suggested.id] });
    else persist({ ...prefs, custom: [...prefs.custom, createCustomCategory(trimmed)] });
    setNewLabel('');
    setNotice('');
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Categories" subtitle={`${active.length} in use`}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.copy}>Choose which categories show up when you log an expense, or add your own.</Text>

        <Text style={styles.sectionTitle}>Your categories</Text>
        <Card contentStyle={styles.activeCardContent}>
          {active.map((item, index) => (
            <ListRow
              key={item.id}
              icon={<Ionicons name={item.icon} />}
              title={item.label}
              subtitle={item.id.startsWith('custom-') ? 'Custom' : null}
              showDivider={index < active.length - 1}
              right={
                <Pressable
                  hitSlop={8}
                  disabled={!canRemove}
                  onPress={() => remove(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.label}`}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed, !canRemove && styles.removeDisabled]}
                >
                  <Ionicons name="remove" size={16} color={colors.textSoft} />
                </Pressable>
              }
            />
          ))}
        </Card>
        {!canRemove ? <Text style={styles.hint}>Keep at least one category so expenses always have one to use.</Text> : null}

        {suggestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Suggested</Text>
            <View style={styles.chipsWrap}>
              {suggestions.map((item) => (
                <Chip key={item.id} label={item.label} icon={item.icon} trailingIcon="add" onPress={() => addSuggested(item)} accessibilityLabel={`Add ${item.label}`} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Add your own</Text>
        <Input
          value={newLabel}
          onChangeText={(text) => { setNewLabel(text); setNotice(''); }}
          placeholder="e.g. Home office"
          returnKeyType="done"
          maxLength={24}
          onSubmitEditing={addCustom}
          icon={<Ionicons name="pricetag-outline" size={18} color={colors.textMuted} />}
        />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Button onPress={addCustom} label="Add category" icon={<Ionicons name="add" size={19} color={colors.text} />} variant="secondary" disabled={!trimmed} />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  copy: { ...type.body, color: colors.textMuted, paddingHorizontal: 4 },
  sectionTitle: { ...type.heading, color: colors.text, marginBottom: 12, marginTop: SECTION_GAP, paddingHorizontal: 4 },
  activeCardContent: { paddingVertical: 4, paddingHorizontal: 16 },
  removeButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass },
  removeButtonPressed: { opacity: 0.7 },
  removeDisabled: { opacity: 0.3 },
  hint: { ...type.caption, color: colors.textMuted, marginTop: 10, paddingHorizontal: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notice: { ...type.caption, color: colors.accent, marginTop: -6, marginBottom: 12, paddingHorizontal: 4 },
});
