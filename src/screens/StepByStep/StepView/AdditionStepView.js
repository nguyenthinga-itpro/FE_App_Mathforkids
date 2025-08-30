import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { useTheme } from "../../../themes/ThemeContext";
import { Fonts } from "../../../../constants/Fonts";
import { useTranslation } from "react-i18next";

export const AdditionStepView = ({
  steps,
  placeLabels,
  skillName,
  columnStepIndex,
}) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation("stepbystep");

  const currentStep = columnStepIndex ?? 0;
  if (!steps[2]?.digitSums) return null;
  const totalSteps = steps[2].digitSums.length + 1;
  const labels = placeLabels.slice(0, steps[2].digitSums.length);
  const subTextLines = Array.isArray(steps[2].subText) ? steps[2].subText : [];

  const defaultColor = theme.colors.text;

  const getSkillColor = () => {
    switch (skillName) {
      case "Addition":
        return theme.colors.GreenDark;
      case "Subtraction":
        return theme.colors.purpleDark;
      case "Multiplication":
        return theme.colors.orangeDark;
      case "Division":
        return theme.colors.redDark;
      default:
        return theme.colors.pinkDark;
    }
  };
  const getSkillTextColor = () => {
    switch (skillName) {
      case "Addition":
        return theme.colors.GreenBorderDark;
      case "Subtraction":
        return theme.colors.purpleBorderDark;
      case "Multiplication":
        return theme.colors.orangeBorderDark;
      case "Division":
        return theme.colors.redBorderDark;
      default:
        return theme.colors.pinkBorderDark;
    }
  };
  useEffect(() => {
    const line = subTextLines[Math.max(0, currentStep)];
    if (line) {
      const lang = i18n.language === "vi" ? "vi-VN" : "en-US";
      Speech.stop();
      Speech.speak(line, { language: lang });
    }
  }, [currentStep]);

  const speakCurrentLine = (stepIndex) => {
    const line = subTextLines[Math.max(0, stepIndex)];
    if (line) {
      const lang = i18n.language === "vi" ? "vi-VN" : "en-US";
      Speech.stop();
      Speech.speak(line, { language: lang });
    }
  };

  useEffect(() => {
    speakCurrentLine(currentStep);
  }, [currentStep]);

  const styles = StyleSheet.create({
    container: { alignItems: "center" },
    innerBox: { alignItems: "center", flexDirection: "column" },
    row: { flexDirection: "row-reverse", marginBottom: 4 },
    labelText: {
      width: 50,
      textAlign: "center",
      fontSize: 8,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.text,
    },
    carryText: {
      width: 50,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    num1Text: {
      width: 50,
      textAlign: "center",
      fontSize: 24,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    num2Text: {
      width: 50,
      textAlign: "center",
      fontSize: 24,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.text,
    },
    lineRow: { marginTop: 2 },
    resultText: {
      width: 50,
      textAlign: "center",
      fontSize: 24,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    explanationText: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.text,
      marginTop: 8,
      marginHorizontal: 12,
      textAlign: "center",
    },
    finalResultText: {
      fontSize: 32,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: "red",
      marginTop: 10,
    },
    line: {
      height: 2,
      backgroundColor: theme.colors.text,
      marginTop: 2,
    },
    explanationBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 10,
      marginLeft: 16,
      marginRight: 16,
      width: 300,
      borderWidth: 1,
      color: getSkillTextColor(),
      borderColor: getSkillTextColor(),
    },
    additionBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 10,
      marginTop: 15,
      marginLeft: 16,
      marginRight: 16,
      width: 300,
      borderWidth: 1,
      borderColor: getSkillTextColor(),
    },
  });

  return (
    <View style={styles.container}>
      {currentStep >= -1 && currentStep < totalSteps && (
        <Text style={styles.explanationBox}>
          {subTextLines[Math.max(0, currentStep)]}
        </Text>
      )}
      <View style={styles.additionBox}>
        <View style={styles.innerBox}>
          <View style={styles.row}>
            {labels.map((label, i) => (
              <Text key={`label-${i}`} style={styles.labelText}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.row}>
            {steps[2].carryDigits.slice().reverse().map((carry, i) => {
              const isUsed = carry > 0 && currentStep === i + 1;
              return (
                <Text
                  key={`carry-${i}`}
                  style={[
                    styles.carryText,
                    {
                      color: isUsed ? getSkillColor() : defaultColor,
                    },
                  ]}
                >
                  {isUsed ? `+${carry}` : " "}
                </Text>
              );
            })}
          </View>

          <View style={styles.row}>
            {steps[2].digits1.slice().reverse().map((digit, i) => (
              <Text
                key={`num1-${i}`}
                style={[
                  styles.num1Text,
                  {
                    color:
                      currentStep >= 1 && currentStep - 1 === i
                        ? getSkillColor()
                        : defaultColor,
                  },
                ]}
              >
                {digit}
              </Text>
            ))}
          </View>

          <View style={styles.row}>
            {steps[2].digits2.slice().reverse().map((_, i) => (
              <Text
                key={`spacer-${i}`}
                style={[
                  styles.num2Text,
                  i === steps[2].digits2.length - 1 && { marginRight: 50 },
                ]}
              >
                {i === steps[2].digits2.length - 1 ? "+" : " "}
              </Text>
            ))}
          </View>

          <View style={styles.row}>
            {steps[2].digits2.slice().reverse().map((digit, i) => (
              <Text
                key={`num2-${i}`}
                style={[
                  styles.num2Text,
                  {
                    color:
                      currentStep >= 1 && currentStep - 1 === i
                        ? getSkillColor()
                        : defaultColor,
                  },
                ]}
              >
                {digit}
              </Text>
            ))}
          </View>

          <View style={styles.row}>
            <View
              style={[styles.line, { width: 50 * steps[2].digitSums.length }]}
            />
          </View>

          <View style={styles.row}>
            {steps[2].digitSums.slice().reverse().map((digit, i) => (
              <TouchableOpacity
                key={`sum-${i}`}
                onPress={() => {
                  const toSpeak = subTextLines[i + 1];
                  if (toSpeak) {
                    const lang = i18n.language === "vi" ? "vi-VN" : "en-US";
                    Speech.speak(toSpeak, { language: lang });
                  }
                }}
              >
                <Text
                  style={[
                    styles.resultText,
                    {
                      color:
                        currentStep >= 1 && currentStep - 1 === i
                          ? getSkillColor()
                          : theme.colors.black,
                    },
                  ]}
                >
                  {currentStep > i ? digit : "?"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};