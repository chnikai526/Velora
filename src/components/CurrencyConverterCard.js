import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { failExchangeRates, receiveExchangeRates, requestExchangeRates, setConverterAmount, setFromCurrency, setToCurrency, swapCurrencies } from '../../redux/Actions';
import colors from '../theme/colors';

const EXCHANGE_RATES_URL = 'https://bcd-api-dca-ipa.cbsa-asfc.cloud-nuage.canada.ca/exchange-rate-lambda/exchange-rates';
const SUPPORTED_CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'AUD', 'JPY'];

export default function CurrencyConverterCard() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const { amount, error, fromCurrency, isLoading, rates, toCurrency, updatedAt } = useSelector((state) => state.exchangeRates);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const minimumLoadingTime = new Promise((resolve) => setTimeout(resolve, 4200));
    dispatch(requestExchangeRates());
    loadingProgress.setValue(0);
    const progressAnimation = Animated.sequence([
      Animated.timing(loadingProgress, { toValue: 0.65, duration: 1400, useNativeDriver: false }),
      Animated.timing(loadingProgress, { toValue: 0.93, duration: 2600, useNativeDriver: false }),
    ]);
    progressAnimation.start();

    const loadRates = async () => {
      try {
        const response = await fetch(EXCHANGE_RATES_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load exchange rates.');
        const data = await response.json();
        const nextRates = { CAD: 1 };
        data?.ForeignExchangeRates?.forEach((item) => {
          const code = item?.FromCurrency?.Value;
          const rate = Number(item?.Rate);
          if (SUPPORTED_CURRENCIES.includes(code) && Number.isFinite(rate) && rate > 0) nextRates[code] = rate;
        });
        await minimumLoadingTime;
        if (!isActive) return;
        Animated.timing(loadingProgress, { toValue: 1, duration: 300, useNativeDriver: false }).start(() => {
          if (isActive) dispatch(receiveExchangeRates({ rates: nextRates, updatedAt: data?.ForeignExchangeRates?.[0]?.ExchangeRateEffectiveTimestamp ?? null }));
        });
      } catch (_error) {
        await minimumLoadingTime;
        if (isActive) dispatch(failExchangeRates('Rates are unavailable right now.'));
      }
    };

    void loadRates();
    return () => { isActive = false; controller.abort(); progressAnimation.stop(); };
  }, [dispatch, loadingProgress]);

  const convertedAmount = useMemo(() => {
    const numericAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numericAmount) || !rates[fromCurrency] || !rates[toCurrency]) return null;
    return (numericAmount * rates[fromCurrency]) / rates[toCurrency];
  }, [amount, fromCurrency, rates, toCurrency]);

  const swapSelectedCurrencies = () => {
    dispatch(swapCurrencies());
  };

  const CurrencySelector = ({ selected, onSelect }) => <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currencyRow}>{SUPPORTED_CURRENCIES.map((currency) => <TouchableOpacity key={currency} onPress={() => onSelect(currency)} style={[styles.currencyButton, selected === currency && styles.currencyButtonActive]}><Text style={[styles.currencyText, selected === currency && styles.currencyTextActive]}>{currency}</Text></TouchableOpacity>)}</ScrollView>;

  const loadingWidth = loadingProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return <View style={styles.card}><View style={styles.titleRow}><View><Text style={styles.title}>Currency converter</Text><Text style={styles.subtitle}>Live rates from the CBSA</Text></View><Ionicons name="swap-horizontal" size={24} color={colors.primarySoft}/></View>{isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.primarySoft}/><Text style={styles.loadingText}>Loading exchange rates…</Text><View style={styles.progressTrack}><Animated.View style={[styles.progressFill, { width: loadingWidth }]}/></View></View> : <><TextInput value={amount} onChangeText={(value) => dispatch(setConverterAmount(value))} keyboardType="decimal-pad" placeholder="Amount" placeholderTextColor={colors.textMuted} style={styles.amountInput}/><Text style={styles.selectorLabel}>From</Text><CurrencySelector selected={fromCurrency} onSelect={(currency) => dispatch(setFromCurrency(currency))}/><View style={styles.swapRow}><View style={styles.swapLine}/><TouchableOpacity onPress={swapSelectedCurrencies} style={styles.swapButton}><Ionicons name="swap-vertical" size={18} color={colors.text}/></TouchableOpacity><View style={styles.swapLine}/></View><Text style={styles.selectorLabel}>To</Text><CurrencySelector selected={toCurrency} onSelect={(currency) => dispatch(setToCurrency(currency))}/>{error ? <Text style={styles.error}>{error}</Text> : <><View style={styles.result}><Text style={styles.resultLabel}>Converted amount</Text><Text style={styles.resultValue}>{convertedAmount === null ? '—' : `${convertedAmount.toFixed(2)} ${toCurrency}`}</Text></View><TouchableOpacity onPress={() => navigation.getParent()?.navigate('ExchangeRates', { rates, updatedAt })} style={styles.ratesLink}><Text style={styles.ratesLinkText}>See current exchange rates</Text><Ionicons name="chevron-forward" size={16} color={colors.primarySoft}/></TouchableOpacity></>}</>}</View>;
}

const styles = StyleSheet.create({
  card:{backgroundColor:colors.surface,borderRadius:24,borderColor:colors.border,borderWidth:1,padding:18,marginBottom:25},titleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},title:{color:colors.text,fontSize:18,fontWeight:'800'},subtitle:{color:colors.textMuted,fontSize:11,marginTop:4},loading:{paddingVertical:25,alignItems:'center',gap:10},loadingText:{color:colors.textMuted,fontSize:13},progressTrack:{height:6,width:'82%',borderRadius:3,overflow:'hidden',backgroundColor:colors.surfaceMuted},progressFill:{height:'100%',backgroundColor:colors.primary,borderRadius:3},amountInput:{backgroundColor:colors.surfaceMuted,borderColor:colors.border,borderWidth:1,borderRadius:16,paddingHorizontal:15,paddingVertical:13,color:colors.text,fontSize:18,fontWeight:'700',marginBottom:16},selectorLabel:{color:colors.textSoft,fontSize:12,fontWeight:'700',marginBottom:8},currencyRow:{gap:8,paddingBottom:4},currencyButton:{paddingHorizontal:13,paddingVertical:9,borderRadius:12,backgroundColor:colors.surfaceMuted,borderWidth:1,borderColor:colors.border},currencyButtonActive:{backgroundColor:colors.primary,borderColor:colors.primary},currencyText:{color:colors.textMuted,fontSize:12,fontWeight:'700'},currencyTextActive:{color:colors.text},swapRow:{flexDirection:'row',alignItems:'center',gap:10,marginVertical:13},swapLine:{height:1,backgroundColor:colors.border,flex:1},swapButton:{width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center',backgroundColor:colors.primary},result:{marginTop:18,padding:15,borderRadius:16,backgroundColor:colors.surfaceMuted},resultLabel:{color:colors.textMuted,fontSize:11,marginBottom:5},resultValue:{color:colors.success,fontSize:24,fontWeight:'800'},ratesLink:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:17},ratesLinkText:{color:colors.primarySoft,fontSize:13,fontWeight:'800'},error:{color:colors.dangerSoft,fontSize:13,marginTop:16},
});
