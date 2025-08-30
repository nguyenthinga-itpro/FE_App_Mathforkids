import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function FullScreenLoading({
  visible = false,
  color = "#fff",
  size = "large",
}) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 20,
  },
});
