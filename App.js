import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [transactions, setTransactions] = useState([]);

  return (
    <NavigationContainer>
      <AppNavigator
        transactions={transactions}
        setTransactions={setTransactions}
      />
    </NavigationContainer>
  );
}