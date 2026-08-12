import 'react-native-gesture-handler';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import AppNavigator from './src/navigation/AppNavigator';
import {
  addTransaction as addTransactionAction,
  clearTransactions as clearTransactionsAction,
  removeTransaction as removeTransactionAction,
  setCloudDataLoading,
  setCurrentUser,
  setTransactions,
  finishPostLoginLoading,
  settleTransaction as settleTransactionAction,
  updateTransaction as updateTransactionAction,
} from './redux/Actions';
import {
  backupFirebaseEnabled,
  getConfiguredDatabases,
  primaryAuth,
  primaryFirebaseEnabled,
} from './src/lib/firebase';
import colors from './src/theme/colors';
import store from './redux/Store';

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
    status: data.status ?? 'active',
    settledAt: data.settledAt ?? null,
    date: data.date ?? data.createdAt ?? fallbackTimestamp,
    createdAt: data.createdAt ?? fallbackTimestamp,
  };
};

const mergeTransactions = (collections) => {
  const merged = new Map();

  collections.flat().forEach((transaction) => {
    const existing = merged.get(transaction.id);

    if (!existing || transaction.createdAt > existing.createdAt) {
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

const clearTransactionsFromCloud = async (userId) => {
  const databases = getConfiguredDatabases();

  if (!userId || databases.length === 0) {
    return;
  }

  await Promise.allSettled(
    databases.map(async ({ db }) => {
      const snapshot = await getDocs(getTransactionsCollection(db, userId));
      await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
    })
  );
};

function VeloraApp() {
  const dispatch = useDispatch();
  const { currentUser, isPostLoginLoading } = useSelector((state) => state.auth);
  const { hasLoadedCloudData, transactions } = useSelector((state) => state.transactions);

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
      if (isMounted) {
        dispatch(setCloudDataLoading(false));
      }

      if (!currentUser) {
        if (isMounted) {
          dispatch(setTransactions([]));
          dispatch(setCloudDataLoading(true));
        }
        return;
      }

      const databases = getConfiguredDatabases();

      if (databases.length === 0) {
        if (isMounted) {
          dispatch(setTransactions([]));
          dispatch(setCloudDataLoading(true));
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
        dispatch(setCloudDataLoading(true));
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [currentUser, dispatch]);

  const addTransaction = (entry) => {
    if (!currentUser) {
      return { ok: false, message: 'Sign in before saving transactions.' };
    }

    const amount = Number.parseFloat(entry.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid amount greater than 0.' };
    }

    const normalizedTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      note: entry.note?.trim() ?? '',
      category: entry.category?.trim() ?? '',
      recipient: entry.recipient?.trim() ?? '',
      type: 'Expense',
      paymentMethod: '',
      recurring: Boolean(entry.recurring),
      repeatInterval: entry.repeatInterval ?? null,
      status: entry.status ?? 'active',
      date: entry.date ?? new Date().toISOString(),
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

    const updatedTransaction = {
      ...existingTransaction,
      amount,
      note: entry.note?.trim() ?? '',
      category: entry.category?.trim() ?? '',
      recipient: entry.recipient?.trim() ?? '',
      type: 'Expense',
      paymentMethod: '',
      recurring: Boolean(entry.recurring),
      repeatInterval: entry.repeatInterval ?? null,
      date: entry.date ?? existingTransaction.date,
      updatedAt: new Date().toISOString(),
    };

    dispatch(updateTransactionAction(updatedTransaction));
    void syncTransactionToCloud(currentUser.uid, updatedTransaction);

    return { ok: true, transaction: updatedTransaction };
  };

  const clearTransactions = () => {
    dispatch(clearTransactionsAction());
    void clearTransactionsFromCloud(currentUser?.uid);
  };

  const settleTransaction = (transactionId) => {
    const transaction = transactions.find((item) => item.id === transactionId);
    if (!transaction || !currentUser) return;
    const settledTransaction = { ...transaction, status: 'settled', settledAt: new Date().toISOString() };
    dispatch(settleTransactionAction(settledTransaction));
    void syncTransactionToCloud(currentUser.uid, settledTransaction);
  };

  const completePostLoginLoading = useCallback(() => {
    dispatch(finishPostLoginLoading());
  }, [dispatch]);

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <View style={styles.appFrame}>
        <NavigationContainer>
          <AppNavigator
            currentUser={currentUser}
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            settleTransaction={settleTransaction}
            removeTransaction={removeTransaction}
            clearTransactions={clearTransactions}
            cloudStatus={{
              hasLoadedCloudData,
              primaryEnabled: primaryFirebaseEnabled,
              backupEnabled: backupFirebaseEnabled,
            }}
            isPostLoginLoading={isPostLoginLoading}
            completePostLoginLoading={completePostLoginLoading}
          />
        </NavigationContainer>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <VeloraApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#05060f',
  },
  appFrame: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
