import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { primaryAuth } from '../lib/firebase';
import { useDispatch } from 'react-redux';
import { startPostLoginLoading } from '../../redux/Actions';
import colors from '../theme/colors';

const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Email/password sign-in is not enabled in Firebase Authentication yet.';
    case 'auth/email-already-in-use':
      return 'That email is already in use. Try logging in instead.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Your Firebase API key looks invalid for this app.';
    case 'auth/app-not-authorized':
      return 'This app is not authorized in Firebase yet. Check your Firebase app setup.';
    case 'auth/unauthorized-domain':
      return 'This domain is not allowed in Firebase Authentication yet.';
    case 'auth/invalid-credential':
      return 'Your credentials are invalid. Please try signing in again.';
    case 'auth/invalid-email':
      return 'The email address format looks wrong. Use a valid email like user@example.com.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Your email or password is incorrect.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/missing-password':
      return 'Enter your password to continue.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    default:
      return 'Something went wrong with Firebase Auth. Please try again.';
  }
};

const getAuthErrorDetail = (error) => {
  if (!error?.code) {
    return null;
  }

  if (
    error.code === 'auth/operation-not-allowed' ||
    error.code === 'auth/configuration-not-found'
  ) {
    return 'Firebase Console -> Authentication -> Sign-in method -> enable Email/Password.';
  }

  return `Firebase error: ${error.code}`;
};

export default function AuthScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSignup = mode === 'signup';
  const isFirebaseReady = Boolean(primaryAuth);

  const showError = (title, message) => {
    setErrorMessage(message);
    Alert.alert(title, message);
  };

  const clearError = () => setErrorMessage('');

  const handlePasswordReset = async () => {
    clearError();

    if (!isFirebaseReady) {
      showError(
        'Firebase not configured',
        'Add valid Firebase credentials in .env before resetting passwords.'
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      showError(
        'Email required',
        'Enter your email first, then tap Forgot password.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(primaryAuth, normalizedEmail);
      Alert.alert(
        'Reset email sent',
        'Check your inbox for the Firebase password reset link.'
      );
    } catch (error) {
      console.warn('Firebase password reset error:', error.code, error.message);

      showError(
        'Unable to reset password',
        [getAuthErrorMessage(error), getAuthErrorDetail(error)]
          .filter(Boolean)
          .join('\n\n')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    clearError();

    if (!isFirebaseReady) {
      showError(
        'Firebase not configured',
        'Add valid Firebase credentials in .env before signing in or creating an account.'
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      showError('Missing fields', 'Enter your email and password first.');
      return;
    }

    if (isSignup && !fullName.trim()) {
      showError('Missing name', 'Add your full name to create an account.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        const credentials = await createUserWithEmailAndPassword(
          primaryAuth,
          normalizedEmail,
          password
        );

        if (fullName.trim()) {
          await updateProfile(credentials.user, {
            displayName: fullName.trim(),
          });
        }
      } else {
        await signInWithEmailAndPassword(primaryAuth, normalizedEmail, password);
      }

      dispatch(startPostLoginLoading());

      setPassword('');
      if (isSignup) {
        setFullName('');
      }
    } catch (error) {
      console.warn('Firebase Auth error:', error?.code, error?.message || error);

      showError(
        isSignup ? 'Unable to create account' : 'Unable to sign in',
        [getAuthErrorMessage(error), getAuthErrorDetail(error)]
          .filter(Boolean)
          .join('\n\n') || (error?.message || String(error))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.brandRow}>
              <Image source={require('../../assets/icon.png')} style={styles.brandIcon} />
              <Text style={styles.kicker}>Velora</Text>
            </View>
            <Text style={styles.title}>
              {isSignup ? 'Create your money space.' : 'Welcome back.'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? 'Start tracking your spending in one clean flow.'
                : 'Sign in to get back to your expense dashboard.'}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggle, !isSignup && styles.toggleActive]}
                onPress={() => setMode('login')}
                disabled={isSubmitting}
              >
                <Text
                  style={[styles.toggleText, !isSignup && styles.toggleTextActive]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggle, isSignup && styles.toggleActive]}
                onPress={() => setMode('signup')}
                disabled={isSubmitting}
              >
                <Text
                  style={[styles.toggleText, isSignup && styles.toggleTextActive]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {isSignup ? (
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
                autoCapitalize="words"
                textContentType="name"
                style={styles.input}
              />
            ) : null}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              style={styles.input}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              textContentType={isSignup ? 'newPassword' : 'password'}
              style={styles.input}
            />

            <Text style={styles.fieldHint}>
              {isSignup
                ? 'Use at least 6 characters. Email/Password must be enabled in Firebase Auth.'
                : 'Use the same email/password you registered with in Firebase Auth.'}
            </Text>

            {!isSignup ? (
              <TouchableOpacity
                onPress={() => void handlePasswordReset()}
                disabled={isSubmitting}
                style={styles.secondaryLinkButton}
              >
                <Text style={styles.secondaryLinkText}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
              ]}
              onPress={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting
                  ? isSignup
                    ? 'Creating account...'
                    : 'Signing in...'
                  : isSignup
                    ? 'Create account'
                    : 'Continue'}
              </Text>
            </TouchableOpacity>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Text style={styles.helperText}>
              {isSignup
                ? 'Already have an account? Switch to Login.'
                : 'New here? Switch to Sign Up to create a fresh account.'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    marginRight: 10,
  },
  kicker: {
    color: colors.primarySoft,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    padding: 4,
    marginBottom: 18,
  },
  fieldHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -2,
    marginBottom: 10,
  },
  secondaryLinkButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  secondaryLinkText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  toggle: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.text,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
});
