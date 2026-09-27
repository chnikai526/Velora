import React from 'react';
import TransactionFormModal from '../components/TransactionFormModal';
import { showNotice } from '../lib/confirm';

// The form draws its own safe-area insets. Wrapping it in a SafeAreaView as
// well padded the top twice on Android (where this route is full-screen) and
// the bottom twice on iOS.
export default function AddTransactionScreen({ addTransaction, navigation, currentUser }) {
  const save = (entry) => {
    const result = addTransaction(entry);
    if (!result.ok) {
      showNotice('Unable to save', result.message);
      return;
    }
    navigation.goBack();
  };

  return <TransactionFormModal fullScreen uid={currentUser?.uid} onClose={() => navigation.goBack()} onSave={save} />;
}
