import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import FriendScreen from '../screens/FriendScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({
  currentUser,
  transactions,
  addTransaction,
  removeTransaction,
  clearTransactions,
  cloudStatus,
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          backgroundColor: colors.surfaceMuted,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
            transactions={transactions}
            removeTransaction={removeTransaction}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Expenses">
        {() => (
          <ExpenseScreen
            transactions={transactions}
            addTransaction={addTransaction}
            removeTransaction={removeTransaction}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Friends">
        {() => (
          <FriendScreen
            transactions={transactions}
            addTransaction={addTransaction}
            removeTransaction={removeTransaction}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            currentUser={currentUser}
            transactions={transactions}
            clearTransactions={clearTransactions}
            cloudStatus={cloudStatus}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({
  currentUser,
  transactions,
  addTransaction,
  removeTransaction,
  clearTransactions,
  cloudStatus,
}) {
  if (currentUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {() => (
            <MainTabs
              currentUser={currentUser}
              transactions={transactions}
              addTransaction={addTransaction}
              removeTransaction={removeTransaction}
              clearTransactions={clearTransactions}
              cloudStatus={cloudStatus}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}
