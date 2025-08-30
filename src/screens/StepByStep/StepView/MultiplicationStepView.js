import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import * as Speech from "expo-speech";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../themes/ThemeContext";
import { Fonts } from "../../../../constants/Fonts";
function getVisibleCharsFromRight(paddedChars, revealCount) {
  const visibleChars = [...paddedChars];
  let revealed = 0;
  for (let j = paddedChars.length - 1; j >= 0; j--) {
    const char = paddedChars[j];
    if (char.trim() === "") continue;
    if (revealed < revealCount) {
      revealed++;
    } else {
      visibleChars[j] = " ";
    }
  }
  return visibleChars;
}
export const MultiplicationStepView = ({
  subStepIndex,
  steps,
  visibleDigitsMap = {},
  visibleCarryMap = {},
  skillName,
}) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation("stepbystep");
  const subSteps = steps?.[2]?.subSteps || [];
  const subStepsMeta = steps?.[2]?.subStepsMeta || [];
  const explanation = subSteps[subStepIndex] || "";
  const meta = subStepsMeta[subStepIndex] || {};
  const digits = steps?.[2]?.digits || [];
  const multiplierDigits = steps?.[2]?.multiplierDigits || [];
  const partials = steps?.[2]?.partials || [];
  const carryRows = steps?.[2]?.carryRows || [];
  const verticalCarryRows = steps?.[2]?.verticalCarryRows || [];
  const result = steps?.[3]?.result || "";
  const [localCarryBothRevealed, setLocalCarryBothRevealed] = useState(0);
  const previousTypeRef = useRef(null);
  useEffect(() => {
    const previousType = previousTypeRef.current;
    const currentType = meta?.type;
    if (
      ["carry_add", "vertical_add"].includes(previousType) &&
      !["carry_add", "vertical_add"].includes(currentType)
    ) {
      setLocalCarryBothRevealed((prev) => prev + 1);
    }

    previousTypeRef.current = currentType;
  }, [subStepIndex]);

  const maxLen = Math.max(
    digits.length,
    multiplierDigits.length + 1,
    ...partials.map((p) => p.length),
    result.length
  );
  const padLeft = (arr, length) => {
    const diff = length - arr.length;
    if (diff <= 0) {
      return arr;
    }
    const pad = Array(diff).fill("");
    return pad.concat(arr);
  };
  const verticalCarryRow = padLeft(
    [...verticalCarryRows].reverse().slice(-maxLen),
    maxLen
  );
  const verticalRevealCol = meta?.column ?? 0;
  const visibleVerticalCarryRow = verticalCarryRow.map((char, idx) =>
    maxLen - 2 - idx <= verticalRevealCol ? char : ""
  );
  // Highlight
  const getHighlightValueIndexes = () => {
    const indexes = {
      digits: [],
      multiplier: [],
      result: [],
      columnHighlights: [],
    };
    const {
      d1,
      d2,
      colIndex,
      rowIndex,
      type,
      column,
      product,
      digitsToReveal,
    } = meta;
    const getRightIdx = (col, row) => maxLen - 1 - ((col ?? 0) + (row ?? 0));
    // Highlight digits
    if (typeof d1 === "number") indexes.digits.push(getRightIdx(colIndex, 0));
    if (typeof d2 === "number")
      indexes.multiplier.push(getRightIdx(0, rowIndex));
    const originalPartial = partials[rowIndex] || "";
    const displayStr =
      type === "carry_add" && typeof product === "number"
        ? String(product).padStart(originalPartial.length, "0")
        : originalPartial;
    const paddedPartial = padLeft(displayStr.split(""), maxLen);
    const partialLen = displayStr.length;
    const pushResultIndex = (offset = 0) => {
      const idx =
        maxLen -
        partialLen +
        (partialLen - 1 - ((colIndex ?? 0) + (rowIndex ?? 0) + offset));
      if (idx >= 0 && idx < maxLen) indexes.result.push(idx);
    };
    // Highlight result digits
    if (typeof product === "number") {
      if (["detail", "detail_final_digit"].includes(type)) {
        pushResultIndex();
      } else if (type === "reveal_digits") {
        const revealCount = digitsToReveal || String(product).length;
        for (let i = 0; i < revealCount; i++) pushResultIndex(i);
      } else if (type === "carry_add" && typeof colIndex === "number") {
        pushResultIndex();
      }
    }
    // Zero rule or shift
    if (["zero_rule", "shift"].includes(type)) {
      const lastZeroIndex = paddedPartial.lastIndexOf("0");
      if (lastZeroIndex !== -1) indexes.result.push(lastZeroIndex);
    }
    // Vertical add: highlight full column
    if (type === "vertical_add" && typeof column === "number") {
      const colIdx = maxLen - 1 - column;
      indexes.columnHighlights.push(colIdx);
      [partials, carryRows, [result]].forEach((group) =>
        group.forEach((row) => {
          const padded = padLeft(
            typeof row === "string" ? row.split("") : row,
            maxLen
          );
          if (padded[colIdx]?.trim()) indexes.result.push(colIdx);
        })
      );
    }
    return indexes;
  };
  const buildMergedCarryTopRow = () => {
    const carryRow0 = carryRows[0] ?? [];
    const carryArray =
      typeof carryRow0 === "string" ? carryRow0.split("") : [...carryRow0];
    const paddedCarry = padLeft(carryArray, maxLen).slice(1).concat(" "); // shift left
    const shouldHideCarry0 =
      meta.type === "vertical_add" &&
      (typeof meta.rowIndex !== "number" || meta.rowIndex === 0);

    const revealCount = shouldHideCarry0 ? 0 : visibleCarryMap["carry_0"] ?? 0;
    const carryVisible = getVisibleCharsFromRight(paddedCarry, revealCount);
    return visibleVerticalCarryRow.map((topChar, idx) => {
      const bottomChar = carryVisible[idx] ?? " ";
      const showPlus =
        highlightIdx.includes(idx) &&
        bottomChar !== " " &&
        meta.type === "carry_add";
      return {
        top: topChar !== " " ? topChar : " ",
        bottom: bottomChar !== " " ? bottomChar : " ",
        showPlus,
      };
    });
  };
  useEffect(() => {
    const explanation = subSteps[subStepIndex];
    if (!explanation) {
      return;
    }
    Speech.stop();
    Speech.speak(explanation, {
      language: i18n.language === "vi" ? "vi-VN" : "en-US",
      pitch: 1,
      rate: 0.9,
    });
  }, [subStepIndex, i18n.language]);
  const {
    digits: digitHighlights,
    multiplier: multiplierHighlights,
    result: resultHighlights,
    columnHighlights,
  } = useMemo(() => getHighlightValueIndexes(), [meta, partials]);
  const renderRow = (
    label,
    arr,
    highlightIdx = [],
    type = "normal",
    colHighlights = [],
    isFirstCarry = false
  ) => (
    <View
      style={[
        styles.rowContainer,
        type === "carryTop" && { marginVertical: 0 },
        type === "carry" &&
          isFirstCarry && {
            marginVertical: 1,
          },
        type === "carry" &&
          !isFirstCarry && {
            marginVertical: 0,
          },
        type !== "carry" && type !== "carryTop" && { marginVertical: 4 },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {arr.map((char, i) => {
        if (
          typeof char === "object" &&
          char !== null &&
          typeof char.top === "string" &&
          typeof char.bottom === "string"
        ) {
          const { top, bottom, showPlus } = char;
          const topVisible = top.trim() !== "";
          const bottomVisible = bottom.trim() !== "";
          const isCarryBoth = type === "carryBoth";

          const topHighlight =
            topVisible && highlightIdx.includes(i) && isCarryBoth;
          const allowedCarryTypes = ["detail", "carry_add", "vertical_add"];
          const bottomHighlight =
            bottomVisible &&
            highlightIdx.includes(i) &&
            (type !== "carryBoth" || allowedCarryTypes.includes(meta.type));
          return (
            <View key={i} style={{ alignItems: "center" }}>
              <Text style={[styles.cellTop, topHighlight && styles.highlight]}>
                {top.trim() !== "" ? `+${top}` : " "}
              </Text>

              <View
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: -16,
                  },
                  bottomHighlight && {
                    backgroundColor: getBorderBox(),
                    borderRadius: 6,
                    paddingHorizontal: 5,
                  },
                ]}
              >
                {showPlus && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: Fonts.NUNITO_BOLD,
                      color: theme.colors.white,
                      paddingRight: 3,
                    }}
                  >
                    +
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.NUNITO_BOLD,
                    color: (() => {
                      if (bottom.trim() === "") {
                        return theme.colors.textModal;
                      }
                      const revealed = localCarryBothRevealed;
                      const rightIndex = maxLen - 1 - i;
                      const isCurrentlyHighlight = highlightIdx.includes(i);
                      const isAfterHighlight =
                        !isCurrentlyHighlight && rightIndex <= revealed;
                      let color = theme.colors.textModal;
                      if (isCurrentlyHighlight) {
                        color = theme.colors.white;
                      } else if (isAfterHighlight) {
                        color = "white";
                      }
                      return color;
                    })(),
                  }}
                >
                  {bottom}
                </Text>
              </View>
            </View>
          );
        }
        let content = char;
        let showPlus = false;

        if (typeof char === "object" && char !== null) {
          content = char.char;
          showPlus = char.showPlus;
        }

        const rightIndex = maxLen - 1 - i;
        const revealed = localCarryBothRevealed || 0;
        const isCurrentlyHighlight = highlightIdx.includes(i);
        const isAfterHighlight =
          !isCurrentlyHighlight &&
          (type === "carry" || type === "carryBoth") &&
          content.trim() !== "" &&
          rightIndex < revealed;

        let carryColor = {};
        if (
          (type === "carry" || type === "carryBoth") &&
          content.trim() !== ""
        ) {
          if (isCurrentlyHighlight) {
            carryColor = { color: theme.colors.white };
          } else if (isAfterHighlight) {
            carryColor = { color: theme.colors.white };
          } else {
            carryColor = { color: theme.colors.textModal };
          }
        }
        const isCellHighlighted =
          (highlightIdx.includes(i) || colHighlights.includes(i)) &&
          content.trim() !== "";
        return (
          <Text
            key={i}
            style={[
              styles.cell,
              (type === "carry" || type === "carryBoth") && styles.carryText,
              type === "result" && styles.resultText,
              type === "multiplier" &&
                highlightIdx.includes(i) &&
                styles.highlightOrange,
              isCellHighlighted && styles.highlight,
              carryColor,
            ]}
          >
            {showPlus ? (
              <>
                <Text style={styles.plusSign}>+ </Text>
                {content}
              </>
            ) : (
              content
            )}
          </Text>
        );
      })}
    </View>
  );
  const shouldHighlightCarry =
    meta.rowIndex === 0 &&
    ["carry_add", "vertical_add"].includes(meta.type) &&
    typeof meta.colIndex === "number";
  const highlightIdx = shouldHighlightCarry ? [maxLen - 1 - meta.colIndex] : [];
  let carryBothHighlightIndexes = [];
  if (
    meta.type === "carry_add" &&
    meta.rowIndex === 0 &&
    typeof meta.colIndex === "number"
  ) {
    carryBothHighlightIndexes = [maxLen - 1 - meta.colIndex];
  } else if (meta.type === "vertical_add" && typeof meta.column === "number") {
    carryBothHighlightIndexes = [maxLen - 1 - meta.column];
  }
  const mergedCarryTopAndCarryRow0 = buildMergedCarryTopRow();
  const getText = () => {
    if (skillName === "Addition") return theme.colors.GreenBorderDark;
    if (skillName === "Subtraction") return theme.colors.purpleBorderDark;
    if (skillName === "Multiplication") return theme.colors.orangeBorderDark;
    if (skillName === "Division") return theme.colors.redBorderDark;
    return theme.colors.pinkDark;
  };
    const getBorderBox = () => {
    if (skillName === "Addition") return theme.colors.GreenStepDark;
    if (skillName === "Subtraction") return theme.colors.purpleStepDark;
    if (skillName === "Multiplication") return theme.colors.orangeStepDark;
    if (skillName === "Division") return theme.colors.redStepDark;
    return theme.colors.pinkStepDark;
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.cardBackground,
    },
    explanationBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      maxHeight: 140,
      borderWidth: 1,
      borderColor: getText(),
    },
    explanationText: {
      fontSize: 17,
      lineHeight: 24,
      fontFamily: Fonts.NUNITO_BOLD,
      color: getText(),
    },
    rowsBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: getText(),
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      width: 24,
      fontFamily: Fonts.NUNITO_BOLD,
      fontSize: 18,
      textAlign: "center",
      color: theme.colors.textModal,
    },
    cell: {
      width: 28,
      textAlign: "center",
      fontSize: 20,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.textModal,
    },
    cellTop: {
      width: 28,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.textModal,
    },
    carryText: {
      fontSize: 14,
      fontWeight: 500,
      // color: theme.colors.textModal,
    },
    resultText: {
      fontFamily: Fonts.NUNITO_BOLD,
    },
    highlight: {
      backgroundColor: getBorderBox(),
      borderRadius: 6,
      color: theme.colors.highlightText,
    },
    highlightOrange: {
      backgroundColor: getBorderBox(),
      borderRadius: 6,
      color: theme.colors.highlightText,
    },
    colHighlight: {
      backgroundColor: getText(),
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.white,
      color: theme.colors.highlightText,
    },
    plusSign: {
      color: theme.colors.highlightText,
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    divider: (maxLen) => ({
      alignSelf: "center",
      width: maxLen * 30,
      height: 2,
      backgroundColor: theme.colors.textModal,
      marginVertical: 6,
    }),
  });
  return (
    <View style={styles.container}>
      <ScrollView style={styles.explanationBox}>
        <Text style={styles.explanationText}>{explanation}</Text>
      </ScrollView>
      <View style={styles.rowsBox}>
        {renderRow(
          " ",
          padLeft(digits, maxLen),
          digitHighlights,
          "normal",
          " "
        )}
        {renderRow(
          "×",
          padLeft([" ", ...multiplierDigits], maxLen),
          multiplierHighlights,
          "multiplier",
          " "
        )}
        <View style={styles.divider(maxLen)} />
        {partials.map((partial, i) => (
          <React.Fragment key={i}>
            {i === 0
              ? renderRow(
                  " ",
                  mergedCarryTopAndCarryRow0,
                  carryBothHighlightIndexes,
                  "carryBoth",
                  []
                )
              : carryRows[i] &&
                (() => {
                  const rawCarryRow = carryRows[i] ?? [];
                  const carryArray =
                    typeof rawCarryRow === "string"
                      ? rawCarryRow.split("")
                      : [...rawCarryRow];
                  const padSize = maxLen - carryArray.length;
                  const paddedLeft = [
                    ...Array(padSize).fill(" "),
                    ...carryArray,
                  ];
                  const padded = [...paddedLeft.slice(1), " "];
                  const isVerticalAdd = meta?.type === "vertical_add";
                  const revealCount = isVerticalAdd
                    ? 0
                    : visibleCarryMap[`carry_${i}`] ?? 0;
                  const visibleChars = getVisibleCharsFromRight(
                    padded,
                    revealCount
                  );
                  const carryHighlightIndexes =
                    meta.rowIndex === i &&
                    ["carry_add", "vertical_add"].includes(meta.type) &&
                    typeof meta.colIndex === "number"
                      ? [maxLen - 2 - meta.colIndex]
                      : [];

                  const displayCarryChars = visibleChars.map((char, idx) => {
                    const shouldShowPlus =
                      carryHighlightIndexes.includes(idx) &&
                      char !== " " &&
                      ["carry_add", "vertical_add"].includes(meta.type);

                    return shouldShowPlus
                      ? { char, showPlus: true }
                      : { char, showPlus: false };
                  });
                  return renderRow(
                    " ",
                    displayCarryChars,
                    carryHighlightIndexes,
                    "carry",
                    []
                  );
                })()}
            {/* Partial row */}
            {(() => {
              const rawChars = partial.split("");
              const padded = padLeft(rawChars, maxLen);
              const revealCount = visibleDigitsMap[`row_${i}`] ?? 0;
              const startRevealIdx = maxLen - revealCount;
              const visibleChars = padded.map((char, idx) => {
                const isVisible = idx >= startRevealIdx && char !== " ";
                return isVisible ? char : char.trim() === "" ? " " : "?";
              });
              return renderRow(
                i === 0 ? " " : "+",
                visibleChars,
                i === meta.rowIndex ? resultHighlights : [],
                "normal",
                columnHighlights
              );
            })()}
          </React.Fragment>
        ))}
        {partials.length >= 2 && (
          <>
            <View style={styles.divider(maxLen)} />
            {(() => {
              const paddedResult = padLeft(result.split(""), maxLen);
              const revealCount = visibleDigitsMap["result"] ?? 0;
              const startRevealIdx = maxLen - revealCount;
              const visibleChars = paddedResult.map((char, idx) => {
                const isVisible = idx >= startRevealIdx && char !== " ";
                return isVisible ? char : "?";
              });
              return renderRow(
                " ",
                visibleChars,
                [],
                "result",
                columnHighlights
              );
            })()}
          </>
        )}
      </View>
    </View>
  );
};
