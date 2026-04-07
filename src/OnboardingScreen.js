import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';

const OnboardingScreen = ({ onStart }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Velora</Text>
        <Text style={styles.subtitle}>A clean and modern way to track your money, borrowings, and savings in one place.</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featurePoint}>•</Text>
          <Text style={styles.featureText}>Track income, expenses, and balances.</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featurePoint}>•</Text>
          <Text style={styles.featureText}>Save payment methods and manage cards.</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featurePoint}>•</Text>
          <Text style={styles.featureText}>Record borrowed or given money easily.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: '90%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  featurePoint: {
    color: '#2563eb',
    fontSize: 22,
    marginRight: 10,
    lineHeight: 24,
  },
  featureText: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
