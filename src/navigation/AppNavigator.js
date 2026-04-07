import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import SplashScreen from "../SplashScreen";
import OnboardingScreen from "../OnboardingScreen";
import AuthScreen from "../AuthScreen";
import HomeScreen from "../HomeScreen";
import ExpenseScreen from "../ExpenseScreen";
import IncomeScreen from "../IncomeScreen";
import ProfileScreen from "../ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🔥 Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Expense" component={ExpenseScreen} />
      <Tab.Screen name="Income" component={IncomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 🔥 Main Navigation
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}