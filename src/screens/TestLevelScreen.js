import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import { ProgressBar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  getRandomAssessments,
  updateIsBlock,
  unlockPreviousGradeLesson,
} from "../redux/assessmentSlice";
import { getEnabledLevels } from "../redux/levelSlice";
import { completeAndUnlockNextLesson } from "../redux/completedLessonSlice";
import { updatePupilProfile } from "../redux/pupilSlice";
import FullScreenLoading from "../components/FullScreenLoading";
import MessageError from "../components/MessageError";
import MessageSuccess from "../components/MessageSuccess";
import MessageConfirm from "../components/MessageConfirm";
import MessageWarning from "../components/MessangeWarning";
export default function AssessmentScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { grade, pupilId } = route.params || {};
  const dispatch = useDispatch();
  const {
    assessments,
    lessonByType,
    loading: assessmentLoading,
    error: assessmentError,
  } = useSelector((state) => state.assessment);
  const { levels } = useSelector((state) => state.level);
  const { t, i18n } = useTranslation("assessment");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageButtonRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmContent, setConfirmContent] = useState({
    title: "",
    description: "",
  });
  const [showError, setShowError] = useState(false);
  const [errorContent, setErrorContent] = useState({
    title: "",
    description: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successContent, setSuccessContent] = useState({
    title: "",
    description: "",
  });
  const [showWarning, setShowWarning] = useState(false);
  const [warningContent, setWarningContent] = useState({
    title: "",
    description: "",
  });
  const flatListRef = useRef(null);
  useEffect(() => {
    dispatch(getRandomAssessments({ grade }));
    dispatch(getEnabledLevels());
  }, []);
  const extractAnswerValue = (value, questionLevel) => {
    const questionLevelObj = levels.find(
      (level) => String(level.id) === String(questionLevel)
    );
    const isEasyLevel = questionLevelObj
      ? questionLevelObj.level === 1 || questionLevelObj.name?.en === "Easy"
      : false;
    if (isEasyLevel && typeof value === "string" && value.includes("=")) {
      return value.split("=")[1].trim();
    }
    return value;
  };
  // Memoize the questions array to prevent re-randomization on every render
  const questions = useMemo(() => {
    // console.log("Assessments:", assessments);
    return assessments.map((assessment, index) => {
      const correctAnswer = assessment.answer?.[i18n.language];
      const wrongOptions = (assessment.option || []).map(
        (opt) => opt[i18n.language] || ""
      );
      const allOptions = [correctAnswer, ...wrongOptions.slice(0, 3)].filter(
        Boolean
      );
      const shuffledOptions = allOptions
        .map((value) => ({
          value: extractAnswerValue(value, assessment.levelId),
          sort: Math.random(),
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      const answerIndex = shuffledOptions.indexOf(
        extractAnswerValue(correctAnswer, assessment.levelId)
      );
      return {
        id: assessment.id || index,
        question: assessment.question?.[i18n.language],
        options: shuffledOptions,
        answer: correctAnswer,
        answerIndex: answerIndex,
        image: assessment.image ? { uri: assessment.image } : null,
        levelId: assessment.levelId,
        lessonId: assessment.lessonId,
      };
    });
  }, [assessments, i18n.language]); // Only recompute if assessments or language change

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const doSubmit = () => {
    try {
      let totalScore = 0;
      let correct = 0;
      let lessonScores = {};
      let lessonMaxScores = {};
      questions.forEach((q) => {
        const level = levels.find(
          (lvl) => String(lvl.id) === String(q.levelId)
        );
        const point = level?.level === 1 ? 1 : level?.level === 2 ? 2 : 0;

        if (q.lessonId) {
          lessonMaxScores[q.lessonId] =
            (lessonMaxScores[q.lessonId] || 0) + point;
        }

        const isCorrect = selectedOptions[q.id] === q.answerIndex;
        if (isCorrect) {
          correct++;
          totalScore += point;
          if (q.lessonId) {
            lessonScores[q.lessonId] = (lessonScores[q.lessonId] || 0) + point;
          }
        }
      });

      const lessonTypes = [
        "addition",
        "subtraction",
        "multiplication",
        "division",
      ];
      lessonTypes.forEach((type) => {
        const lessonIds = lessonByType?.[type] || [];
        if (lessonIds.length > 0) {
          const firstLessonId = lessonIds[0];
          const secondLessonId = lessonIds[1] || null;

          if (correct === 0) {
            console.log(
              `Type: ${type}, No correct answers, unlocking first lesson: ${firstLessonId}`
            );
            dispatch(updateIsBlock({ pupilId, lessonId: firstLessonId }));
            dispatch(
              updatePupilProfile({ id: pupilId, data: { isAssess: true } })
            );
            dispatch(unlockPreviousGradeLesson({ pupilId }));
          } else if (lessonIds.length >= 2) {
            const firstScore = lessonScores[firstLessonId] || 0;
            const secondScore = lessonScores[secondLessonId] || 0;
            const firstMaxScore = lessonMaxScores[firstLessonId] || 0;
            const secondMaxScore = lessonMaxScores[secondLessonId] || 0;
            const firstPercentage =
              firstMaxScore > 0 ? (firstScore / firstMaxScore) * 100 : 0;
            const secondPercentage =
              secondMaxScore > 0 ? (secondScore / secondMaxScore) * 100 : 0;
            console.log(`type: ${type}`);
            console.log(
              `Lesson ID: ${firstLessonId}, Score: ${firstScore}/${firstMaxScore} (${firstPercentage.toFixed(
                2
              )}%)`
            );
            console.log(
              `Lesson ID: ${secondLessonId}, Score: ${secondScore}/${secondMaxScore} (${secondPercentage.toFixed(
                2
              )}%)`
            );
            if (secondPercentage >= 90) {
              dispatch(
                completeAndUnlockNextLesson({
                  pupilId,
                  lessonId: firstLessonId,
                })
              );
              dispatch(
                completeAndUnlockNextLesson({
                  pupilId,
                  lessonId: secondLessonId,
                })
              );
              dispatch(
                updatePupilProfile({ id: pupilId, data: { isAssess: true } })
              );
              dispatch(unlockPreviousGradeLesson({ pupilId }));
            } else if (firstPercentage >= 90) {
              dispatch(
                completeAndUnlockNextLesson({
                  pupilId,
                  lessonId: firstLessonId,
                })
              );
              dispatch(
                updatePupilProfile({ id: pupilId, data: { isAssess: true } })
              );
              dispatch(unlockPreviousGradeLesson({ pupilId }));
            } else if (firstPercentage < 90 && secondPercentage < 90) {
              dispatch(updateIsBlock({ pupilId, lessonId: firstLessonId }));
              dispatch(
                updatePupilProfile({ id: pupilId, data: { isAssess: true } })
              );
              dispatch(unlockPreviousGradeLesson({ pupilId }));
            }
          } else {
            const score = lessonScores[firstLessonId] || 0;
            const maxScore = lessonMaxScores[firstLessonId] || 0;
            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
            console.log(
              `Type: ${type}, Lesson ID: ${firstLessonId}, Score: ${score}/${maxScore} (${percentage.toFixed(
                2
              )}%)`
            );
            if (percentage >= 90) {
              dispatch(
                completeAndUnlockNextLesson({
                  pupilId,
                  lessonId: firstLessonId,
                })
              );
              dispatch(
                updatePupilProfile({ id: pupilId, data: { isAssess: true } })
              );
              dispatch(unlockPreviousGradeLesson({ pupilId }));
            }
          }
        }
      });

      const maxTotalScore = questions.reduce((sum, q) => {
        const level = levels.find(
          (lvl) => String(lvl.id) === String(q.levelId)
        );
        return sum + (level?.level === 1 ? 1 : level?.level === 2 ? 2 : 0);
      }, 0);

      const calculatedScore =
        maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 10) : 0;
      setCorrectCount(correct);
      setScore(calculatedScore);
      setShowModal(true);
    } catch (error) {
      setErrorContent({
        title: t("error"),
        description: t("submissionFailed"),
      });
      setShowError(true);
    }
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(
      (q) => selectedOptions[q.id] === undefined
    );

    if (unanswered.length > 0) {
      const firstUnansweredIndex = questions.findIndex(
        (q) => selectedOptions[q.id] === undefined
      );

      setWarningContent({
        title: t("warning"),
        description: t("unansweredQuestions", { count: unanswered.length }),
        onCancel: () => {
          setShowWarning(false);
          if (firstUnansweredIndex !== -1 && flatListRef.current) {
            try {
              flatListRef.current.scrollToIndex({
                index: firstUnansweredIndex,
                animated: true,
              });
            } catch (error) {
              console.log("Error scrolling to index:", error);
            }
          }
        },
        onConfirm: () => {
          setShowWarning(false);
          console.log("Submit pressed in MessageWarning");
          doSubmit();
        },
        showCancelButton: true,
      });

      setShowWarning(true);
      return;
    }
    console.log("No unanswered questions, calling doSubmit");
    // Nếu không có câu hỏi chưa trả lời, nộp bài ngay
    doSubmit();
  };
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    dispatch(updatePupilProfile({ id: pupilId, data: { language: lang } }));
    setShowLanguageDropdown(false);
  };
  const handleOutsidePress = () => {
    if (showLanguageDropdown) {
      setShowLanguageDropdown(false);
    }
  };
  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
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
    backContainer: {
      position: "absolute",
      left: 10,
      backgroundColor: theme.colors.backBackgound,
      marginLeft: 20,
      padding: 8,
      borderRadius: 50,
    },
    backIcon: { width: 24, height: 24 },
    title: {
      fontSize: 32,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    leftText: { marginHorizontal: 20, marginBottom: 10 },
    text: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
    ProgressBar: {
      height: 15,
      borderRadius: 20,
      elevation: 3,
      backgroundColor: theme.colors.progressBackground,
    },
    questionCard: {
      marginHorizontal: 20,
      padding: 16,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.white,
      marginBottom: 20,
      elevation: 3,
    },
    subjectText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      marginBottom: 4,
    },
    questionText: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      marginVertical: 8,
      textAlign: "center",
    },
    questionImage: {
      width: 200,
      height: 150,
      marginBottom: 10,
      alignSelf: "center",
      resizeMode: "contain",
      maxWidth: "100%",
      flexShrink: 1,
    },
    optionsContainer: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
    optionsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 10,
      gap: 10,
    },
    optionButton: {
      width: 140,
      minHeight: 50,
      padding: 10,
      dumplings: 10,
      elevation: 3,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.optionAnswerBackground,
    },
    optionText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      textAlign: "center",
    },
    selectedOption: {
      backgroundColor: theme.colors.optionSelected,
    },
    selectedOptionText: {
      color: theme.colors.selectedOptionText,
    },
    submitButton: {
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    },
    submitText: {
      color: theme.colors.white,
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.overlay,
      elevation: 3,
    },
    modalContent: {
      backgroundColor: theme.colors.white,
      padding: 30,
      borderRadius: 20,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 22,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    modalMessage: {
      fontSize: 18,
      marginTop: 10,
    },
    modalButton: {
      marginTop: 20,
      backgroundColor: theme.colors.green,
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 10,
    },
    modalButtonText: {
      color: theme.colors.white,
      fontSize: 16,
    },
    languageContainer: {
      position: "absolute",
      right: 10,
      backgroundColor: theme.colors.backBackgound,
      marginRight: 20,
      padding: 8,
      borderRadius: 50,
    },
    languageDropdown: {
      position: "absolute",
      top: 90,
      right: 20,
      backgroundColor: theme.colors.white,
      borderRadius: 10,
      width: 100,
      padding: 10,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 999,
    },
    languageOption: {
      paddingVertical: 10,
      width: "100%",
      alignItems: "center",
    },
    languageOptionText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    languageIcon: {
      width: 24,
      height: 24,
    },
    errorText: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.red,
      fontSize: 18,
      textAlign: "center",
    },
    loadingText: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
      fontSize: 18,
      textAlign: "center",
      marginTop: 20,
    },
  });
  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      {assessmentLoading ? (
        <Text style={styles.loadingText}>{t("loading")}</Text>
      ) : assessmentError ? (
        <Text style={styles.errorText}>
          {t("error")}:{" "}
          {typeof assessmentError === "object"
            ? assessmentError[i18n.language] || "Unknown error"
            : assessmentError}
        </Text>
      ) : (
        <>
          <LinearGradient
            colors={theme.colors.gradientBluePrimary}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={theme.icons.back}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text
              style={styles.title}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {t("assessment")}
            </Text>
            <TouchableOpacity
              ref={languageButtonRef}
              style={styles.languageContainer}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Image
                source={
                  i18n.language === "en"
                    ? theme.icons.languageEnglish
                    : theme.icons.languageVietnamese
                }
                style={styles.languageIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </LinearGradient>

          {showLanguageDropdown && (
            <View style={styles.languageDropdown}>
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => handleLanguageChange("en")}
              >
                <Text style={styles.languageOptionText}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => handleLanguageChange("vi")}
              >
                <Text style={styles.languageOptionText}>Tiếng Việt</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.leftText}>
            <Text style={styles.text}>
              {t("grade")}: {grade}
            </Text>
            <Text style={styles.text}>
              {t("answered")}: {Object.keys(selectedOptions).length}/
              {questions.length}
            </Text>
            <ProgressBar
              progress={Object.keys(selectedOptions).length / questions.length}
              color={theme.colors.green}
              style={styles.ProgressBar}
            />
          </View>

          <FlatList
            ref={flatListRef}
            data={questions}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.questionCard}>
                  <Text style={styles.subjectText}>
                    {t("question")} {index + 1}. {item.question}
                  </Text>
                  {item.image && (
                    <Image
                      source={item.image}
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  )}
                  <View style={styles.optionsContainer}>
                    <View style={styles.optionsRow}>
                      {item.options.slice(0, 2).map((opt, idx) => {
                        const isSelected = selectedOptions[item.id] === idx;
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => handleSelectOption(item.id, idx)}
                            style={[
                              styles.optionButton,
                              isSelected && styles.selectedOption,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.selectedOptionText,
                              ]}
                            >
                              {extractAnswerValue(opt, item.levelId)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={styles.optionsRow}>
                      {item.options.slice(2, 4).map((opt, idx) => {
                        const isSelected = selectedOptions[item.id] === idx + 2;
                        return (
                          <TouchableOpacity
                            key={idx + 2}
                            onPress={() => handleSelectOption(item.id, idx + 2)}
                            style={[
                              styles.optionButton,
                              isSelected && styles.selectedOption,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.selectedOptionText,
                              ]}
                            >
                              {extractAnswerValue(opt, item.levelId)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            }}
          />

          <TouchableOpacity onPress={handleSubmit}>
            <LinearGradient
              style={styles.submitButton}
              colors={theme.colors.gradientBlue}
            >
              <Text style={styles.submitText}>{t("submit")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Modal visible={showModal} transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {t("yourScore")}: {score}/10
                </Text>
                <Text style={styles.modalMessage}>
                  {t("correctAnswers")}: {correctCount} / {questions.length}
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowModal(false);
                    navigation.navigate("HomeScreen", { pupilId, grade });
                  }}
                >
                  <Text style={styles.modalButtonText}>{t("ok")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
      <MessageError
        visible={showError}
        title={errorContent.title}
        description={errorContent.description}
        onClose={() => setShowError(false)}
      />
      <MessageSuccess
        visible={showSuccess}
        title={successContent.title}
        description={successContent.description}
        onClose={() => {
          setShowSuccess(false);
        }}
      />
      <MessageWarning
        visible={showWarning}
        title={warningContent.title}
        description={warningContent.description}
        onCancel={warningContent.onCancel}
        onConfirm={warningContent.onConfirm}
        showCancelButton={warningContent.showCancelButton !== false}
      />
      <MessageConfirm
        visible={showConfirm}
        title={confirmContent.title}
        description={confirmContent.description}
        onConfirm={confirmContent.onConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </LinearGradient>
  );
}
