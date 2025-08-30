import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";
import * as Speech from "expo-speech";

export default function MultiplicationTableDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("multiplicationtable");
  const { table, title, skillName, pupilId, grade } = route.params;

  const [currentIndex, setCurrentIndex] = useState(1);

  const nextStep = () => {
    if (currentIndex < 9) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate("PracticeMultiplicationTableScreen", {
        skillName,
        pupilId,
        grade,
        table,
        title,
      });
    }
  };

  const multiplicand = table;
  const multiplier = currentIndex;
  const product = multiplicand * multiplier;

  const speak = (text) => {
    Speech.stop();
    const lang = i18n.language === "vi" ? "vi" : "en";
    Speech.speak(text, { language: lang });
  };

  const BoxedText = ({ text }) => (
    <View style={styles.box}>
      <Text style={styles.boxText}>{text}</Text>
    </View>
  );
  useEffect(() => {
    let equationText = "";
    if (i18n.language === "vi") {
      equationText = `${multiplicand} nhân ${multiplier} bằng ${product}`;
    } else {
      equationText = `${multiplicand} times ${multiplier} equals ${product}`;
    }
    speak(`${t("memorize")}. ${equationText}`);
  }, [currentIndex]);

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
      fontSize: 18,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 10,
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
    equationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 20,
      flexWrap: "wrap",
      paddingHorizontal: 10,
    },
    operator: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      fontSize: 28,
      marginHorizontal: 6,
    },
    box: {
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.colors.pinkDark,
      paddingHorizontal: 30,
      paddingVertical: 10,
      borderRadius: 10,
      margin: 4,
    },
    boxText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      fontSize: 28,
    },
    explanation: {
      width: "80%",
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    backStepButton: {
      width: "15%",
      paddingVertical: 10,
      borderRadius: 30,
      borderWidth: 1,
      alignItems: "center",
      borderColor: theme.colors.white,
      elevation: 3,
      position: "absolute",
      bottom: 80,
      left: 10,
    },
    nextWrapper: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    nextButton: {
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      paddingVertical: 12,
      alignItems: "center",
    },
    nextText: {
      fontSize: 20,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors.gradientPink} style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MultiplicationTableScreen", {
              skillName,
              pupilId,
              grade,
            })
          }
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{title}</Text>
      </LinearGradient>

      {/* Memorize Section */}
      <View style={styles.infoRow}>
        <TouchableOpacity
          onPress={() => {
            let equationText = "";
            if (i18n.language === "vi") {
              equationText = `${multiplicand} nhân ${multiplier} bằng ${product}`;
            } else {
              equationText = `${multiplicand} times ${multiplier} equals ${product}`;
            }
            speak(`${t("memorize")}. ${equationText}`);
          }}
        >
          <LinearGradient
            colors={theme.colors.gradientPink}
            style={styles.volumeContainer}
          >
            <Ionicons name="volume-high" size={30} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.infoText}>{t("memorize")}</Text>
      </View>

      {/* Equation */}
      <View style={styles.equationRow}>
        <BoxedText text={multiplicand.toString()} />
        <Text style={styles.operator}>×</Text>
        <BoxedText text={multiplier.toString()} />
        <Text style={styles.operator}>=</Text>
        <BoxedText text={product.toString()} />
      </View>

      {/* Explanation */}
      <View style={styles.infoRow}>
        <TouchableOpacity
          onPress={() =>
            speak(
              t("explanation", {
                multiplicand,
                multiplier,
                times: multiplier === 1 ? t("time") : t("times"),
              })
            )
          }
        >
          <LinearGradient
            colors={theme.colors.gradientPink}
            style={styles.volumeContainer}
          >
            <Ionicons name="volume-high" size={30} color={theme.colors.white} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.explanation}>
          {t("explanation", {
            multiplicand,
            multiplier,
            times: multiplier === 1 ? t("time") : t("times"),
          })}
        </Text>
      </View>

      {/* Repeated Addition */}
      <View style={styles.equationRow}>
        <BoxedText text={Array(multiplier).fill(multiplicand).join(" + ")} />
        <Text style={styles.operator}>=</Text>
        <BoxedText text={product.toString()} />
      </View>

      {/* Back Step */}
      {currentIndex > 1 && (
        <LinearGradient
          colors={theme.colors.gradientPink}
          style={styles.backStepButton}
        >
          <TouchableOpacity onPress={() => setCurrentIndex(currentIndex - 1)}>
            <Ionicons name="play-back" size={30} color={theme.colors.white} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Next Step */}
      <TouchableOpacity style={styles.nextWrapper} onPress={nextStep}>
        <LinearGradient
          colors={theme.colors.gradientPink}
          style={styles.nextButton}
        >
          <Text style={styles.nextText}>
            {currentIndex === 9 ? t("practice") : t("next")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <FloatingMenu />
    </View>
  );
}
