import React, { useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, GUTTER, radius, type } from '../theme';
import Input from '../components/Input';
import ListRow from '../components/ListRow';
import SheetHeader from '../components/SheetHeader';
import { SheetSurface } from '../components/Sheet';
import { currencyName, formatAmount, formatRatesDate } from '../lib/currency';

export default function ExchangeRatesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const rates = route.params?.rates;
  const updated = formatRatesDate(route.params?.updatedAt);

  // Matches names as well as codes, like the converter's picker ("yen" finds
  // JPY) — this list used to match codes only.
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return Object.entries(rates || {})
      .filter(([code]) => !query || code.toLowerCase().includes(query) || currencyName(code).toLowerCase().includes(query))
      .sort(([left], [right]) => left.localeCompare(right));
  }, [rates, search]);

  return (
    <SheetSurface>
      {/* Pushed full-screen, so the status bar inset applies on every
          platform — SheetHeader only adds it on Android. */}
      <View style={{ paddingTop: Platform.OS === 'android' ? 0 : insets.top }}>
        <SheetHeader
          grabber={false}
          title="Exchange rates"
          subtitle={`1 unit in CAD · ${updated || 'latest available'}`}
          onClose={() => navigation.goBack()}
          closeIcon="arrow-back"
        />
      </View>
      <View style={styles.content}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or code"
          autoCorrect={false}
          icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
          containerStyle={styles.search}
        />
        <FlatList
          data={rows}
          keyExtractor={([currency]) => currency}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          initialNumToRender={16}
          style={styles.list}
          contentContainerStyle={[rows.length ? styles.listCard : null, { marginBottom: insets.bottom + 16 }]}
          ListEmptyComponent={<Text style={styles.empty}>{rates ? `No currency matches “${search.trim()}”.` : 'No exchange rates loaded.'}</Text>}
          renderItem={({ item: [currency, rate], index }) => (
            <ListRow
              left={(
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{currency}</Text>
                </View>
              )}
              title={currencyName(currency)}
              subtitle={currency === 'CAD' ? 'Base currency' : `1 CAD = ${formatAmount(1 / Number(rate))} ${currency}`}
              right={<Text style={styles.rate}>{formatAmount(Number(rate))}</Text>}
              showDivider={index < rows.length - 1}
            />
          )}
        />
      </View>
    </SheetSurface>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: GUTTER },
  search: { marginBottom: 12 },
  list: { flex: 1 },
  listCard: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 4 },
  codeBadge: { width: 52, height: 40, borderRadius: radius.pill, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  codeText: { ...type.label, fontSize: 13, color: colors.text, letterSpacing: 0.3 },
  rate: { ...type.numeric, fontSize: 15, color: colors.text },
  empty: { ...type.body, color: colors.textMuted, textAlign: 'center', paddingTop: 28 },
});
