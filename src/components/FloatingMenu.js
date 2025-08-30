import React, { useState, useRef } from "react";
import {
  View,
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { useSound } from "../audio/SoundContext";
import SidebarMenu from "./SidebarMenu";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";

const FloatingMenu = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const position = useRef(new Animated.ValueXY({ x: 30, y: 100 })).current;
  const { theme, isDarkMode } = useTheme();
  const route = useRoute();
  const skillName = route.params?.skillName;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderRelease: () => {
        position.flattenOffset();
      },
    })
  ).current;
  const getSidebarColor = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    if (skillName === "Expression") return theme.colors.gradientPink;
    return theme.colors.gradientBluePrimary;
  };
  const closeSidebar = () => setShowSidebar(false);
  const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: -5,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.overlay,
      // zIndex: 9999,
      elevation: 6,
    },
    homeContainer: {
      padding: 10,
      borderRadius: 30,
    },
    button: {
      position: "absolute",
      zIndex: 2,
      borderRadius: 30,
      elevation: 4,
    },
    sidebarWrapper: {
      position: "absolute",
      top: 0,
      right: 0,
      elevation: 20,
    },
  });

  return (
    <>
      {showSidebar && (
        <>
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        </>
      )}
      {!showSidebar && (
        <Animated.View
          style={[
            styles.button,
            { transform: position.getTranslateTransform() },
          ]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={getSidebarColor()}
            style={styles.homeContainer}
          >
            <TouchableOpacity onPress={toggleSidebar}>
              <Ionicons name="home" size={32} color={theme.colors.white} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
      {showSidebar && (
        <View style={styles.sidebarWrapper}>
          <SidebarMenu skillName={skillName} />
        </View>
      )}
    </>
  );
};

export default FloatingMenu;
