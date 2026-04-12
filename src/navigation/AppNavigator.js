import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import FriendScreen from '../screens/FriendScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ transactions, setTransactions }) {
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

        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',

        tabBarStyle: {
          backgroundColor: '#fff',
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
            setTransactions={setTransactions}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Expenses">
        {() => (
          <ExpenseScreen
            transactions={transactions}
            setTransactions={setTransactions}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Friends">
        {() => (
          <FriendScreen
            transactions={transactions}
            setTransactions={setTransactions}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => <ProfileScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}