import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, type } from '../theme';
import ScreenBackground from '../components/ScreenBackground';
import TickRuler from '../components/TickRuler';

const MOTIVATIONAL_API_URL = 'https://cdn.jsdelivr.net/gh/gomezmig03/MotivationalAPI/en.json';
const FALLBACK_PHRASES = [
  'Small steps today create a stronger financial future.',
  'Every expense you track puts you closer to your goals.',
  'Financial progress starts with one mindful choice.',
];

const getMotivationalPhrase = (data) => {
  const phrases = Array.isArray(data) ? data : data?.phrases || data?.quotes || [];
  const nonReligiousPhrases = phrases.filter((item) => item?.religion === 0);
  const phrase = nonReligiousPhrases[Math.floor(Math.random() * nonReligiousPhrases.length)];

  if (typeof phrase === 'string') return phrase;
  return phrase?.phrase || phrase?.quote || phrase?.text || phrase?.message || null;
};

export default function LoadingScreen({ onComplete }) {
  const [progressAnimation] = useState(() => new Animated.Value(0));
  const [progress, setProgress] = useState(0);
  const [fallback] = useState(() => FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)]);
  const [phrase, setPhrase] = useState(fallback);

  useEffect(() => {
    const listener = progressAnimation.addListener(({ value }) => setProgress(Math.round(value)));
    const animation = Animated.sequence([
      Animated.timing(progressAnimation, { toValue: 60, duration: 2000, useNativeDriver: false }),
      Animated.timing(progressAnimation, { toValue: 100, duration: 4000, useNativeDriver: false }),
    ]);
    const controller = new AbortController();

    animation.start();
    fetch(MOTIVATIONAL_API_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load motivational phrase.');
        return response.json();
      })
      .then((data) => setPhrase(getMotivationalPhrase(data) || fallback))
      .catch(() => undefined);

    const completeTimer = setTimeout(onComplete, 6000);

    return () => {
      animation.stop();
      progressAnimation.removeListener(listener);
      controller.abort();
      clearTimeout(completeTimer);
    };
  }, [fallback, onComplete, progressAnimation]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.brand}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.brandName}>Velora</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.caption}>Preparing your{'\n'}money space</Text>
          <Text style={styles.percent}>{progress}<Text style={styles.percentSign}>%</Text></Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Syncing your data</Text>
          </View>
          <TickRuler ratio={progress / 100} style={styles.ruler} />
        </View>

        <Text style={styles.phrase}>“{phrase}”</Text>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 28, paddingBottom: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  logo: { width: 34, height: 34, borderRadius: 10 },
  brandName: { ...type.heading, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  caption: { ...type.heading, fontSize: 21, lineHeight: 25, color: colors.text, textAlign: 'center' },
  percent: { ...type.hero, fontSize: 104, lineHeight: 116, color: colors.text, marginTop: 6 },
  percentSign: { fontSize: 44, color: colors.textSoft },
  pill: { height: 40, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', justifyContent: 'center' },
  pillText: { ...type.label, fontSize: 16, color: colors.text },
  ruler: { alignSelf: 'stretch', marginTop: 28 },
  phrase: { ...type.body, fontStyle: 'italic', color: colors.textMuted, textAlign: 'center', marginBottom: 12 },
});
