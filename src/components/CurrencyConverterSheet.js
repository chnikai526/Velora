import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  failExchangeRates,
  receiveExchangeRates,
  requestExchangeRates,
  setConverterAmount,
  setFromCurrency,
  setToCurrency,
  swapCurrencies,
} from '../../redux/Actions';
import { colors, GUTTER, radius, SECTION_GAP, type } from '../theme';
import { convert, currencyName, fetchRates, formatAmount, formatRatesDate, loadCachedRates, saveCachedRates } from '../lib/currency';
import AmountField from './AmountField';
import Button from './Button';
import Card from './Card';
import GradientCard from './GradientCard';
import IconButton from './IconButton';
import Chip from './Chip';
import Input from './Input';
import ListRow from './ListRow';
import Sheet from './Sheet';

const QUICK_PICKS = ['CAD', 'USD', 'INR', 'EUR', 'GBP'];

export default function CurrencyConverterSheet({ visible, onClose, onViewAllRates }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { amount, error, fromCurrency, isLoading, rates, toCurrency, updatedAt } = useSelector((state) => state.exchangeRates);
  // null when the converter is showing; 'from' | 'to' while picking a currency.
  const [picking, setPicking] = useState(null);
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const hasRates = Object.keys(rates).length > 1;

  useEffect(() => {
    if (!visible) return undefined;
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      dispatch(requestExchangeRates());

      // Show cached rates immediately so the sheet is usable offline and never
      // opens to a spinner, then refresh in the background.
      const cached = await loadCachedRates();
      if (active && cached?.rates) dispatch(receiveExchangeRates(cached));

      try {
        const fresh = await fetchRates(controller.signal);
        if (!active) return;
        dispatch(receiveExchangeRates(fresh));
        void saveCachedRates(fresh);
      } catch (_error) {
        if (!active || controller.signal.aborted) return;
        if (cached?.rates) dispatch(receiveExchangeRates(cached));
        else dispatch(failExchangeRates('Rates are unavailable right now.'));
      }
    };

    void load();
    return () => { active = false; controller.abort(); };
  }, [visible, dispatch, reloadKey]);

  // Always reopen on the converter, not a half-finished picker.
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (!visible) { setPicking(null); setSearch(''); }
  }

  const currencyCodes = useMemo(() => Object.keys(rates).sort(), [rates]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currencyCodes;
    return currencyCodes.filter((code) => code.toLowerCase().includes(query) || currencyName(code).toLowerCase().includes(query));
  }, [currencyCodes, search]);

  const converted = useMemo(() => convert(amount, fromCurrency, toCurrency, rates), [amount, fromCurrency, toCurrency, rates]);
  const unitRate = useMemo(() => convert('1', fromCurrency, toCurrency, rates), [fromCurrency, toCurrency, rates]);
  const quickPicks = QUICK_PICKS.filter((code) => code !== toCurrency && code !== fromCurrency && rates[code]);
  const ratesDate = formatRatesDate(updatedAt);

  const openPicker = (which) => { setSearch(''); setPicking(which); };
  const choose = (code) => {
    const other = picking === 'from' ? toCurrency : fromCurrency;
    // Picking the currency already on the other side swaps them instead of
    // converting a currency into itself.
    if (code === other) dispatch(swapCurrencies());
    else dispatch(picking === 'from' ? setFromCurrency(code) : setToCurrency(code));
    setPicking(null);
    setSearch('');
  };

  const showSpinner = isLoading && !hasRates;
  const selectedCode = picking === 'from' ? fromCurrency : toCurrency;

  return (
    <Sheet
      visible={visible}
      onClose={picking ? () => setPicking(null) : onClose}
      title={picking ? `Convert ${picking === 'from' ? 'from' : 'to'}` : 'Currency converter'}
      subtitle={picking ? `${currencyCodes.length} currencies` : ratesDate ? `Rates from ${ratesDate}` : null}
      closeIcon={picking ? 'arrow-back' : 'chevron-down'}
    >
      {picking ? (
        <View style={styles.pickerBody}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search name or code"
            autoCorrect={false}
            autoFocus={Platform.OS !== 'android'}
            icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
            containerStyle={styles.search}
          />
          <FlatList
            data={results}
            keyExtractor={(code) => code}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={14}
            showsVerticalScrollIndicator={false}
            style={styles.pickerList}
            contentContainerStyle={[styles.pickerListContent, { paddingBottom: insets.bottom + 16 }]}
            ListEmptyComponent={<Text style={styles.empty}>No currency matches “{search.trim()}”.</Text>}
            renderItem={({ item, index }) => {
              const selected = item === selectedCode;
              return (
                <ListRow
                  icon={<Ionicons name={selected ? 'checkmark' : 'cash-outline'} />}
                  iconColor={selected ? colors.accentText : colors.textMuted}
                  iconBg={selected ? colors.accent : colors.glass}
                  title={item}
                  subtitle={currencyName(item) !== item ? currencyName(item) : null}
                  onPress={() => choose(item)}
                  showDivider={index < results.length - 1}
                />
              );
            }}
          />
        </View>
      ) : showSpinner ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Loading exchange rates…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <GradientCard tone="halo" radius={radius.xl} contentStyle={styles.amountContent}>
            <Text style={styles.prompt}>How much {fromCurrency}?</Text>
            <AmountField
              label={null}
              prefix={null}
              suffix={fromCurrency}
              value={amount}
              fontSize={52}
              accessibilityLabel={`Amount in ${fromCurrency}`}
              onChangeText={(next) => dispatch(setConverterAmount(next))}
            />
          </GradientCard>

          <Card style={styles.pairCard} contentStyle={styles.pairContent}>
            <CurrencyRow label="From" code={fromCurrency} onPress={() => openPicker('from')} />
            <View style={styles.swapRow}>
              <View style={styles.swapLine} />
              <IconButton
                accessibilityLabel="Swap currencies"
                onPress={() => dispatch(swapCurrencies())}
                icon={<Ionicons name="swap-vertical" size={18} color={colors.pillText} />}
                variant="primary"
                size={38}
              />
              <View style={styles.swapLine} />
            </View>
            <CurrencyRow label="To" code={toCurrency} onPress={() => openPicker('to')} />
          </Card>

          <GradientCard tone="ember" radius={radius.xl} style={styles.result} contentStyle={styles.resultContent}>
            <Text style={styles.resultLabel}>{formatAmount(Number.parseFloat(amount) || 0)} {fromCurrency} is</Text>
            <Text style={styles.resultValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {converted === null ? '—' : formatAmount(converted)}
              <Text style={styles.resultCode}> {toCurrency}</Text>
            </Text>
            {unitRate !== null && (
              <View style={styles.ratePill}>
                <Text style={styles.rateLine}>1 {fromCurrency} = {formatAmount(unitRate)} {toCurrency}</Text>
              </View>
            )}
          </GradientCard>

          {quickPicks.length > 0 && (
            <View style={styles.quickRow}>
              {quickPicks.map((code) => (
                <Chip key={code} label={`to ${code}`} icon="swap-horizontal" onPress={() => dispatch(setToCurrency(code))} />
              ))}
            </View>
          )}

          {error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.error}>{error}</Text>
              <Button label="Try again" variant="secondary" size="md" icon={<Ionicons name="refresh" size={17} color={colors.text} />} onPress={() => setReloadKey((n) => n + 1)} style={styles.retry} />
            </View>
          ) : (
            <>
              <Text style={styles.updated}>{isLoading ? 'Refreshing rates…' : ratesDate ? `Rates updated ${ratesDate}` : 'Live rates'}</Text>
              {onViewAllRates && hasRates ? (
                <Card style={styles.linkCard} contentStyle={styles.linkContent}>
                  <ListRow
                    icon={<Ionicons name="list-outline" />}
                    title={`All ${currencyCodes.length} exchange rates`}
                    subtitle="Value of each currency in CAD"
                    onPress={() => onViewAllRates({ rates, updatedAt })}
                    showDivider={false}
                    right={<Ionicons name="chevron-forward" size={16} color={colors.textFaint} />}
                  />
                </Card>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </Sheet>
  );
}

function CurrencyRow({ label, code, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label} currency, ${code}`} style={({ pressed }) => [styles.currencyRow, pressed && styles.pressed]}>
      <View style={styles.codeBadge}>
        <Text style={styles.codeBadgeText}>{code.slice(0, 3)}</Text>
      </View>
      <View style={styles.currencyText}>
        <Text style={styles.currencyLabel}>{label}</Text>
        <Text style={styles.currencyName} numberOfLines={1}>{currencyName(code)}</Text>
      </View>
      <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  pickerBody: { flex: 1, paddingHorizontal: GUTTER },
  search: { marginBottom: 12 },
  pickerList: { flex: 1 },
  pickerListContent: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 4, overflow: 'hidden' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { ...type.body, color: colors.textMuted },
  empty: { ...type.body, color: colors.textMuted, textAlign: 'center', paddingVertical: 28 },
  amountContent: { alignItems: 'center', paddingTop: 22, paddingBottom: 24, paddingHorizontal: 18 },
  prompt: { ...type.heading, fontSize: 17, color: colors.textSoft, marginBottom: 4 },
  pairCard: { marginTop: 8 },
  pairContent: { paddingVertical: 6, paddingHorizontal: 16 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  pressed: { opacity: 0.75 },
  codeBadge: { width: 48, height: 40, borderRadius: radius.pill, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  codeBadgeText: { ...type.label, fontSize: 13, color: colors.text, letterSpacing: 0.3 },
  currencyText: { flex: 1, marginRight: 12 },
  currencyLabel: { ...type.caption, color: colors.textMuted },
  currencyName: { ...type.label, fontSize: 16, color: colors.text, marginTop: 2 },
  swapRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swapLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
  result: { marginTop: 8 },
  resultContent: { padding: 22 },
  resultLabel: { ...type.label, fontSize: 15, color: colors.textSoft, marginBottom: 6 },
  resultValue: { ...type.display, fontSize: 38, lineHeight: 44, color: colors.text },
  resultCode: { ...type.heading, fontSize: 18, color: colors.textSoft },
  ratePill: { alignSelf: 'flex-start', marginTop: 14, height: 32, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'center' },
  rateLine: { ...type.label, fontSize: 13, color: colors.textSoft },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  updated: { ...type.caption, color: colors.textFaint, marginTop: 18, textAlign: 'center' },
  linkCard: { marginTop: SECTION_GAP },
  linkContent: { paddingVertical: 2, paddingHorizontal: 16 },
  errorBlock: { marginTop: 20, alignItems: 'center', gap: 12 },
  error: { ...type.body, fontSize: 13, color: colors.negative, textAlign: 'center' },
  retry: { alignSelf: 'center', minWidth: 180 },
});
