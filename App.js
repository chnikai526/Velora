import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import AppNavigator from './src/navigation/AppNavigator';
import {
  addTransaction as addTransactionAction,
  removeTransaction as removeTransactionAction,
  setCurrentUser,
  setTransactions,
  finishPostLoginLoading,
  updateTransaction as updateTransactionAction,
} from './redux/Actions';
import { getConfiguredDatabases, primaryAuth } from './src/lib/firebase';
import { collectDueOccurrences, countElapsedOccurrences, isValidInterval } from './src/lib/recurring';
import { colors } from './src/theme';
import store from './redux/Store';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Dark navigation theme so screen transitions and the native header never
// flash white between the app's dark surfaces.
const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, primary: colors.accent, border: 'transparent' },
};

const getTransactionsCollection = (db, userId) =>
  collection(db, 'users', userId, 'transactions');

const getTransactionDocument = (db, userId, transactionId) =>
  doc(db, 'users', userId, 'transactions', transactionId);

const parseTransaction = (snapshot) => {
  const data = snapshot.data();
  const fallbackTimestamp = new Date(0).toISOString();

  return {
    id: snapshot.id,
    amount: Number(data.amount) || 0,
    note: data.note ?? '',
    category: data.category ?? '',
    recipient: data.recipient ?? '',
    type: data.type ?? 'Expense',
    paymentMethod: data.paymentMethod ?? '',
    recurring: Boolean(data.recurring),
    repeatInterval: data.repeatInterval ?? null,
    occurrencesGenerated: Number(data.occurrencesGenerated) || 0,
    recurringSourceId: data.recurringSourceId ?? null,
    status: data.status ?? 'active',
    settledAt: data.settledAt ?? null,
    date: data.date ?? data.createdAt ?? fallbackTimestamp,
    createdAt: data.createdAt ?? fallbackTimestamp,
    updatedAt: data.updatedAt ?? null,
  };
};

// Edits keep `createdAt`, so compare the last write instead — otherwise an
// edit that reached only one database could lose to the stale copy.
const lastWrite = (transaction) => transaction.updatedAt || transaction.createdAt;

const mergeTransactions = (collections) => {
  const merged = new Map();

  collections.flat().forEach((transaction) => {
    const existing = merged.get(transaction.id);

    if (!existing || lastWrite(transaction) > lastWrite(existing)) {
      merged.set(transaction.id, transaction);
    }
  });

  return Array.from(merged.values()).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
};

const syncTransactionToCloud = async (userId, transaction) => {
  const databases = getConfiguredDatabases();

  if (!userId || databases.length === 0) {
    return;
  }

  await Promise.allSettled(
    databases.map(({ db }) =>
      setDoc(getTransactionDocument(db, userId, transaction.id), transaction)
    )
  );
};

const removeTransactionFromCloud = async (userId, transactionId) => {
  const databases = getConfiguredDatabases();

  if (!userId || databases.length === 0) {
    return;
  }

  await Promise.allSettled(
    databases.map(({ db }) =>
      deleteDoc(getTransactionDocument(db, userId, transactionId))
    )
  );
};

