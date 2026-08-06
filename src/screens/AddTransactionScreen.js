import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import TransactionFormModal from '../components/TransactionFormModal';
import colors from '../theme/colors';

export default function AddTransactionScreen({ addTransaction, navigation }) {
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setVisible(true);
    }, [])
  );

  const close = () => {
    setVisible(false);
    navigation.navigate('Home');
  };

  const save = (entry) => {
    const result = addTransaction({
      ...entry,
      date: new Date().toISOString(),
    });

    if (!result.ok) {
      Alert.alert('Unable to save', result.message);
      return;
    }

    setVisible(false);
    navigation.navigate('Home', { savedTransaction: result.transaction });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TransactionFormModal visible={visible} onClose={close} onSave={save} />
    </View>
  );
}
