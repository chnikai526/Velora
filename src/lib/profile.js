import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (uid) => `velora-profile-${uid || 'guest'}`;

export const loadProfile = async (uid) => {
  try {
    const saved = await AsyncStorage.getItem(storageKey(uid));
    if (saved) return JSON.parse(saved);
  } catch (_error) {
    // Fall through to no saved profile if storage is unavailable or corrupted.
  }
  return null;
};

export const saveProfile = async (uid, profile) => {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(profile));
};
