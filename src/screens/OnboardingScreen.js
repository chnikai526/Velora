import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Onboarding Screen</Text>
      <Button title="Continue" onPress={() => navigation.navigate("Auth")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});