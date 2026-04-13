import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
  backupFirebaseEnabled,
  getConfiguredDatabases,
  primaryAuth,
  primaryFirebaseEnabled,
} from './src/lib/firebase';
import colors from './src/theme/colors';

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

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [hasLoadedCloudData, setHasLoadedCloudData] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!primaryAuth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(primaryAuth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      if (isMounted) {
        setHasLoadedCloudData(false);
      }

      if (!currentUser) {
        if (isMounted) {
          setTransactions([]);
          setHasLoadedCloudData(true);
        }
        return;
      }

      const databases = getConfiguredDatabases();

      if (databases.length === 0) {
        if (isMounted) {
          setTransactions([]);
          setHasLoadedCloudData(true);
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
        setTransactions(mergeTransactions(transactionCollections));
        setHasLoadedCloudData(true);
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

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
      type: entry.type,
      createdAt: new Date().toISOString(),
    };

    setTransactions((currentTransactions) => [
      normalizedTransaction,
      ...currentTransactions,
    ]);
    void syncTransactionToCloud(currentUser.uid, normalizedTransaction);

    return { ok: true };
  };

  const removeTransaction = (transactionId) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter((item) => item.id !== transactionId)
    );
    void removeTransactionFromCloud(currentUser?.uid, transactionId);
  };

  const clearTransactions = () => {
    setTransactions([]);
    void clearTransactionsFromCloud(currentUser?.uid);
  };

  return (
    <View style={styles.shell}>
      <View style={styles.appFrame}>
        <NavigationContainer>
          <AppNavigator
            currentUser={currentUser}
            transactions={transactions}
            addTransaction={addTransaction}
            removeTransaction={removeTransaction}
            clearTransactions={clearTransactions}
            cloudStatus={{
              hasLoadedCloudData,
              primaryEnabled: primaryFirebaseEnabled,
              backupEnabled: backupFirebaseEnabled,
            }}
          />
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 8,
  },
  appFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
});
