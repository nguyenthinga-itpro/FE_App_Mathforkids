import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { useTranslation } from "react-i18next";

export default function TestListScreen({ route }) {
  const navigation = useNavigation();
  const { testId, questions = [] } = route.params;
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("statistic");

  const styles = StyleSheet.create({
    container: {
      paddingTop: 30,
      paddingHorizontal: 30,
      paddingBottom: 60,
      backgroundColor: theme.colors.cardBackground,
    },
    backContainer: {
      marginBottom: 12,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.checkBoxBackground,
      borderRadius: 30,
      elevation: 3,
      width: "20%",
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    title: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_BOLD_ITALIC,
      marginBottom: 12,
    },
    questionBlock: {
      marginVertical: 12,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: theme.colors.checkBoxBackground,
      padding: 20,
      backgroundColor: theme.colors.cardBackground,
      elevation: 3,
    },
    questionText: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
    },
    questionLevel: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
    },
    questionImage: {
      width: "100%",
      height: 150,
      borderRadius: 8,
      marginVertical: 8,
      backgroundColor: theme.colors.white,
    },
    questionAnswer: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.chartGreen,
    },
    resultText: {
      fontFamily: Fonts.NUNITO_BOLD,
      marginTop: 4,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity
        style={styles.backContainer}
        onPress={navigation.goBack}
      >
        <Image
          source={theme.icons.back}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* <Text style={styles.title}>
        {t("testId")}: {testId}
      </Text> */}

      {questions.map((q, index) => (
        <View
          key={`${q.testId || "noTest"}_${
            q.exerciseId || "noExercise"
          }_${index}`}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            {index + 1}. {q.question?.[i18n.language] || q.question?.en}
          </Text>

          {q.image && (
            <Image
              source={{ uri: q.image }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          )}

          <Text style={styles.questionLevel}>
            {t("level")}: {q.levelName?.[i18n.language] || q.levelName?.en}
          </Text>

          <Text style={styles.questionAnswer}>
            {t("correctAnswer")}:{" "}
            {q.correctAnswer?.[i18n.language] || q.correctAnswer?.en}
          </Text>

          <Text style={styles.questionLevel}>
            {t("selectedAnswer")}:{" "}
            {q.selectedAnswer?.[i18n.language] || q.selectedAnswer?.en}
          </Text>

          <Text
            style={[
              styles.resultText,
              { color: q.isCorrect ? "green" : "red" },
            ]}
          >
            {q.isCorrect ? "✔ " + t("correct") : "✖ " + t("incorrect")}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
