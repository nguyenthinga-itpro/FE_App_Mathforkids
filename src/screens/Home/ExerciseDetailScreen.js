import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
} from "react-native";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import FloatingMenu from "../../components/FloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getRandomExercises } from "../../redux/exerciseSlice";
import { getEnabledLevels } from "../../redux/levelSlice";
import {
  createCompletedExercise,
  clearError,
} from "../../redux/completedexerciseSlice";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";
import MessageConfirm from "../../components/MessageConfirm";
import MessageWarning from "../../components/MessangeWarning";

import FullScreenLoading from "../../components/FullScreenLoading";

export default function ExerciseScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { skillName, skillIcon, lessonId, levelIds, pupilId, title, grade } =
    route.params;
  // console.log("ExerciseScreen params:", route.params);

  const dispatch = useDispatch();
  const {
    exercises,
    loading: exerciseLoading,
    error: exerciseError,
  } = useSelector((state) => state.exercise);
  const {
    completedExercise,
    loading: completedLoading,
    error: completedError,
  } = useSelector((state) => state.completed_exercise);
  const { levels } = useSelector((state) => state.level);
  const { t, i18n } = useTranslation("exercise");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [shuffledOptions, setShuffledOptions] = useState({});
  const optionRefs = useRef({});
  const boxRefs = useRef({});
  const flyingAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [flyingValue, setFlyingValue] = useState(null);
  const [isFlying, setIsFlying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmContent, setConfirmContent] = useState({
    title: "",
    description: "",
  });
  const [showWarning, setShowWarning] = useState(false);
  const [warningContent, setWarningContent] = useState({
    title: "",
    description: "",
  });
  useEffect(() => {
    dispatch(getRandomExercises({ lessonId, levelIds }));
    dispatch(getEnabledLevels());
  }, [dispatch, lessonId, levelIds]);

  useEffect(() => {
    if (completedError) {
      setErrorContent({
        title: t("error"),
        description: completedError,
      });
      setShowError(true);
      dispatch(clearError());
    }
  }, [completedError, dispatch, t]);

  const questions = exercises.map((exercise, index) => ({
    id: exercise.id || index,
    type: "text",
    answer: exercise.answer?.[i18n.language],
    image: exercise.image ? { uri: exercise.image } : null,
    question: exercise.question?.[i18n.language] || "",
    options: exercise.option?.map((opt) => opt[i18n.language]) || [],
    level: exercise.levelId,
  }));

  const isExpression = (value, questionLevel) => {
    const questionLevelObj = levels.find(
      (level) => String(level.id) === String(questionLevel)
    );
    const isEasyLevel = questionLevelObj
      ? questionLevelObj.level === 1 || questionLevelObj.name.en === "Easy"
      : false;

    if (isEasyLevel && typeof value === "string" && value.includes("=")) {
      return value.split("=")[1].trim().length >= 6;
    }
    return typeof value === "string" && value.length >= 6;
  };

  const extractAnswerValue = (value, questionLevel) => {
    const questionLevelObj = levels.find(
      (level) => String(level.id) === String(questionLevel)
    );
    const isEasyLevel = questionLevelObj
      ? questionLevelObj.level === 1 || questionLevelObj.name.en === "Easy"
      : false;
    if (isEasyLevel && typeof value === "string" && value.includes("=")) {
      return value.split("=")[1].trim();
    }
    return value;
  };

  const handleSelect = (questionId, value, optionIndex, questionLevel) => {
    const optionRef = optionRefs.current[`q${questionId}-opt${optionIndex}`];
    const boxRef = boxRefs.current[`box${questionId}`];

    if (optionRef && boxRef) {
      optionRef.measure((fx, fy, width, height, px, py) => {
        boxRef.measure((bx, by, bWidth, bHeight, bpx, bpy) => {
          flyingAnim.setValue({
            x: px + width / 2 - 25,
            y: py + height / 2 - 25,
          });
          setFlyingValue(extractAnswerValue(value, questionLevel));
          setIsFlying(true);
          Animated.timing(flyingAnim, {
            toValue: { x: bpx + bWidth / 2 - 25, y: bpy + bHeight / 2 - 25 },
            duration: 800,
            useNativeDriver: true,
          }).start(() => {
            setSelectedAnswers((prev) => ({
              ...prev,
              [questionId]: extractAnswerValue(value, questionLevel),
            }));
            setIsFlying(false);
          });
        });
      });
    }
  };

  const shuffleArray = (array) =>
    array
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);

  const generateOptions = (question) => {
    if (shuffledOptions[question.id]) return shuffledOptions[question.id];
    const options = [...(question.options || []), question.answer].filter(
      Boolean
    );
    const shuffled = shuffleArray(options);
    setShuffledOptions((prev) => ({ ...prev, [question.id]: shuffled }));
    return shuffled;
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let rawScore = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      const questionLevelObj = levels.find(
        (level) => String(level.id) === String(q.level)
      );
      const questionLevel = questionLevelObj ? questionLevelObj.level : 1;
      maxScore += questionLevel;

      const selected = selectedAnswers[q.id];
      if (selected && selected === extractAnswerValue(q.answer, q.level)) {
        correct++;
        rawScore += questionLevel;
      } else {
        wrong++;
      }
    });

    const score = maxScore > 0 ? (rawScore / maxScore) * 10 : 0;
    return { correct, wrong, score: Math.round(score) };
  };

  const getGradient = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
  };

  const getOptionBackground = () => {
    if (skillName === "Addition") return theme.colors.greenLight;
    if (skillName === "Subtraction") return theme.colors.purpleLight;
    if (skillName === "Multiplication") return theme.colors.orangeLight;
    if (skillName === "Division") return theme.colors.redLight;
    return theme.colors.gradientPink;
  };

  const shouldUseSingleRow = (options, questionLevel) =>
    options.every((opt) => extractAnswerValue(opt, questionLevel).length <= 5);

  const handleSubmit = async () => {
    if (!pupilId) {
      setErrorContent({
        title: t("error"),
        description: t("pupilIdMissing"),
      });
      setShowError(true);
      return;
    }
    // Check if all questions are answered
    const unansweredQuestions = questions.some((q) => !selectedAnswers[q.id]);
    if (unansweredQuestions) {
      setWarningContent({
        title: t("warning"),
        description: t("pleaseAnswerAllQuestions"),
        onCancel: () => setShowWarning(false), // Continue answering
        onConfirm: () => setShowWarning(false), // Submit anyway
        // showCancelButton: true, // Show both buttons
      });
      setShowWarning(true);
      return;
    }
    // Show confirmation popup
    setConfirmContent({
      title: t("confirmSubmission"),
      description: t("confirmSubmissionMessage"),
      onConfirm: handleConfirmSubmit,
    });
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    const { correct, wrong, score } = calculateResults();
    try {
      await dispatch(
        createCompletedExercise({
          pupilId,
          lessonId,
          levelId: levelIds,
          point: score,
        })
      ).unwrap();
      navigation.navigate("ExerciseResultScreen", {
        skillName,
        answers: selectedAnswers,
        questions,
        score,
        correctCount: correct,
        wrongCount: wrong,
        lessonId,
        levelIds,
        pupilId,
        title,
        grade,
        skillIcon: skillIcon,
      });
    } catch (err) {
      setErrorContent({
        title: t("error"),
        description: t("failedToSubmitExercise"),
      });
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackConfirm = () => {
    setShowConfirm(false);
    navigation.goBack();
  };

  const renderOption = (questionId, value, optIndex, style, questionLevel) => {
    if (
      selectedAnswers[questionId] === extractAnswerValue(value, questionLevel)
    )
      return null;
    const optionStyle = [
      styles.option,
      style,
      isExpression(value, questionLevel) && { borderRadius: 10, paddingHorizontal: 20 },
    ];
    return (
      <TouchableOpacity
        key={`q${questionId}-opt${optIndex}`}
        style={optionStyle}
        ref={(ref) =>
          (optionRefs.current[`q${questionId}-opt${optIndex}`] = ref)
        }
        onPress={() => handleSelect(questionId, value, optIndex, questionLevel)}
      >
        <Text style={styles.optionText}>
          {extractAnswerValue(value, questionLevel)}
        </Text>
      </TouchableOpacity>
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
      fontSize: 32,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
      width: "60%",
      textAlign: "center",
    },
    requestContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      alignItems: "center",
    },
    soundOnIcon: {
      width: 40,
      height: 40,
    },
    requestText: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
      fontSize: 18,
    },
    questionContainer: {
      marginBottom: 15, // Giảm khoảng cách
      paddingHorizontal: 10, // Giảm padding
    },
    questionImageContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    questionImage: {
      backgroundColor: "#fff",
      borderRadius: 10,
      width: 150,
      height: 100,
      resizeMode: "contain",
    },
    question: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
      fontSize: 36,
      maxWidth: "50%",
    },
    selectedContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    optionsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 5,
      flexWrap: "wrap",
    },
    optionsContainer: {
      marginTop: 10,
    },
    option: {
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: getOptionBackground(),
      elevation: 3,
      paddingHorizontal: 10,
      paddingVertical: 10,
      minWidth: 50,
      minHeight: 50,
      marginTop: 10,
    },
    optionText: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
      fontSize: 18,
    },
    selectedAnswerBox: {
      width: 80,
      height: 80,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: getOptionBackground(),
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
    },
    selectedAnswerTextContainer: {
      backgroundColor: getOptionBackground(),
      borderRadius: 10,
      elevation: 3,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 70,
      minHeight: 70,
    },
    selectedAnswerText: {
      textAlign: "center",
      fontSize: 24,
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_BOLD,
    },
    selectedAnswerImage: {
      width: 70,
      height: 70,
      resizeMode: "contain",
    },
    questionText: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.text,
      fontSize: 16,
      marginTop: 10,
      marginBottom: 5,
    },
    questionText1: {
      fontFamily: Fonts.NUNITO_BLACK,
      fontSize: 16,
      marginTop: 10,
      marginBottom: 5,
    },
    submitButton: {
      marginTop: 20,
      paddingHorizontal: 40,
      paddingVertical: 10,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    },
    submitText: {
      color: theme.colors.white,
      fontSize: 18,
      fontFamily: Fonts.NUNITO_BOLD,
      textAlign: "center",
    },
    isFlying: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: getOptionBackground(),
      elevation: 3,
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
    <View style={styles.container}>
      <LinearGradient colors={getGradient()} style={styles.header}>
        <TouchableOpacity
          // onPress={() => navigation.goBack()}
          onPress={() => {
            setConfirmContent({
              title: t("confirm"),
              description: t("wantToSkipTest"),
              onConfirm: handleBackConfirm,
            });
            setShowConfirm(true);
          }}
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
          {title[i18n.language]}
        </Text>
      </LinearGradient>
      <ScrollView>
        <View style={styles.requestContainer}>
          <Image source={theme.icons.soundOn} style={styles.soundOnIcon} />
          <Text style={styles.requestText}>{t("chooseCorrectAnswer")}</Text>
        </View>
        {exerciseLoading ? (
          <FullScreenLoading visible={exerciseLoading} color={theme.colors.white} />
        ) : exerciseError ? (
          <View style={styles.container}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {questions.map((q, ind) => {
              const options = generateOptions(q);
              const useSingleRow = shouldUseSingleRow(options, q.level);
              return (
                <View key={q.id} style={styles.questionContainer}>
                  <Text style={styles.questionText}>
                    <Text style={styles.questionText1}>
                      {t("question")} {ind + 1}:
                    </Text>{' '}
                    {q.question}
                  </Text>
                  <View style={styles.questionImageContainer}>
                    {q.image && (
                      <Image style={styles.questionImage} source={q.image} />
                    )}

                    <View style={styles.selectedContainer}>
                      <View
                        style={styles.selectedAnswerBox}
                        ref={(ref) => (boxRefs.current[`box${q.id}`] = ref)}
                      >
                        {selectedAnswers[q.id] !== undefined && (
                          <View style={styles.selectedAnswerTextContainer}>
                            <Text style={styles.selectedAnswerText}>
                              {selectedAnswers[q.id]}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.optionsContainer}>
                    {useSingleRow ? (
                      <View
                        style={[
                          styles.optionsRow,
                          { justifyContent: "space-around" },
                        ]}
                      >
                        {options.map((val, optIndex) =>
                          renderOption(
                            q.id,
                            val,
                            optIndex,
                            {
                              ...(isExpression(val, q.level) && {
                                paddingHorizontal: 20,
                                borderRadius: 10,
                                width: 150,
                              }),
                            },
                            q.level
                          )
                        )}
                      </View>
                    ) : (
                      <>
                        <View
                          style={[
                            styles.optionsRow,
                            { justifyContent: "space-around" },
                          ]}
                        >
                          {options
                            .slice(0, Math.ceil(options.length / 2))
                            .map((val, optIndex) =>
                              renderOption(
                                q.id,
                                val,
                                optIndex,
                                {
                                  ...(isExpression(val, q.level) && {
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                    width: 150,
                                  }),
                                },
                                q.level
                              )
                            )}
                        </View>
                        <View
                          style={[
                            styles.optionsRow,
                            { justifyContent: "space-around" },
                          ]}
                        >
                          {options
                            .slice(Math.ceil(options.length / 2))
                            .map((val, optIndex) =>
                              renderOption(
                                q.id,
                                val,
                                optIndex + Math.ceil(options.length / 2),
                                {
                                  ...(isExpression(val, q.level) && {
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                    width: 150,
                                  }),
                                },
                                q.level
                              )
                            )}
                        </View>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
      <LinearGradient colors={getGradient()} style={styles.submitButton}>
        <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitText}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
      {isFlying && (
        <Animated.View
          style={[
            styles.isFlying,
            { transform: flyingAnim.getTranslateTransform() },
            isExpression(flyingValue, questions.find(q => q.id === parseInt(flyingValue))?.level) && {
              paddingHorizontal: 10,
              borderRadius: 10,
            },
          ]}
        >
          <Text style={styles.optionText}>{flyingValue}</Text>
        </Animated.View>
      )}
      <FloatingMenu />
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
        onClose={() => setShowSuccess(false)}
      />
      <MessageWarning
        visible={showWarning}
        title={warningContent.title}
        description={warningContent.description}
        onCancel={warningContent.onCancel}
        onConfirm={() => {
          setShowWarning(false);
          handleConfirmSubmit();
        }}
        showCancelButton={warningContent.showCancelButton !== false}
      />
      <MessageConfirm
        visible={showConfirm}
        title={confirmContent.title}
        description={confirmContent.description}
        onCancel={() => setShowConfirm(false)}
        onClose={confirmContent.onConfirm}
      />
    </View>
  );
}