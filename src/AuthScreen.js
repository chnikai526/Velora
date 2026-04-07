import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const AuthScreen = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  authMode,
  setAuthMode,
  authMessage,
  setAuthMessage,
  handleRegister,
  handleLogin,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Velora Login</Text>
      <Text style={styles.loginSubtitle}>Use your Gmail and set up a password to continue.</Text>

      <View style={styles.authCard}>
        <Text style={styles.sectionLabel}>{authMode === 'register' ? 'Create account' : 'Sign in'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Gmail address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {authMode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}
        {authMessage ? <Text style={styles.authMessage}>{authMessage}</Text> : null}

        <TouchableOpacity
          style={styles.addButton}
          onPress={authMode === 'register' ? handleRegister : handleLogin}
        >
          <Text style={styles.addButtonText}>{authMode === 'register' ? 'Set password' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setAuthMode(authMode === 'register' ? 'login' : 'register');
            setAuthMessage('');
          }}
        >
          <Text style={styles.secondaryButtonText}>
            {authMode === 'register' ? 'Already have an account? Sign in' : 'Create a new account'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  loginSubtitle: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 20,
  },
  authCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 14,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  authMessage: {
    color: '#fca5a5',
    marginTop: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});

export default AuthScreen;