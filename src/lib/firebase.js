import { Platform } from 'react-native';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const REQUIRED_CONFIG_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const readConfig = (prefix) => ({
  apiKey: process.env[`${prefix}API_KEY`],
  authDomain: process.env[`${prefix}AUTH_DOMAIN`],
  projectId: process.env[`${prefix}PROJECT_ID`],
  storageBucket: process.env[`${prefix}STORAGE_BUCKET`],
  messagingSenderId: process.env[`${prefix}MESSAGING_SENDER_ID`],
  appId: process.env[`${prefix}APP_ID`],
});

const hasRequiredConfig = (config) =>
  REQUIRED_CONFIG_KEYS.every((key) => Boolean(config[key]));

const initializeNamedApp = (name, config) => {
  const existingApp = getApps().find((app) => app.name === name);

  if (existingApp) {
    return existingApp;
  }

  return name === '[DEFAULT]'
    ? initializeApp(config)
    : initializeApp(config, name);
};

const primaryConfig = readConfig('EXPO_PUBLIC_FIREBASE_');
const backupConfig = readConfig('EXPO_PUBLIC_BACKUP_FIREBASE_');

const primaryFirebaseEnabled = hasRequiredConfig(primaryConfig);
const backupFirebaseEnabled = hasRequiredConfig(backupConfig);

const primaryApp = primaryFirebaseEnabled
  ? initializeNamedApp('[DEFAULT]', primaryConfig)
  : null;

const backupApp = backupFirebaseEnabled
  ? initializeNamedApp('backup', backupConfig)
  : null;

const primaryDb = primaryApp ? getFirestore(primaryApp) : null;
const backupDb = backupApp ? getFirestore(backupApp) : null;
// initializeAuth throws `auth/already-initialized` if this module is evaluated
// twice — which Fast Refresh does on every edit — so fall back to the instance
// that already exists instead of taking the whole app down in development.
const createAuth = (app) => {
  try {
    return Platform.OS === 'web'
      ? initializeAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
  } catch (_error) {
    return getAuth(app);
  }
};

export const primaryAuth = primaryApp ? createAuth(primaryApp) : null;

export const getConfiguredDatabases = () =>
  [
    primaryDb ? { label: 'primary', db: primaryDb } : null,
    backupDb ? { label: 'backup', db: backupDb } : null,
  ].filter(Boolean);
