import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ExchangeRatesScreen from '../screens/ExchangeRatesScreen';
import TabBar from '../components/TabBar';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const renderTabBar = (props) => <TabBar {...props} />;

function MainTabs({ currentUser, transactions, updateTransaction, removeTransaction }) {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen currentUser={currentUser} transactions={transactions} updateTransaction={updateTransaction} removeTransaction={removeTransaction} navigation={navigation} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Friends">{() => <FriendsScreen currentUser={currentUser} />}</Tab.Screen>
      <Tab.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen currentUser={currentUser} transactions={transactions} updateTransaction={updateTransaction} removeTransaction={removeTransaction} navigation={navigation} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator(props) {
  if (props.currentUser && props.isPostLoginLoading) return <LoadingScreen onComplete={props.completePostLoginLoading} />;

  if (props.currentUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Main">{() => <MainTabs {...props} />}</Stack.Screen>
        <Stack.Screen name="AddTransaction" options={{ presentation: 'modal' }}>
          {({ navigation }) => <AddTransactionScreen addTransaction={props.addTransaction} currentUser={props.currentUser} navigation={navigation} />}
        </Stack.Screen>
        {/* Draws its own themed header (back button + title) so it matches
            the sheets it's opened from instead of the plain native bar. */}
        <Stack.Screen name="ExchangeRates" component={ExchangeRatesScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}
