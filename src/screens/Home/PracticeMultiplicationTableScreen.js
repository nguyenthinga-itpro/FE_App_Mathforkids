import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";
import * as Speech from "expo-speech";

export default function PracticeMultiplicationTableScreen({
  navigation,
  route,
}) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("multiplicationtable");
  const { table, title, pupilId, grade } = route.params;

  const [multiplier, setMultiplier] = useState(1);
  const [userAnswer, setUserAnswer] = useState("");
  const [hiddenIndex, setHiddenIndex] = useState("result");
  const [left, setLeft] = useState(table);
  const [right, setRight] = useState(multiplier);
  const [result, setResult] = useState(left * right);

  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const skillName = "Multiplication";
  const operator = "×";

  useEffect(() => {
    generateProblem();
  }, [multiplier]);
  useEffect(() => {
    const textToSpeak =
      i18n.language === "vi"
        ? "Điền số thích hợp vào ô"
        : "Select the appropriate number in the box";
    Speech.stop();
    Speech.speak(textToSpeak, {
      language: i18n.language === "vi" ? "vi-VN" : "en-US",
    });
  }, []);

  const generateProblem = () => {
    const randRight = Math.floor(Math.random() * 9) + 1;
    const randLeft = table;
    const result = randLeft * randRight;
    setLeft(randLeft);
    setRight(randRight);
    setResult(result);
    const options = ["left", "right", "result"];
    const randomHidden = options[Math.floor(Math.random() * options.length)];
    setHiddenIndex(randomHidden);
  };

  const next = () => {
    const correctAnswer =
      hiddenIndex === "left" ? left : hiddenIndex === "right" ? right : result;

    const userAnsNum = parseInt(userAnswer);
    const isCorrect = userAnsNum === correctAnswer;

    const expression = `${left} ${operator} ${right} = ${result}`;
    const questionId = Date.now();

    const questionObj = {
      id: questionId,
      left,
      right,
      answer: correctAnswer,
      user: userAnsNum,
      hidden: hiddenIndex,
      expression,
    };

    const newQuestions = [...questions, questionObj];
    const newAnswers = { ...answers, [questionId]: userAnsNum };
    const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const newWrongCount = wrongCount + (isCorrect ? 0 : 1);

    setQuestions(newQuestions);
    setAnswers(newAnswers);
    setCorrectCount(newCorrectCount);
    setWrongCount(newWrongCount);
    setUserAnswer("");

    if (multiplier < 9) {
      setMultiplier(multiplier + 1);
    } else {
      const totalQuestions = 9;
      const rawScore = (newCorrectCount / totalQuestions) * 10;
      const finalScore = Math.round(rawScore);

      navigation.navigate("ExerciseResultScreen", {
        questions: newQuestions,
        answers: newAnswers,
        score: finalScore,
        correctCount: newCorrectCount,
        wrongCount: newWrongCount,
        skillName,
        pupilId,
        grade,
      });
    }
  };

  const renderBox = (type) => {
    const value = type === "left" ? left : type === "right" ? right : result;
    const isHidden = hiddenIndex === type;

    return (
      <View style={styles.box}>
        {isHidden ? (
          <TextInput
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="numeric"
            placeholder="?"
            style={styles.input}
          />
        ) : (
          <Text style={styles.boxText}>{value}</Text>
        )}
      </View>
    );
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
      fontSize: 14,
    },
    equationRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    },
    operator: {
      fontSize: 40,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginHorizontal: 12,
    },
    operatorEqual: {
      fontSize: 40,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginHorizontal: 12,
      padding: 70,
    },
    box: {
      flexDirection: "row",
      minWidth: 120,
      minHeight: 150,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: "#FF7AC3",
      justifyContent: "center",
      alignItems: "center",
      margin: 10,
      borderRadius: 10,
    },
    boxText: {
      fontSize: 80,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    input: {
      fontSize: 80,
      fontFamily: Fonts.NUNITO_MEDIUM,
      textAlign: "center",
      color: theme.colors.black,
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
      paddingVertical: 14,
      alignItems: "center",
    },
    nextText: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors.gradientPink} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("MultiplicationTableDetailScreen", {
            skillName: "Expression",
            pupilId,
            grade,
            table,
            title,
          })}
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{title}</Text>
      </LinearGradient>
      <View style={styles.infoRow}>
        <TouchableOpacity>
          <LinearGradient
            colors={theme.colors.gradientPink}
            style={styles.volumeContainer}
          >
            <Ionicons
              name="volume-high"
              size={30}
              color={theme.colors.white}
              styles={styles.volumeIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.infoText}>
          {t("selectNumberInBox", "Select the appropriate number in the box")}
        </Text>
      </View>
      <View style={styles.equationRow}>
        {renderBox("left")}
        <Text style={styles.operator}>×</Text>
        {renderBox("right")}
      </View>
      <View style={styles.equationRow}>
        <Text style={styles.operatorEqual}>=</Text>
        {renderBox("result")}
      </View>

      <TouchableOpacity style={styles.nextWrapper} onPress={next}>
        <LinearGradient
          colors={theme.colors.gradientPink}
          style={styles.nextButton}
        >
          <Text style={styles.nextText}>
            {multiplier === 9 ? t("submit", "Submit") : t("next", "Next")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <FloatingMenu />
    </View>
  );
}