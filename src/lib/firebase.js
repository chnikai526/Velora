import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

export const primaryFirebaseEnabled = hasRequiredConfig(primaryConfig);
export const backupFirebaseEnabled = hasRequiredConfig(backupConfig);

export const primaryApp = primaryFirebaseEnabled
  ? initializeNamedApp('[DEFAULT]', primaryConfig)
  : null;

export const backupApp = backupFirebaseEnabled
  ? initializeNamedApp('backup', backupConfig)
  : null;

export const primaryDb = primaryApp ? getFirestore(primaryApp) : null;
export const backupDb = backupApp ? getFirestore(backupApp) : null;
export const primaryAuth = primaryApp ? getAuth(primaryApp) : null;

export const getConfiguredDatabases = () =>
  [
    primaryDb ? { label: 'primary', db: primaryDb } : null,
    backupDb ? { label: 'backup', db: backupDb } : null,
  ].filter(Boolean);
