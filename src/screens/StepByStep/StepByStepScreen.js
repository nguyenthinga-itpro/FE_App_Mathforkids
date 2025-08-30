import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../themes/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { AdditionStepView } from "./StepView/AdditionStepView";
import { SubtractionStepView } from "./StepView/SubtractionStepView";
import { MultiplicationStepView } from "./StepView/MultiplicationStepView";
import { DivisionStepView } from "./StepView/DivisionStepView";
import * as Speech from "expo-speech";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";
import { getStyles } from "../StepByStep/style/style";
import StepZeroInput from "./StepView/CommonStepView/StepZeroInputView";
import StepExplanationBox from "./StepView/CommonStepView/StepExplanationBox";
import HorizontalLayout from "./StepView/CommonStepView/HorizontalLayout";
import VerticalLayout from "./StepView/CommonStepView/VerticalLayout";
import ResultBox from "./StepView/CommonStepView/ResultBox";
import { handleNext, handleBack } from "../StepByStep/logic/handleNavigation";

export default function StepByStepScreen({ navigation, route }) {
  const { theme } = useTheme();
  const {
    skillName,
    number1: autoNumber1 = "",
    number2: autoNumber2 = "",
    operator: routeOperator,
    grade: grade,
  } = route.params || {};
  const skillNameLower = skillName?.toLowerCase();
  const getBorderBox = () => {
    if (skillName === "Addition") return theme.colors.GreenBorderDark;
    if (skillName === "Subtraction") return theme.colors.purpleBorderDark;
    if (skillName === "Multiplication") return theme.colors.orangeBorderDark;
    if (skillName === "Division") return theme.colors.redBorderDark;
    return theme.colors.pinkDark;
  };
  const styles = getStyles(theme, getBorderBox);
  const getOperatorFromSkillName = (skill) => {
    switch (skill) {
      case "Addition":
        return "+";
      case "Subtraction":
        return "-";
      case "Multiplication":
        return "×";
      case "Division":
        return "÷";
      default:
        return "+";
    }
  };

  const [operator, setOperator] = useState(
    routeOperator || getOperatorFromSkillName(skillName)
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [number1, setNumber1] = useState("");
  const [number2, setNumber2] = useState("");
  const [remember, setRemember] = useState("");
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [revealedDigits, setRevealedDigits] = useState(-1);
  const [revealedResultDigits, setRevealedResultDigits] = useState(0);
  const [steps, setSteps] = useState([]);
  const [columnStepIndex, setColumnStepIndex] = useState(0);
  const isFromRouteRef = useRef(false);
  const { t, i18n } = useTranslation("stepbystep");
  const [visibleDigitsMap, setVisibleDigitsMap] = useState({});
  const [visibleCarryMap, setVisibleCarryMap] = useState({});
  const carryBackupRef = useRef({});
  //nhận params và gán giá trị
  useEffect(() => {
    if (autoNumber1 !== undefined && autoNumber2 !== undefined) {
      // console.log("Setting number from route:", autoNumber1, autoNumber2);
      setNumber1(String(autoNumber1));
      setNumber2(String(autoNumber2));
      isFromRouteRef.current = true;
    }
  }, [autoNumber1, autoNumber2]);
  useEffect(() => {
    if (!isFromRouteRef.current) {
      setNumber1("");
      setNumber2("");
      // console.log("Reset vì đổi operator và không nhận từ route");
    } else {
      // console.log("Không reset vì vừa nhận từ route");
    }

    isFromRouteRef.current = false;
  }, [operator]);

  useEffect(() => {
    const langCode = i18n.language === "vi" ? "vi-VN" : "en-US";
    const skillKey = getSkillNameFromOperator(operator);

    const message = t("speech.selectOperator", {
      operator: t(`skills.${skillKey}`),
    });

    Speech.speak(message, {
      language: langCode,
      pitch: 1,
      rate: 1,
    });
  }, [operator, i18n.language]);
  console.log("stepIndex", stepIndex);
  const getMaxLength = (inputIndex) => {
    switch (operator) {
      case "+":
      case "-":
        return 6;
      case "×":
        return inputIndex === 1 ? 5 : 2;
      case "÷":
        return inputIndex === 1 ? 5 : 2;
      default:
        return 6;
    }
  };
  const getSkillNameFromOperator = (operator) => {
    switch (operator) {
      case "+":
        return "addition";
      case "-":
        return "subtraction";
      case "×":
        return "multiplication";
      case "÷":
        return "division";
      default:
        return "addition";
    }
  };

  const getGradient = () => {
    switch (skillName) {
      case "Addition":
        return theme.colors.gradientGreen;
      case "Subtraction":
        return theme.colors.gradientPurple;
      case "Multiplication":
        return theme.colors.gradientOrange;
      case "Division":
        return theme.colors.gradientRed;
      default:
        return theme.colors.gradientPink;
    }
  };

  const currentStep = steps[stepIndex];

  const dynamicFontSize = (value) => {
    if (value.length <= 2) return 100;
    if (value.length <= 4) return 50;
    if (value.length <= 6) return 34;
    if (value.length <= 8) return 24;
    return 20;
  };

  const placeLabels = [
    t("place.units"),
    t("place.tens"),
    t("place.hundreds"),
    t("place.thousands"),
    t("place.ten_thousands"),
    t("place.hundred_thousands"),
    t("place.millions"),
    t("place.ten_millions"),
    t("place.hundred_millions"),
    t("place.billions"),
  ];
  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradient()} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Speech.stop();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("calculation")}</Text>
      </LinearGradient>

      {/* Step title */}
      <StepExplanationBox
        stepIndex={stepIndex}
        currentStep={currentStep}
        styles={styles}
        getGradient={getGradient}
        theme={theme}
        t={t}
      />
      {/* Step 0 input */}
      {stepIndex === 0 && (
        <StepZeroInput
          operator={operator}
          setOperator={setOperator}
          number1={number1}
          number2={number2}
          setNumber1={setNumber1}
          setNumber2={setNumber2}
          getMaxLength={getMaxLength}
          dynamicFontSize={dynamicFontSize}
          styles={styles}
          routeOperator={routeOperator}
          autoNumber1={autoNumber1} // Pass autoNumber1
          autoNumber2={autoNumber2} // Pass autoNumber2
          grade={grade} // Pass autoNumber2
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {stepIndex === 1 && (
          <Text style={styles.calText}>
            {t("horizontal")} {t(`skills.${skillNameLower}`)}
          </Text>
        )}
        {/* Calculation */}
        {stepIndex === 1 && (
          <HorizontalLayout
            operator={operator}
            number1={number1}
            number2={number2}
            styles={styles}
          />
        )}
        {stepIndex === 1 && (
          <Text style={styles.calText}>
            {t("vertical")} {t(`skills.${skillNameLower}`)}
          </Text>
        )}
        {/* Write the problem vertically */}
        {stepIndex === 1 && (
          <VerticalLayout
            operator={operator}
            number1={number1}
            number2={number2}
            styles={styles}
            stepIndex={stepIndex}
            currentStep={currentStep}
          />
        )}
        {stepIndex === 1 && (
          <View style={styles.stepBox}>
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={getGradient()}
                style={styles.soundContainer}
              >
                <TouchableOpacity
                  onPress={() => {
                    Speech.stop();

                    const textToRead = currentStep?.subText;

                    if (textToRead) {
                      Speech.speak(textToRead, {
                        language: i18n.language === "vi" ? "vi-VN" : "en-US",
                        pitch: 1,
                        rate: 0.9,
                      });
                    }
                  }}
                >
                  <Ionicons
                    name="volume-medium"
                    size={30}
                    color={theme.colors.white}
                  />
                </TouchableOpacity>
              </LinearGradient>

              {stepIndex > 0 && (
                <View style={{ width: "80%" }}>
                  {currentStep?.subText && (
                    <Text style={styles.title}>{currentStep.subText}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* result */}
        {stepIndex === 3 && (
          <ResultBox styles={styles} currentStep={currentStep} />
        )}

        {operator === "+" && stepIndex === 2 && steps[2]?.digitSums && (
          <AdditionStepView
            steps={steps}
            placeLabels={placeLabels}
            skillName={skillName}
            columnStepIndex={columnStepIndex} // ✅ TRUYỀN STEP ĐANG XEM
          />
        )}

        {operator === "-" && stepIndex === 2 && (
          <SubtractionStepView
            steps={steps}
            placeLabels={placeLabels}
            skillName={skillName}
            revealedResultDigits={revealedResultDigits}
            setRevealedResultDigits={setRevealedResultDigits}
            subStepIndex={subStepIndex}
            t={t}
          />
        )}
        {operator === "×" && stepIndex === 2 && (
          <MultiplicationStepView
            steps={steps}
            stepIndex={stepIndex}
            skillName={skillName}
            currentRowIndex={currentRowIndex}
            setCurrentRowIndex={setCurrentRowIndex}
            revealedDigits={revealedDigits}
            setRevealedDigits={setRevealedDigits}
            revealedResultDigits={revealedResultDigits}
            setRevealedResultDigits={setRevealedResultDigits}
            multiplier1={number1}
            multiplier2={number2}
            subStepIndex={subStepIndex}
            columnStepIndex={columnStepIndex}
            setColumnStepIndex={setColumnStepIndex}
            operator={operator}
            setStepIndex={setStepIndex}
            visibleDigitsMap={visibleDigitsMap}
            setVisibleDigitsMap={setVisibleDigitsMap}
            visibleCarryMap={visibleCarryMap}
            setVisibleCarryMap={setVisibleCarryMap}
          />
        )}
        {operator === "÷" && stepIndex === 2 && (
          <DivisionStepView
            steps={steps}
            skillName={skillName}
            columnStepIndex={columnStepIndex}
          />
        )}
        <View style={styles.backStepContainer}>
          {stepIndex > 1 && (
            <LinearGradient
              colors={getGradient()}
              style={styles.backStepButton}
            >
              <TouchableOpacity
                onPress={() =>
                  handleBack({
                    subStepIndex,
                    setSubStepIndex,
                    stepIndex,
                    setStepIndex,
                    steps,
                    setRevealedDigits,
                    setRevealedResultDigits,
                    setCurrentRowIndex,
                    setVisibleCarryMap,
                    setVisibleDigitsMap,
                    setSteps,
                    operator,
                    columnStepIndex,
                    setColumnStepIndex,
                  })
                }
              >
                <Ionicons
                  name="caret-back"
                  size={30}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>
        <View style={styles.backStepContainer}>
          {stepIndex > 0 && (
            <LinearGradient
              colors={getGradient()}
              style={styles.backStepButton}
            >
              <TouchableOpacity
                onPress={() => {
                  setStepIndex(0);
                  setSubStepIndex(0);
                  setCurrentRowIndex(0);
                  setRevealedDigits(0);
                  setRevealedResultDigits(0);
                  setColumnStepIndex(0);
                  if (setVisibleCarryMap) setVisibleCarryMap({});
                  if (setVisibleDigitsMap) setVisibleDigitsMap({});
                  if (setRemember) setRemember("");
                }}
              >
                <Ionicons
                  name="play-back"
                  size={30}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>
      </ScrollView>
      {(stepIndex === 0 || stepIndex < steps.length - 1) && (
        <LinearGradient
          colors={getGradient()}
          style={styles.nextButton}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        >
          <TouchableOpacity
            onPress={() =>
              handleNext({
                stepIndex,
                setStepIndex,
                subStepIndex,
                setSubStepIndex,
                setRevealedResultDigits,
                setRevealedDigits,
                setSteps,
                setCurrentRowIndex,
                currentRowIndex,
                steps,
                number1,
                number2,
                operator,
                t,
                setRemember,
                revealedResultDigits,
                visibleDigitsMap,
                setVisibleDigitsMap,
                setVisibleCarryMap,
                visibleCarryMap,
                setColumnStepIndex,
                columnStepIndex,
                carryBackupRef,
              })
            }
          >
            <Text style={styles.nextText}>{t("button.next")}</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
      <FloatingMenu />
    </View>
  );
}
