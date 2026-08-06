import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

const MOTIVATIONAL_API_URL = 'https://cdn.jsdelivr.net/gh/gomezmig03/MotivationalAPI/en.json';
const FALLBACK_PHRASES = [
  'Small steps today create a stronger financial future.',
  'Every expense you track puts you closer to your goals.',
  'Financial progress starts with one mindful choice.',
];

const getMotivationalPhrase = (data) => {
  const phrases = Array.isArray(data) ? data : data?.phrases || data?.quotes || [];
  const nonReligiousPhrases = phrases.filter((item) => item?.religion === 0);
  const phrase = nonReligiousPhrases[
    Math.floor(Math.random() * nonReligiousPhrases.length)
  ];

  if (typeof phrase === 'string') {
    return phrase;
  }

  return phrase?.phrase || phrase?.quote || phrase?.text || phrase?.message || null;
};

export default function LoadingScreen({ onComplete }) {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0.72)).current;
  const logoLift = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
  const [phrase, setPhrase] = useState(FALLBACK_PHRASES[0]);

  useEffect(() => {
    const listener = progressAnimation.addListener(({ value }) => setProgress(Math.round(value)));
    const animation = Animated.sequence([
      Animated.timing(progressAnimation, { toValue: 60, duration: 2000, useNativeDriver: false }),
      Animated.timing(progressAnimation, { toValue: 100, duration: 4000, useNativeDriver: false }),
    ]);
    const controller = new AbortController();
    const fallback = FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];

    setPhrase(fallback);
    animation.start();
    fetch(MOTIVATIONAL_API_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load motivational phrase.');
        return response.json();
      })
      .then((data) => setPhrase(getMotivationalPhrase(data) || fallback))
      .catch(() => setPhrase(fallback));

    const completeTimer = setTimeout(onComplete, 6000);

    return () => {
      animation.stop();
      progressAnimation.removeListener(listener);
      controller.abort();
      clearTimeout(completeTimer);
    };
  }, [onComplete, progressAnimation]);

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(logoGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(logoLift, { toValue: -5, duration: 1200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoGlow, { toValue: 0.72, duration: 1200, useNativeDriver: true }),
        Animated.timing(logoLift, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ]));
    animation.start();
    return () => animation.stop();
  }, [logoGlow, logoLift]);

  const width = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.brand}><Animated.View style={{ opacity: logoGlow, transform: [{ translateY: logoLift }] }}><Image source={require('../../assets/icon.png')} style={styles.logo} /></Animated.View><Text style={styles.brandName}>Velora</Text></View>
      <Text style={styles.tagline}>Tracking your finances has never been easier.</Text>
      <View style={styles.spacer} />
      <View style={styles.loadingArea}>
        <Text style={styles.phrase}>“{phrase}”</Text>
        <View style={styles.progressRow}><Text style={styles.loadingLabel}>Preparing your money space</Text><Text style={styles.percent}>{progress}%</Text></View>
        <View style={styles.track}><Animated.View style={[styles.fill, { width }]} /></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, padding: 28 },
  brand: { alignItems: 'center', marginTop: 22 },
  logo: { width: 60, height: 60, borderRadius: 16, marginBottom: 10 },
  brandName: { color: colors.text, fontSize: 23, fontWeight: '800', letterSpacing: 0.4 },
  tagline: { color: colors.textSoft, fontSize: 16, lineHeight: 24, marginTop: 22, maxWidth: 270 },
  spacer: { flex: 1 },
  loadingArea: { paddingBottom: 18 },
  phrase: { color: colors.primarySoft, fontSize: 16, fontStyle: 'italic', lineHeight: 24, textAlign: 'center', marginBottom: 28 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  loadingLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  percent: { color: colors.text, fontSize: 12, fontWeight: '800' },
  track: { height: 10, overflow: 'hidden', borderRadius: 5, backgroundColor: colors.surfaceMuted },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
});
