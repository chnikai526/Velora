import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVATARS } from '../components/avatars/AnimalAvatar';

const friendsKey = (uid) => `velora-friends-${uid || 'guest'}`;
const ledgerKey = (uid) => `velora-friends-ledger-${uid || 'guest'}`;

export const loadFriends = async (uid) => {
  try {
    const saved = await AsyncStorage.getItem(friendsKey(uid));
    if (saved) return JSON.parse(saved);
  } catch (_error) {
    // Fall through to an empty list if storage is unavailable or corrupted.
  }
  return [];
};

export const saveFriends = async (uid, friends) => {
  await AsyncStorage.setItem(friendsKey(uid), JSON.stringify(friends));
};

export const loadLedger = async (uid) => {
  try {
    const saved = await AsyncStorage.getItem(ledgerKey(uid));
    if (saved) return JSON.parse(saved);
  } catch (_error) {
    // Fall through to an empty ledger if storage is unavailable or corrupted.
  }
  return [];
};

export const saveLedger = async (uid, entries) => {
  await AsyncStorage.setItem(ledgerKey(uid), JSON.stringify(entries));
};

export const createFriend = (name) => ({
  id: `friend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: name.trim(),
  createdAt: new Date().toISOString(),
});

// Deterministic avatar assignment from the friend's name, so a friend gets a
// consistent animal icon without needing its own avatar-picker UI, and the
// preview shown while typing a new name already matches the final result.
export const avatarForFriend = (name = '') => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  return AVATARS[hash % AVATARS.length].id;
};

// Positive balance = the friend owes you (you lent more than you borrowed);
// negative = you owe the friend.
// Rounded to cents: summing floats like 0.1 + 0.2 - 0.3 leaves a tiny
// remainder that would otherwise show as "owes you $0.00".
export const getFriendBalance = (entries, friendId) => Math.round(entries
  .filter((entry) => entry.friendId === friendId)
  .reduce((sum, entry) => sum + (entry.type === 'lend' ? entry.amount : -entry.amount), 0) * 100) / 100;

export const getTotals = (friends, entries) => friends.reduce((totals, friend) => {
  const balance = getFriendBalance(entries, friend.id);
  if (balance > 0) totals.owedToYou += balance;
  else if (balance < 0) totals.youOwe += Math.abs(balance);
  return totals;
}, { owedToYou: 0, youOwe: 0 });
