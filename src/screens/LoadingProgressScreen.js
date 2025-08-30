import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import jwt_decode from "jwt-decode";
import { useTranslation } from "react-i18next";

import { Fonts } from "../../constants/Fonts";
import { useTheme } from "../themes/ThemeContext";
import { logout } from "../redux/authSlice";

export default function LoadingProgressScreen({ navigation }) {
  const [progress, setProgress] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation("loading");
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  const token = user?.token;

  const progressBarWidth = 250;
  const logoWidth = 30;

  // Animate the capybara and progress bar
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: progress * (progressBarWidth - logoWidth),
      duration: 100,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.01;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [progress]);

  // Handle redirection after loading
  useEffect(() => {
    if (!user) {
      navigation.replace("LoginScreen");
      return;
    }
    const timer = setTimeout(() => {
      try {
        const decoded = jwt_decode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
          dispatch(logout());
          navigation.replace("LoginScreen");
          return;
        }
        navigation.replace("AccountScreen");
      } catch {
        dispatch(logout());
        navigation.replace("LoginScreen");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.normalText}>
          {t("developedBy")} <Text style={styles.boldText}>{t("fpt")}</Text>
        </Text>
      </View>

      <Text style={styles.title}>{t("title")}</Text>
      <Text style={styles.subtitle}>{t("subtitle")}</Text>

      <View style={styles.logoTrack}>
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <Image
            source={theme.icons.capybaraloading}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.backgroundBar} />
        <Animated.View
          style={[styles.foregroundBar, { width: progress * progressBarWidth }]}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? theme.colors.gradientPurple
                : theme.colors.gradientBluePrimary
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
        </Animated.View>
      </View>

      <Text style={styles.loadingText}>
        {t("loadingText")} {Math.round(progress * 100)}%
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
  },
  normalText: {
    fontSize: 12,
    fontFamily: Fonts.NUNITO_REGULAR,
    color: "white",
  },
  boldText: {
    fontFamily: Fonts.NUNITO_MEDIUM,
    color: "white",
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    fontFamily: Fonts.NUNITO_BOLD,
    color: "white",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    fontFamily: Fonts.NUNITO_MEDIUM_ITALIC,
    color: "white",
  },
  logoTrack: {
    width: 250,
    height: 30,
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: 30,
    height: 30,
  },
  progressContainer: {
    width: 256,
    height: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    position: "relative",
    backgroundColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  backgroundBar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
  foregroundBar: {
    height: 10,
    position: "absolute",
    left: 3,
    top: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  gradientFill: {
    width: "100%",
    height: "100%",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.NUNITO_MEDIUM,
    color: "white",
  },
});