function VeloraApp() {
  const dispatch = useDispatch();
  const { currentUser, isPostLoginLoading } = useSelector((state) => state.auth);
  const { transactions } = useSelector((state) => state.transactions);
  // uid whose transactions finished loading. Recurring copies are only
  // generated after that, so a half-loaded list can't produce duplicates.
  const [loadedUid, setLoadedUid] = useState(null);
  const [resumeTick, setResumeTick] = useState(0);

  useEffect(() => {
    if (!primaryAuth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(primaryAuth, (user) => {
      dispatch(setCurrentUser(user));
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      const databases = getConfiguredDatabases();

      if (!currentUser || databases.length === 0) {
        if (isMounted) {
          dispatch(setTransactions([]));
          setLoadedUid(null);
        }
        return;
      }

      const transactionCollections = [];

      for (const { db } of databases) {
        try {
          const snapshot = await getDocs(
            getTransactionsCollection(db, currentUser.uid)
          );
          transactionCollections.push(snapshot.docs.map(parseTransaction));
        } catch (error) {
          console.warn('Unable to load transactions from Firebase.', error);
        }
      }

      if (isMounted) {
        dispatch(setTransactions(mergeTransactions(transactionCollections)));
        setLoadedUid(currentUser.uid);
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [currentUser, dispatch]);

  // Re-check recurring entries when the app returns to the foreground, so a
  // phone left open overnight still picks up today's copies.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setResumeTick((tick) => tick + 1);
    });
    return () => subscription.remove();
  }, []);

  const lastRecurringRun = useRef(null);
  useEffect(() => {
    if (!currentUser || loadedUid !== currentUser.uid) return;
    const { created, templates } = collectDueOccurrences(transactions);
    if (!created.length && !templates.length) return;
    // Guard against re-dispatching the same batch if this effect runs again
    // before the store update lands.
    const signature = created.map((item) => item.id).join(',');
    if (signature && lastRecurringRun.current === signature) return;
    lastRecurringRun.current = signature;
    created.forEach((item) => {
      dispatch(addTransactionAction(item));
      void syncTransactionToCloud(currentUser.uid, item);
    });
    templates.forEach((item) => {
      dispatch(updateTransactionAction(item));
      void syncTransactionToCloud(currentUser.uid, item);
    });
  }, [transactions, currentUser, loadedUid, resumeTick, dispatch]);

  // Count the repeats already behind us when a schedule is saved, so turning
  // Repeat on for an old entry doesn't instantly backfill months of copies.
  const scheduleFields = (entry, date) => {
    const recurring = Boolean(entry.recurring) && isValidInterval(entry.repeatInterval);
    return {
      recurring,
      repeatInterval: recurring ? entry.repeatInterval : null,
      occurrencesGenerated: recurring ? countElapsedOccurrences(date, entry.repeatInterval) : 0,
    };
  };

  const addTransaction = (entry) => {
    if (!currentUser) {
      return { ok: false, message: 'Sign in before saving transactions.' };
    }

    const amount = Number.parseFloat(entry.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid amount greater than 0.' };
    }

    const date = entry.date ?? new Date().toISOString();
    const normalizedTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: Math.round(amount * 100) / 100,
      note: entry.note?.trim() ?? '',
      category: entry.category?.trim() ?? '',
      recipient: entry.recipient?.trim() ?? '',
      type: entry.type === 'Income' ? 'Income' : 'Expense',
      paymentMethod: '',
      ...scheduleFields(entry, date),
      status: entry.status ?? 'active',
      date,
      createdAt: new Date().toISOString(),
    };

    dispatch(addTransactionAction(normalizedTransaction));
    void syncTransactionToCloud(currentUser.uid, normalizedTransaction);

    return { ok: true, transaction: normalizedTransaction };
  };

  const removeTransaction = (transactionId) => {
    dispatch(removeTransactionAction(transactionId));
    void removeTransactionFromCloud(currentUser?.uid, transactionId);
  };

  const updateTransaction = (transactionId, entry) => {
    if (!currentUser) {
      return { ok: false, message: 'Sign in before updating transactions.' };
    }

    const existingTransaction = transactions.find((item) => item.id === transactionId);
    const amount = Number.parseFloat(entry.amount);

    if (!existingTransaction) {
      return { ok: false, message: 'This transaction no longer exists.' };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid amount greater than 0.' };
    }

    const date = entry.date ?? existingTransaction.date;
    const scheduleChanged = Boolean(entry.recurring) !== Boolean(existingTransaction.recurring)
      || (entry.repeatInterval ?? null) !== (existingTransaction.repeatInterval ?? null)
      || date !== existingTransaction.date;
    const updatedTransaction = {
      ...existingTransaction,
      amount: Math.round(amount * 100) / 100,
      note: entry.note?.trim() ?? '',
      category: entry.category?.trim() ?? '',
      recipient: entry.recipient?.trim() ?? '',
      type: entry.type === 'Income' ? 'Income' : 'Expense',
      paymentMethod: '',
      // Only restart the repeat counter when the schedule itself changed;
      // editing the amount or note keeps the copies already made.
      ...(scheduleChanged ? scheduleFields(entry, date) : {}),
      date,
      updatedAt: new Date().toISOString(),
    };

    dispatch(updateTransactionAction(updatedTransaction));
    void syncTransactionToCloud(currentUser.uid, updatedTransaction);

    return { ok: true, transaction: updatedTransaction };
  };

  const completePostLoginLoading = useCallback(() => {
    dispatch(finishPostLoginLoading());
  }, [dispatch]);

  return (
    <SafeAreaProvider>
      <View style={styles.shell}>
        <StatusBar style="light" />
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator
            currentUser={currentUser}
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            removeTransaction={removeTransaction}
            isPostLoginLoading={isPostLoginLoading}
            completePostLoginLoading={completePostLoginLoading}
          />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <VeloraApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
