import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StatusBar, StyleSheet } from 'react-native';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#111827" barStyle="light-content" />
      <View style={styles.brandBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>V</Text>
        </View>
        <Text style={styles.brandName}>Velora</Text>
        <Text style={styles.brandTag}>Smart finance, made calm.</Text>
      </View>
      <Text style={styles.loading}>Preparing your dashboard...</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    padding: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 44,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  logoLetter: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  brandName: {
    color: '#f9fafb',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  brandTag: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 260,
  },
  loading: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SplashScreen;
