import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { primaryAuth } from '../lib/firebase';
import { useDispatch } from 'react-redux';
import { finishPostLoginLoading, setCurrentUser, startPostLoginLoading } from '../../redux/Actions';
import { colors, radius, type } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import ScreenBackground from '../components/ScreenBackground';
import SegmentedControl from '../components/SegmentedControl';

const MODES = [
  { key: 'login', label: 'Log in' },
  { key: 'signup', label: 'Sign up' },
];

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

  // Switching tabs starts a fresh attempt — carrying the previous mode's
  // error over made it look like the new form had already failed.
  const selectMode = (nextMode) => {
    setMode(nextMode);
    clearError();
  };

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
    // Raised before the request: Firebase fires onAuthStateChanged the moment
    // credentials resolve, so setting this afterwards let the main app render
    // for a frame before the loading screen took over.
    dispatch(startPostLoginLoading());

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
          // onAuthStateChanged already published this user without a
          // displayName; re-publish so the greeting and profile show the name
          // instead of falling back to "there" / the email prefix.
          dispatch(setCurrentUser(credentials.user));
        }
      } else {
        await signInWithEmailAndPassword(primaryAuth, normalizedEmail, password);
      }

      setPassword('');
      if (isSignup) {
        setFullName('');
      }
    } catch (error) {
      dispatch(finishPostLoginLoading());
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
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.hero}>
              <View style={styles.brandRow}>
                <Image source={require('../../assets/icon.png')} style={styles.brandIcon} />
                <Text style={styles.brandName}>Velora</Text>
              </View>
              <Text style={styles.title}>
                {isSignup ? 'Create your\nmoney space' : 'Welcome\nback'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignup
                  ? 'Start tracking your spending in one clean flow.'
                  : 'Sign in to get back to your expense dashboard.'}
              </Text>
            </View>

            <Card radius={radius.xl} contentStyle={styles.cardContent}>
              <SegmentedControl options={MODES} value={mode} onChange={selectMode} disabled={isSubmitting} style={styles.toggleRow} />

              {isSignup ? (
                <Input
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  autoCorrect={false}
                  autoCapitalize="words"
                  textContentType="name"
                />
              ) : null}

              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
              />

              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                textContentType={isSignup ? 'newPassword' : 'password'}
              />

              <Text style={styles.fieldHint}>
                {isSignup
                  ? 'Use at least 6 characters. Email/Password must be enabled in Firebase Auth.'
                  : 'Use the same email/password you registered with in Firebase Auth.'}
              </Text>

              {!isSignup ? (
                <Pressable
                  onPress={() => void handlePasswordReset()}
                  disabled={isSubmitting}
                  style={styles.secondaryLinkButton}
                >
                  <Text style={styles.secondaryLinkText}>Forgot password?</Text>
                </Pressable>
              ) : null}

              <Button
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
                style={styles.primaryButton}
                label={
                  isSubmitting
                    ? isSignup
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isSignup
                      ? 'Create account'
                      : 'Continue'
                }
              />

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <Text style={styles.helperText}>
                {isSignup
                  ? 'Already have an account? Switch to Log in.'
                  : 'New here? Switch to Sign up to create a fresh account.'}
              </Text>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  hero: { alignItems: 'center', marginBottom: 28, paddingHorizontal: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  brandIcon: { width: 34, height: 34, borderRadius: 10 },
  brandName: { ...type.heading, color: colors.text },
  title: { ...type.display, fontSize: 42, lineHeight: 46, color: colors.text, textAlign: 'center', marginBottom: 12 },
  subtitle: { ...type.body, color: colors.textSoft, textAlign: 'center' },
  cardContent: { padding: 20 },
  toggleRow: { backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 18 },
  fieldHint: { ...type.caption, lineHeight: 18, color: colors.textMuted, marginTop: -2, marginBottom: 10, paddingHorizontal: 4 },
  secondaryLinkButton: { alignSelf: 'flex-start', marginBottom: 16, paddingHorizontal: 4 },
  secondaryLinkText: { ...type.label, color: colors.accent },
  primaryButton: { marginTop: 4, alignSelf: 'stretch' },
  helperText: { ...type.body, fontSize: 13, color: colors.textMuted, marginTop: 16, textAlign: 'center' },
  errorText: { ...type.body, fontSize: 13, color: colors.negative, marginTop: 12, textAlign: 'center' },
});
