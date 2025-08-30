import React, { useEffect, useContext, useRef } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
export default function LoadingScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("LoadingProgressScreen");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isDarkMode]);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backgroundBox: {
      width: 250,
      height: 180,
      borderRadius: 20,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 30,
      backgroundColor: theme.colors.backgroundLogoLoading,
      borderColor: theme.colors.white,
    },
    logoContainer: {
      width: 200,
      height: 220,
      borderRadius: 30,
      borderWidth: 1,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: 250,
      height: 180,
    },
  });
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradientBlue}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
        <View style={[styles.backgroundBox, {}]}>
          <View
            style={[styles.logoContainer, { borderColor: theme.colors.white }]}
          >
            <Image
              source={theme.icons.logoDark}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
