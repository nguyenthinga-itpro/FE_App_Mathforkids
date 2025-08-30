import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../themes/ThemeContext";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Fonts } from "../../../../constants/Fonts";
import * as Speech from "expo-speech";

export const DivisionStepView = ({ steps, columnStepIndex, skillName }) => {
  const { theme } = useTheme?.();
  const { t, i18n } = useTranslation("stepbystep") || { t: (key) => key };

  const subSteps = steps[2]?.subSteps || [];
  const dividend = steps[2]?.dividend ?? "";
  const divisor = steps[2]?.divisor ?? "";
  const quotient = steps[2]?.quotient ?? "";
  const currentStep = columnStepIndex ?? 0;
  const step = subSteps[currentStep];

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

  const normalizedSubSteps = steps[2]?.subSteps || [];
  const hasBringDownExtra = normalizedSubSteps.some(
    (s) => typeof s.key === "string" && s.key.trim() === "step_bring_down_extra"
  );

  const divideStepIndices = subSteps
    .map((s, i) =>
      ["step_divide", "less_then_bring_down"].includes(s.key) ? i : null
    )
    .filter((i) => i !== null);
  const currentDivideIndex = divideStepIndices.findIndex((i) => i === currentStep);
  const divideStepsDone = subSteps.filter(
    (s, i) =>
      ["step_divide", "less_then_bring_down"].includes(s.key) &&
      i <= currentStep
  ).length;

  // extend sequences (e.g., "22" -> "226")
  const extendPairs = [];
  subSteps.forEach((s, i) => {
    if (s.key === "step_subtract") {
      const next = subSteps[i + 1];
      if (next?.key === "step_bring_down") {
        const base = (s.params?.currentDisplay ?? "").toString();
        const full = (next.params?.currentDisplay ?? "").toString();
        if (full.length === base.length + 1 && full.startsWith(base)) {
          extendPairs.push({
            subtractIdx: i,
            bringDownIdx: i + 1,
            base,
            full,
          });
        }
      }
    }
  });
  const findExtendBySubtract = (idx) => extendPairs.find((p) => p.subtractIdx === idx);
  const findExtendByBringDown = (idx) => extendPairs.find((p) => p.bringDownIdx === idx);

  // step_bring_down_extra staging
  const subtractZeroIndex = subSteps.findIndex(
    (s) => s.key === "step_subtract" && s.params?.remainder === 0
  );
  const bringDownAfterZeroSubtractIndex = subSteps.findIndex(
    (s, i) =>
      s.key === "step_bring_down" &&
      s.params?.explanationKey === "after_subtract" &&
      i > subtractZeroIndex
  );
  const extraIndex = subSteps.findIndex(
    (s) => typeof s.key === "string" && s.key.trim() === "step_bring_down_extra"
  );
  const getBringDownExtraVisibleChars = (fullStr) => {
    if (!fullStr) return 0;
    if (extraIndex !== -1 && currentStep >= extraIndex) return fullStr.length;
    if (
      bringDownAfterZeroSubtractIndex !== -1 &&
      currentStep >= bringDownAfterZeroSubtractIndex
    )
      return Math.min(2, fullStr.length);
    if (subtractZeroIndex !== -1 && currentStep >= subtractZeroIndex) return 1;
    return 0;
  };
  const getBringDownExtraHighlightIndex = () => {
    if (currentStep === subtractZeroIndex) return 0;
    if (currentStep === bringDownAfterZeroSubtractIndex) return 1;
    if (currentStep === extraIndex) return 2;
    return -1;
  };

  // less_then_bring_down staging
  const getLessThenBringDownFull = (s) => `${s.params?.result ?? ""}${s.params?.nextDigit ?? ""}`;

  const indentSpacing = 15;

  const renderExplanation = (step) => {
    if (!step) return null;
    const product =
      step.params?.product ??
      (step.params?.result != null && step.params?.divisor != null
        ? step.params.result * step.params.divisor
        : undefined);

    if (step.key === "step_bring_down" && step.params?.explanationKey === "after_subtract") {
      return t("step_bring_down_after_subtract", {
        ...step.params,
        product,
        remainder: step.params.remainder,
      });
    }
    if (step.key === "step_choose_number" && step.params?.comparisonKey) {
      const explanation = t(`explanation.${step.params.comparisonKey}`);
      return t(step.key, {
        ...step.params,
        comparison: t(`comparison.${step.params.comparisonKey}`),
        explanation,
        product,
      });
    }
    return t(step.key, { ...step.params, product });
  };

  const renderMaskedValue = (value, maxVisibleDigits, currentQuotientIndex) =>
    value
      .toString()
      .split("")
      .map((char, i) => {
        let color = theme.colors.text;
        if (i === currentQuotientIndex) color = getSkillColor();
        return (
          <Text key={i} style={{ color }}>
            {i < maxVisibleDigits ? char : "?"}
          </Text>
        );
      });

  const renderMaskedStringFlexible = (
    value,
    maxVisibleChars,
    highlightIndex = -1,
    highlightCount = 1
  ) =>
    value
      .toString()
      .split("")
      .map((char, i) => {
        let color = theme.colors.text;
        if (
          highlightIndex !== -1 &&
          i >= highlightIndex &&
          i < highlightIndex + highlightCount
        ) {
          color = getSkillColor();
        }
        return (
          <Text key={i} style={{ color }}>
            {i < maxVisibleChars ? char : "?"}
          </Text>
        );
      });

  const getDividendHighlightLength = () => {
    const s = subSteps[currentStep];
    if (!s) return 0;

    if (s.key === "step_choose_number") {
      const currentVal = (s.params?.current ?? "").toString();
      if (dividend.startsWith(currentVal)) {
        return currentVal.length;
      }
    }

    if (s.key === "step_bring_down") {
      const bringdownVal = (s.params?.afterBringDown ?? "").toString();
      if (dividend.startsWith(bringdownVal)) {
        return bringdownVal.length;
      }
    }

    return 0;
  };


  const maskSameLength = (value) => {
    const s = (value ?? "").toString();
    return s.replace(/./g, "?");
  };

  useEffect(() => {
    const step = subSteps[columnStepIndex];
    const text = renderExplanation(step);
    if (!text) return;
    Speech.speak(text, {
      language: i18n.language === "vi" ? "vi-VN" : "en-US",
    });
  }, [columnStepIndex]);

  const styles = StyleSheet.create({
    container: { alignItems: "center" },
    divisionBox: {
      flexDirection: "row",
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      marginTop: 15,
      marginLeft: 16,
      marginRight: 16,
      padding: 10,
      borderWidth: 1,
      width: 300,
      borderColor: getSkillColor(),
      alignItems: "center",
    },
    innerBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    leftBox: {
      borderRightWidth: 2,
      borderRightColor: theme.colors.text,
      paddingRight: 15,
    },
    rightBox: {},
    dividend: {
      fontSize: 24,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.text,
    },
    quotient: {
      paddingLeft: 15,
      fontSize: 24,
      color: theme.colors.text,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    divisor: {
      paddingLeft: 15,
      fontSize: 24,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.text,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.text,
    },
    lineText: { fontSize: 24, fontFamily: Fonts.NUNITO_MEDIUM },
    stepText: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: getSkillColor(),
      marginHorizontal: 12,
      textAlign: "center",
    },
    explanationBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 10,
      marginLeft: 16,
      marginRight: 16,
      maxHeight: 140,
      width: 300,
      borderWidth: 1,
      borderColor: getSkillColor(),
    },
    extraBringDownBox: {
      marginTop: 0,
      alignItems: "flex-start",
      width: "100%",
      paddingLeft: 0,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.explanationBox}>
        <Text style={styles.stepText}>{renderExplanation(step)}</Text>
      </View>

      <View style={styles.divisionBox}>
        <View style={{ width: "100%", alignItems: "center" }}>
          <View style={styles.innerBox}>
            {/* LEFT COLUMN */}
            <View style={styles.leftBox}>
              <Text style={styles.dividend}>
                {dividend.split("").map((char, i) => {
                  const highlightLen = getDividendHighlightLength();
                  const isHighlighted = i < highlightLen;
                  return (
                    <Text key={i} style={{ color: isHighlighted ? getSkillColor() : theme.colors.text }}>
                      {char}
                    </Text>
                  );
                })}
              </Text>

              {subSteps.map((s, idx) => {
                const isCurrent = idx === currentStep;
                const indent =
                  typeof s.params?.visualIndent === "number"
                    ? s.params.visualIndent
                    : s.params?.indent ?? 0;

                // 1. less_then_bring_down: no highlight, chỉ show theo visibility
                if (s.key === "less_then_bring_down") {
                  if (hasBringDownExtra) return null;
                  const full = getLessThenBringDownFull(s);
                  const maxVisible =
                    currentStep === idx
                      ? full.length
                      : subtractZeroIndex !== -1 && currentStep >= subtractZeroIndex
                        ? 1
                        : 0;

                  return (
                    <View key={`less-${idx}`} style={{ position: "relative" }}>
                      <Text
                        style={[
                          styles.lineText,
                          {
                            color: theme.colors.text,
                            paddingLeft: indent * indentSpacing,
                          },
                        ]}
                      >
                        {renderMaskedStringFlexible(full, maxVisible)}
                      </Text>
                    </View>
                  );
                }

                // 2. hide intermediate bring_down folded into extra
                if (
                  s.key === "step_bring_down" &&
                  s.params?.explanationKey === "after_subtract" &&
                  idx === (() => {
                    if (extraIndex === -1) return -1;
                    for (let i = extraIndex - 1; i >= 0; i--) {
                      const prev = subSteps[i];
                      if (
                        prev.key === "step_bring_down" &&
                        prev.params?.explanationKey === "after_subtract"
                      ) {
                        const displayPrev = (prev.params?.currentDisplay ?? "").toString();
                        const extraFull = (subSteps[extraIndex].params?.currentDisplay ?? "").toString();
                        if (extraFull.startsWith(displayPrev)) return i;
                      }
                    }
                    return -1;
                  })()
                ) {
                  return null;
                }

                // 3. hide subtract if part of extend
                if (findExtendBySubtract(idx)) {
                  return null;
                }

                // 4. extend bring_down ("22" -> "226", highlight base or last char)
                const extendPair = findExtendByBringDown(idx);
                if (extendPair) {
                  const full = extendPair.full;
                  let visible = 0;
                  let highlightIndex = -1;
                  let highlightCount = 0;

                  if (currentStep === extendPair.bringDownIdx) {
                    // Đúng bước bring down: full số + highlight chữ cuối
                    visible = full.length;
                    highlightIndex = full.length - 1;
                    highlightCount = 1;
                  }
                  else if (currentStep > extendPair.bringDownIdx) {
                    // Sau bước bring down: full số nhưng không highlight
                    visible = full.length;
                  }
                  else if (currentStep === extendPair.subtractIdx) {
                    // Bước subtract: highlight đúng base, không tô dấu ?
                    visible = extendPair.base.length;
                    highlightIndex = 0;
                    highlightCount = extendPair.base.length;
                  }

                  return (
                    <View key={`extended-bringdown-${idx}`} style={{ position: "relative" }}>
                      <Text
                        style={[
                          styles.lineText,
                          {
                            color: isCurrent ? getSkillColor() : theme.colors.text,
                            paddingLeft: indent * indentSpacing,
                          },
                        ]}
                      >
                        {renderMaskedStringFlexible(full, visible, highlightIndex, highlightCount)}
                      </Text>
                    </View>
                  );
                }


                // 5. bring_down_extra
                if (s.key === "step_bring_down_extra") {
                  const full = s.params.currentDisplay?.toString() ?? "";
                  const maxVisible = getBringDownExtraVisibleChars(full);
                  const highlightIndex = getBringDownExtraHighlightIndex();
                  return (
                    <View key={`extra-${idx}`} style={styles.extraBringDownBox}>
                      <Text
                        style={[
                          styles.lineText,
                          {
                            color: isCurrent ? getSkillColor() : theme.colors.text,
                            paddingLeft: indent * indentSpacing,
                          },
                        ]}
                      >
                        {renderMaskedStringFlexible(full, maxVisible, highlightIndex)}
                      </Text>
                    </View>
                  );
                }

                // 6. default multiply / subtract / bring_down with full-length masking
                if (["step_multiply", "step_subtract"].includes(s.key)) {
                  let displayContent = "?";
                  if (s.key === "step_multiply") {
                    const actual = s.params.product;
                    displayContent = currentStep >= idx ? actual : maskSameLength(actual);
                  } else if (s.key === "step_subtract") {
                    const actual = s.params.currentDisplay;
                    displayContent = currentStep >= idx ? actual : maskSameLength(actual);
                  } 
                  return (
                    <View key={`${s.key}-${idx}`} style={{ position: "relative" }}>
                      <Text
                        style={[
                          styles.lineText,
                          {
                            color: isCurrent ? getSkillColor() : theme.colors.text,
                            paddingLeft: indent * indentSpacing,
                          },
                        ]}
                      >
                        {displayContent}
                      </Text>
                      {s.key === "step_multiply" && currentStep >= idx && (
                        <>
                          <Text
                            style={{
                              position: "absolute",
                              left: -15,
                              top: -15,
                              fontSize: 24,
                              color: theme.colors.text,
                            }}
                          >
                            -
                          </Text>
                          <View
                            style={{
                              height: 2,
                              backgroundColor: theme.colors.text,
                              marginVertical: 2,
                              width: `${(s.params.product || "").toString().length * 14}px`,
                            }}
                          />
                        </>
                      )}
                    </View>
                  );
                }

                return null;
              })}
            </View>

            {/* RIGHT COLUMN */}
            <View style={styles.rightBox}>
              <Text style={styles.divisor}>{divisor}</Text>
              <Text style={styles.quotient}>
                {renderMaskedValue(quotient, divideStepsDone, currentDivideIndex)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};