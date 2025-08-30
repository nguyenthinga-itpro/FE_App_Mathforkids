import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { useTheme } from "../../../themes/ThemeContext";
import { Fonts } from "../../../../constants/Fonts";
import { useTranslation } from "react-i18next";

export const SubtractionStepView = ({
  steps,
  placeLabels,
  skillName,
  revealedResultDigits,
  subStepIndex,
}) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation("stepbystep");

  if (!steps[2]?.resultDigits) return null;

  const reversedLabels = [...placeLabels]
    .slice(0, steps[2].resultDigits.length)
    .reverse();

  const getSkillColor = () => {
    if (skillName === "Addition") return theme.colors.GreenBorderDark;
    if (skillName === "Subtraction") return theme.colors.purpleBorderDark;
    if (skillName === "Multiplication") return theme.colors.orangeBorderDark;
    if (skillName === "Division") return theme.colors.redBorderDark;
    return theme.colors.pinkDark;
  };

  const getActiveBackgroundColor = (indexFromRight) => {
    const activeColumnIndex = steps[2].subStepsMeta?.[subStepIndex] ?? -2;
    return indexFromRight === activeColumnIndex
      ? getSkillColor()
      : "transparent";
  };

  const getActiveTextColor = (indexFromRight) => {
    const activeColumnIndex = steps[2].subStepsMeta?.[subStepIndex] ?? -2;
    return indexFromRight === activeColumnIndex
      ? theme.colors.highlightText
      : theme.colors.textModal;
  };

  useEffect(() => {
    const currentText = steps[2].subSteps?.[subStepIndex];
    if (currentText) {
      const lang = i18n.language;
      let toSpeakClean = currentText;
      if (lang === "vi") {
        toSpeakClean = toSpeakClean
          .replace(/ - /g, " trừ ")
          .replace(/ = /g, " bằng ");
      } else if (lang === "en") {
        toSpeakClean = toSpeakClean
          .replace(/ - /g, " minus ")
          .replace(/ = /g, " equals ");
      }
      Speech.speak(toSpeakClean, {
        language: lang === "vi" ? "vi-VN" : "en-US",
      });
    }
  }, [subStepIndex]);

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginTop: 10,
    },
    row: {
      flexDirection: "row",
      marginBottom: 4,
    },
    explanationBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      marginBottom: 16,
      marginHorizontal: 20,
      maxHeight: 140,
      borderWidth: 1,
      borderColor: getSkillColor(),
      elevation: 3,
    },
    explanationText: {
      fontSize: 17,
      lineHeight: 24,
      fontFamily: Fonts.NUNITO_BOLD,
      color: getSkillColor(),
    },
    rowsBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: getSkillColor(),
      elevation: 3,
    },
    labelText: {
      width: 45,
      textAlign: "center",
      fontSize: 10,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.textModal,
    },
    paybackText: {
      width: 45,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      borderRadius: 8,
    },
    minuendText: {
      width: 45,
      textAlign: "center",
      fontSize: 18,
      fontFamily: Fonts.NUNITO_BOLD,
      borderRadius: 8,
    },
    operatorSymbol: {
      fontSize: 32,
      textAlign: "left",
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
      marginRight: 20,
    },
  });

  return (
    <View style={styles.container}>
      {/* Giải thích bước hiện tại */}
      <View style={styles.explanationBox}>
        {steps[2].subSteps?.[subStepIndex] && (
          <View style={{ marginVertical: 8, paddingHorizontal: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: Fonts.NUNITO_BOLD,
                color: getSkillColor(),
                textAlign: "center",
              }}
            >
              {steps[2].subSteps[subStepIndex]}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.rowsBox}>
        {/* Hàng nhãn vị trí */}
        <View style={styles.row}>
          {steps[2].resultDigits.map((_, i) => (
            <Text key={`label-sub-${i}`} style={styles.labelText}>
              {reversedLabels[i] || `10^${i}`}
            </Text>
          ))}
        </View>

        {/* Dòng số bị trừ (minuend) */}
        <View style={styles.row}>
          {steps[2].digits1.map((digit, i) => {
            const indexFromRight = steps[2].digits1.length - 1 - i;
            return (
              <Text
                key={`minuend-${i}`}
                style={[
                  styles.minuendText,
                  {
                    backgroundColor: getActiveBackgroundColor(indexFromRight),
                    color: getActiveTextColor(indexFromRight),
                  },
                ]}
              >
                {digit}
              </Text>
            );
          })}
        </View>

        {/* Dấu trừ */}
        <View style={styles.row}>
          <Text
            style={[
              styles.operatorSymbol,
              { width: steps[2].digits1.length * 40 },
            ]}
          >
            -
          </Text>
        </View>

        {/* Dòng số trừ (subtrahend) */}
        <View style={styles.row}>
          {steps[2].digits2.map((digit, i) => {
            const indexFromRight = steps[2].digits2.length - 1 - i;
            return (
              <Text
                key={`subtrahend-${i}`}
                style={[
                  styles.minuendText,
                  {
                    backgroundColor: getActiveBackgroundColor(indexFromRight),
                    color: getActiveTextColor(indexFromRight),
                  },
                ]}
              >
                {digit}
              </Text>
            );
          })}
        </View>
        {/* Dòng hoàn trả (payback) */}
        <View style={styles.row}>
          {steps[2].payBackFlags?.map((pay, i) => {
            const indexFromRight = steps[2].payBackFlags.length - 1 - i;
            const previousColumn = indexFromRight - 2;
            const previousMeta = steps[2].subStepsMeta
              .map((colIndex, idx) => ({ idx, colIndex }))
              .filter((m) => m.colIndex === previousColumn)
              .map((m) => m.idx)
              .pop();
            const shouldReveal =
              previousMeta !== undefined && subStepIndex > previousMeta;

            const shouldHighlight = shouldReveal && pay;

            return (
              <Text
                key={`payback-${i}`}
                style={[
                  styles.paybackText,
                  {
                    backgroundColor: shouldHighlight
                      ? getActiveBackgroundColor(indexFromRight)
                      : "transparent",
                    color: shouldHighlight
                      ? getActiveTextColor(indexFromRight)
                      : "transparent",
                    opacity: shouldReveal ? 1 : 0,
                  },
                ]}
              >
                {pay ? "- 1" : " "}
              </Text>
            );
          })}
        </View>
        {/* Gạch ngang */}
        <View
          style={{
            height: 2,
            backgroundColor: theme.colors.textModal,
            width: steps[2].digits1.length * 45,
            marginVertical: 6,
          }}
        />

        {/* Dòng kết quả */}
        <View style={styles.row}>
          {steps[2].resultDigits.map((digit, i) => {
            const indexFromRight = steps[2].resultDigits.length - 1 - i;
            const shouldReveal =
              i >= steps[2].resultDigits.length - revealedResultDigits;
            return (
              <TouchableOpacity
                key={`result-digit-${i}`}
                onPress={() => {
                  const toSpeak = steps[2].subSteps?.[subStepIndex];
                  if (
                    i === steps[2].resultDigits.length - revealedResultDigits &&
                    toSpeak
                  ) {
                    Speech.speak(toSpeak, { language: "vi-VN" });
                  }
                }}
              >
                <Text
                  style={[
                    styles.minuendText,
                    {
                      backgroundColor: getActiveBackgroundColor(indexFromRight),
                      color: getActiveTextColor(indexFromRight),
                    },
                  ]}
                >
                  {shouldReveal ? digit : "?"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};
