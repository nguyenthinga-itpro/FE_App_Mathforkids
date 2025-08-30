import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
const SidebarMenu = () => {
  const { theme } = useTheme();
  const { t } = useTranslation("sidebar");
  const screenHeight = Dimensions.get("window").height;
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const pupilId = useSelector((state) => state.auth.user?.pupilId);
  const userId = useSelector((state) => state.auth.user?.id);
  const user = useSelector((state) => state.auth.user);
  const skillName = route.params?.skillName;
  const isPupil = Boolean(pupilId);
  const isParent = !pupilId;
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // thành công: điều hướng về Login
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (errMsg) {
      // lỗi khi gọi API
      Alert.alert("Error", errMsg || "Failed to logout");
    }
  };
  const menuItems = [
    { label: "home", icon: theme.icons.characterLamp, screen: "HomeScreen" },
    {
      label: "statistics",
      icon: theme.icons.statistic,
      screen: "StatisticScreen",
    },
    { label: "privacy", icon: theme.icons.privacy, screen: "PrivacyScreen" },
    { label: "profile", icon: theme.icons.profile, screen: "ProfileScreen" },
    {
      label: "viewProfile",
      icon: theme.icons.profile,
      screen: "DetailScreen",
    },
    { label: "goals", icon: theme.icons.goal, screen: "GoalScreen" },
    { label: "rank", icon: theme.icons.rank, screen: "RankScreen" },
    { label: "target", icon: theme.icons.target, screen: "TargetScreen" },
    {
      label: "notification",
      icon: theme.icons.notification,
      screen: "NotificationScreen",
    },
    // {
    //   label: "Test level",
    //   icon: theme.icons.testLevel,
    //   screen: "TestLevelScreen",
    // },
    { label: "reward", icon: theme.icons.reward, screen: "RewardScreen" },
    { label: "setting", icon: theme.icons.setting, screen: "SettingScreen" },
    { label: "contact", icon: theme.icons.contact, screen: "ContactScreen" },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (isPupil) {
      return !["goals", "statistics", "privacy", "viewProfile"].includes(
        item.label
      );
    }
    if (isParent) {
      return ![
        "home",
        "rank",
        "reward",
        "target",
        "test level",
        "profile",
        "viewProfile",
      ].includes(item.label);
    }
    return false;
  });

  const getMenuItemBackground = () => {
    if (skillName === "Addition") return theme.colors.cyanGreen;
    if (skillName === "Subtraction") return theme.colors.cyanPurple;
    if (skillName === "Multiplication") return theme.colors.cyanOrange;
    if (skillName === "Division") return theme.colors.cyanRed;
    if (skillName === "Expression") return theme.colors.cyanPink;
    return theme.colors.cyanLight;
  };

  const getLabelColor = () => {
    if (skillName === "Addition") return theme.colors.GreenBorderDark;
    if (skillName === "Subtraction") return theme.colors.purpleBorderDark;
    if (skillName === "Multiplication") return theme.colors.orangeBorderDark;
    if (skillName === "Division") return theme.colors.redBorderDark;
    if (skillName === "Expression") return theme.colors.pinkBorderDark;
    return theme.colors.blueDark;
  };

  const getLogoutBackground = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    if (skillName === "Expression") return theme.colors.gradientPink;
    return theme.colors.gradientBluePrimary;
  };

  const styles = StyleSheet.create({
    sidebar: {
      position: "absolute",
      right: 0,
      top: 24,
      width: 180,
      height: screenHeight - 24,
      backgroundColor: theme.colors.cardBackground,
      borderTopLeftRadius: 30,
      borderBottomLeftRadius: 30,
      paddingTop: 5,
      elevation: 15,
      borderWidth: 3,
      borderColor: getLabelColor(),
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    title: {
      fontSize: 22,
      fontFamily: Fonts.NUNITO_EXTRA_BOLD,
      textAlign: "center",
      color: getLabelColor(),
    },
    menuContainer: {
      flex: 1,
      justifyContent: "space-between",
    },
    menuScroll: {
      flexGrow: 0,
    },
    menuContent: {
      paddingBottom: 10,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 20,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.paleBeige,
      elevation: 3,
      backgroundColor: getMenuItemBackground(),
      marginHorizontal: 5,
    },
    icon: {
      width: 28,
      height: 28,
    },
    label: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginLeft: 10,
      color: getLabelColor(),
    },
    logoutButtonContainer: {
      alignItems: "center",
      borderTopLeftRadius: 30,
      borderBottomLeftRadius: 30,
    },
    logoutButton: {
      fontSize: 16,
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_MEDIUM,
      padding: 10,
    },
  });

  return (
    <View style={styles.sidebar}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("menu")}</Text>
        <TouchableOpacity
          style={styles.backAccount}
          onPress={() => navigation.navigate("AccountScreen")}
        >
          <Ionicons
            name="people-circle-outline"
            size={32}
            color={getLabelColor()}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.menuContainer}>
        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={styles.menuContent}
        >
          {filteredMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate(item.screen, {
                  userId: userId,
                  pupilId: pupilId,
                });
              }}
            >
              <Image source={item.icon} style={styles.icon} />
              <Text style={styles.label}>{t(item.label)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <LinearGradient
          colors={getLogoutBackground()}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.logoutButtonContainer}
        >
          <TouchableOpacity
            // onPress={() => {
            //   dispatch(logout());
            //   navigation.navigate("LoginScreen");
            // }}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButton}>{t("logout")}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

export default SidebarMenu;
