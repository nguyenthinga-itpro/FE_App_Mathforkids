import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";
import * as Speech from "expo-speech";
export default function MultiplicationTableScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("multiplicationtable");
  const { skillName, pupilId, grade } = route.params;

  const tables = [
    { icon: theme.icons.multiplication2, labelKey: "tableTwo", number: 2 },
    { icon: theme.icons.multiplication3, labelKey: "tableThree", number: 3 },
    { icon: theme.icons.multiplication4, labelKey: "tableFour", number: 4 },
    { icon: theme.icons.multiplication5, labelKey: "tableFive", number: 5 },
    { icon: theme.icons.multiplication6, labelKey: "tableSix", number: 6 },
    { icon: theme.icons.multiplication7, labelKey: "tableSeven", number: 7 },
    { icon: theme.icons.multiplication8, labelKey: "tableEight", number: 8 },
    { icon: theme.icons.multiplication9, labelKey: "tableNine", number: 9 },
  ];

  const getGradient = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: theme.colors.background,
    },
    header: {
      width: "100%",
      height: "18%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      elevation: 3,
      marginBottom: 20,
    },
    backButton: {
      position: "absolute",
      left: 10,
      backgroundColor: theme.colors.backBackgound,
      marginLeft: 20,
      padding: 8,
      borderRadius: 50,
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    headerText: {
      fontSize: 26,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 10,
    },
    volumeContainer: {
      borderColor: theme.colors.white,
      borderRadius: 50,
      padding: 10,
      borderWidth: 1,
      elevation: 3,
    },
    infoText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      fontSize: 16,
    },
    tableContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    tableBox: {
      width: "40%",
      borderRadius: 15,
      marginVertical: 10,
      padding: 10,
      alignItems: "center",
      elevation: 4,
    },
    tableIconContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderColor: theme.colors.white,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      alignItems: "center",
      padding: 10,
      borderWidth: 1,
      elevation: 3,
    },
    tableIcon: {
      width: 80,
      height: 80,
      resizeMode: "contain",
    },
    tableLabel: {
      marginTop: 10,
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "center",
    },
  });
  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradient()} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeScreen", { pupilId, grade })}
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text
          style={styles.headerText}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {t("headerTitle")}
        </Text>
      </LinearGradient>
      <View style={styles.infoRow}>
        <TouchableOpacity
          onPress={() => {
            const lang = i18n.language === "vi" ? "vi" : "en";
            Speech.speak(t("selectedOneTable"), { language: lang });
          }}
        >
          <LinearGradient colors={getGradient()} style={styles.volumeContainer}>
            <Ionicons name="volume-high" size={30} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.infoText}>{t("selectedOneTable")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.tableContainer}>
        {tables.map((item) => (
          <LinearGradient
            key={`table-${item.number}`}
            colors={getGradient()}
            style={styles.tableBox}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MultiplicationTableDetailScreen", {
                  skillName,
                  pupilId,
                  grade,
                  table: item.number,
                  title: t(item.labelKey),
                })
              }
            >
              <View style={styles.tableIconContainer}>
                <Image source={item.icon} style={styles.tableIcon} />
              </View>
              <Text
                style={styles.tableLabel}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </ScrollView>
      <FloatingMenu />
    </View>
  );
}
