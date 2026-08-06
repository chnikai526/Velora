import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ExchangeRatesScreen from '../screens/ExchangeRatesScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ currentUser, transactions, addTransaction, updateTransaction, settleTransaction, removeTransaction, clearTransactions, cloudStatus }) {
  return <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primarySoft,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: { backgroundColor: '#151120', borderTopColor: colors.border, height: 70, paddingTop: 8, paddingBottom: 10 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    tabBarIcon: ({ color, size, focused }) => {
      const icons = { Home: focused ? 'home' : 'home-outline', Add: 'add', Profile: focused ? 'person' : 'person-outline' };
      return <Ionicons name={icons[route.name]} size={route.name === 'Add' ? 27 : size} color={route.name === 'Add' ? colors.text : color} />;
    },
    tabBarIconStyle: route.name === 'Add' ? { marginTop: -27, backgroundColor: colors.primary, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: colors.background } : undefined,
    tabBarLabel: route.name === 'Add' ? () => null : undefined,
  })}>
    <Tab.Screen name="Home">{({ navigation, route }) => <HomeScreen transactions={transactions} updateTransaction={updateTransaction} settleTransaction={settleTransaction} removeTransaction={removeTransaction} navigation={navigation} route={route} />}</Tab.Screen>
    <Tab.Screen name="Add">{({ navigation }) => <AddTransactionScreen addTransaction={addTransaction} navigation={navigation} />}</Tab.Screen>
    <Tab.Screen name="Profile">{() => <ProfileScreen currentUser={currentUser} transactions={transactions} clearTransactions={clearTransactions} cloudStatus={cloudStatus} />}</Tab.Screen>
  </Tab.Navigator>;
}

export default function AppNavigator(props) {
  if (props.currentUser && props.isPostLoginLoading) return <LoadingScreen onComplete={props.completePostLoginLoading} />;
  if (props.currentUser) return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Main">{() => <MainTabs {...props} />}</Stack.Screen><Stack.Screen name="ExchangeRates" component={ExchangeRatesScreen} options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }}/></Stack.Navigator>;
  return <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}><Stack.Screen name="Auth" component={AuthScreen} /></Stack.Navigator>;
}
