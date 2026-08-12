import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransactionFormModal from '../components/TransactionFormModal';

export default function AddTransactionScreen({ addTransaction, navigation }) {
  const close = () => navigation.navigate('Home');

  const save = (entry) => {
    const result = addTransaction({
      ...entry,
    });

    if (!result.ok) {
      Alert.alert('Unable to save', result.message);
      return;
    }

    navigation.navigate('Home', { savedTransaction: result.transaction });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TransactionFormModal fullScreen onClose={close} onSave={save} />
    </SafeAreaView>
  );
}
