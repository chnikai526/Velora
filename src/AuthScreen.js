import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function AuthScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Login / Signup</Text>
      <Button title="Login" onPress={() => navigation.replace("Main")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});