import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  getRandomTests,
  createTest,
  createMultipleTestQuestions,
} from "../../redux/testSlice";
import { updatePupilProfile, pupilById } from "../../redux/profileSlice";
import { completeAndUnlockNextLesson } from "../../redux/completedLessonSlice";
import { getEnabledLevels } from "../../redux/levelSlice";
import { Svg, Circle } from "react-native-svg";
import {
  getGoalsWithin30Days,
  autoMarkCompletedGoals,
} from "../../redux/goalSlice";
import FullScreenLoading from "../../components/FullScreenLoading";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";
import MessageConfirm from "../../components/MessageConfirm";
import MessageWarning from "../../components/MessangeWarning";
export default function TestScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("test");
  const { skillName, lessonId, pupilId, levelIds, skillIcon } = route.params;
  // console.log("levelIds", levelIds);
  const dispatch = useDispatch();
  const { tests, loading, error } = useSelector((state) => state.test);
  const pupil = useSelector((state) => state.profile.info);
  const { levels } = useSelector((state) => state.level);
  const windowWidth = Dimensions.get("window").width;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const bearPosition = useRef(new Animated.Value(20)).current;
  const bearRotate = useRef(new Animated.Value(0)).current;
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [shuffledOptions, setShuffledOptions] = useState({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [nextLessonName, setNextLessonName] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const validTests = tests.filter((item) => item.question && item.answer);
  const totalQuestions = validTests.length;
  const currentQ = validTests[currentQuestion - 1];
  const [fromTimeUp, setFromTimeUp] = useState(false);

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
  // Hàm reset tất cả trạng thái
  const resetTestState = () => {
    setUserAnswers({});
    setShuffledOptions({});
    setNextLessonName(null);
    setCurrentQuestion(1);
    setFinalScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setElapsedTime(0);
  };

  // Reset trạng thái khi lessonId thay đổi hoặc bắt đầu bài kiểm tra mới
  useEffect(() => {
    // resetTestState();
    dispatch(getRandomTests({ lessonId }));
    dispatch(getEnabledLevels());
    dispatch(updatePupilProfile({ id: pupilId }));
    if (pupilId) {
      dispatch(pupilById(pupilId));
    }
  }, [dispatch, lessonId, pupilId]);

  // Timer logic
  useEffect(() => {
    if (!validTests.length || showResultModal) return;
    const totalSeconds = (validTests.length > 20 ? 35 : validTests.length > 10 ? 25 : 10) * 60;
    setTimer(totalSeconds);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        if (prev === 60) {
          setWarningContent({
            title: t("warning"),
            description: t("timeAlmostUp"),
            onConfirm: () => setShowWarning(false),
            showCancelButton: false,
          });
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [validTests.length, t, showResultModal]);

  // Shuffle options with unique IDs
  useEffect(() => {
    if (!currentQ || !validTests.length) return;
    if (!shuffledOptions[currentQ.id]) {
      const options = [...(currentQ.option || []), currentQ.answer]
        .map((option, index) => ({
          value: option,
          id: `${currentQ.id}-option-${index}`,
          levelId: currentQ.levelId || currentQ.level,
        }))
        .sort(() => Math.random() - 0.5);
      setShuffledOptions((prev) => ({
        ...prev,
        [currentQ.id]: options,
      }));
    }
  }, [currentQ, validTests.length]);

  // Progress bar animation
  useEffect(() => {
    if (!validTests.length || showResultModal) return;
    const totalMargin = (validTests.length - 1) * 2;
    const progressBarWidth = windowWidth - 40;
    const segmentWidth = (progressBarWidth - totalMargin) / validTests.length;
    const iconPositionX = 20 + (currentQuestion - 1) * (segmentWidth + 2);

    Animated.parallel([
      Animated.spring(bearPosition, {
        toValue: iconPositionX,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(bearRotate, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bearRotate, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bearRotate, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentQuestion, validTests.length, showResultModal]);

  const extractAnswerValue = (value, questionLevel) => {
    if (value === undefined || value === null) return "";
    let result = value;
    if (typeof value === "object" && value?.[i18n.language]) {
      result = value[i18n.language];
    }
    const questionLevelObj = levels.find(
      (level) => String(level.id) === String(questionLevel)
    );
    const isEasyLevel = questionLevelObj ? questionLevelObj.level === 1 : false;
    if (isEasyLevel && typeof result === "string" && result.includes("=")) {
      result = result.split("=")[1].trim();
    }
    return typeof result === "string" ? result.trim().toLowerCase() : result;
  };

  const handleAnswer = (val, levelId) => {
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        processed: extractAnswerValue(val, levelId), // For comparison and display
        original: val, // Store the original value
      },
    }));
    if (currentQuestion < validTests.length) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  useEffect(() => {
    if (validTests.length > 0 && currentQuestion > validTests.length) {
      setCurrentQuestion(1);
    }
  }, [validTests.length, currentQuestion]);

  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!validTests.length) {
      return { score: 0, correct: 0, wrong: 0 };
    }
    let rawScore = 0;
    let maxScore = 0;
    let correct = 0;
    let wrong = 0;

    validTests.forEach((q) => {
      const questionLevelObj = levels.find(
        (level) => String(level.id) === String(q.levelId || q.level)
      );
      const questionLevel = questionLevelObj ? questionLevelObj.level : 1;
      maxScore += questionLevel;

      const userAnswer = userAnswers[q.id]?.processed;
      const correctAnswer = extractAnswerValue(q.answer, q.levelId);
      console.log(`Question ID: ${q.id}, User Answer: ${userAnswer}, Correct Answer: ${correctAnswer}`);

      if (
        userAnswer !== undefined &&
        String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
      ) {
        rawScore += questionLevel;
        correct++;
      } else if (userAnswer !== undefined) {
        wrong++;
      }
    });

    const score = maxScore > 0 ? (rawScore / maxScore) * 10 : 0;
    console.log(`Final Score: ${score}, Correct: ${correct}, Wrong: ${wrong}`);
    return { score: Math.round(score), correct, wrong };
  };

  const calculateBonusPoint = (score) => {
    if (score >= 9) return 5;
    if (score >= 7 && score <= 8) return 3;
    if (score > 5) return 1;
    return 0;
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(userAnswers).length;
    const totalTime =
      (validTests.length > 20 ? 35 : validTests.length > 10 ? 25 : 10) * 60;

    clearInterval(timerRef.current);

    const { score, correct, wrong } = calculateScore();
    setFinalScore(score);
    setCorrectCount(correct);
    setWrongCount(wrong);
    const bonus = calculateBonusPoint(score);
    const currentPoint = pupil?.point || 0;
    const newPoint = currentPoint + bonus;

    const doSubmit = async () => {
      try {
        const usedTime = totalTime - timer;
        const actualElapsedTime = Math.max(0, usedTime);
        setElapsedTime(actualElapsedTime);

        const testPayload = {
          pupilId,
          lessonId,
          point: score,
          duration: usedTime,
        };

        const testResult = await dispatch(createTest(testPayload)).unwrap();
        const testId = testResult?.message?.id;

        if (testId) {
          const questionPayloads = validTests.map((question) => ({
            testId,
            exerciseId: question.id,
            levelId: question.levelId || question.level,
            question: question.question,
            image: question.image || null,
            option: question.option || [],
            correctAnswer: question.answer,
            selectedAnswer: userAnswers[question.id]?.original || null,
          }));
          await dispatch(createMultipleTestQuestions(questionPayloads)).unwrap();
        }

        await dispatch(getGoalsWithin30Days(pupilId));
        setShowResultModal(true);

        if (bonus > 0) {
          dispatch(updatePupilProfile({ id: pupilId, data: { point: newPoint } }));
        }

        if (score >= 9) {
          let exercise = levelIds ? levelIds.join(",") : null; // Check if levelIds exists
          let unlockResult = await dispatch(
            completeAndUnlockNextLesson({ pupilId, lessonId })
          ).unwrap();
          if (exercise !== null) {
            const res = await dispatch(
              autoMarkCompletedGoals({ pupilId, lessonId, exercise })
            );

            if (res.payload?.message?.[i18n.language]) {
              setSuccessContent({
                title: t("success"),
                description: res.payload.message[i18n.language],
              });
              setShowSuccess(true);
            } else if (res.error?.message?.[i18n.language]) {
              setErrorContent({
                title: t("error"),
                description: res.error.message[i18n.language],
              });
              setShowError(true);
            }
          }
          setNextLessonName(unlockResult?.nextLessonName?.[i18n.language] || null);
        }

      } catch (error) {
        setErrorContent({
          title: t("error"),
          description: t("submissionFailed"),
        });
        setShowError(true);
      }
    };

    // 👇 Điều kiện hiện cảnh báo (nếu không phải do hết giờ)
    if (!fromTimeUp && answeredCount < validTests.length && timer > 0) {
      setWarningContent({
        title: t("warning"),
        description: t("youHaveAnswered"),
        onCancel: () => {
          clearInterval(timerRef.current); // ✅ clear để tránh đè timer
          timerRef.current = setInterval(() => {
            setTimer((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current);
                handleTimeUp();
                return 0;
              }
              if (prev === 60) {
                setWarningContent({
                  title: t("warning"),
                  description: t("timeAlmostUp"),
                  onConfirm: () => setShowWarning(false),
                  showCancelButton: false,
                });
                setShowWarning(true);
              }
              return prev - 1;
            });
          }, 1000);
          setShowWarning(false);
        },
        onConfirm: async () => {
          setShowWarning(false);
          await doSubmit();
        },
      });
      setShowWarning(true);
    } else {
      setFromTimeUp(false);
      await doSubmit();
    }
  };
  const handleTimeUp = () => {
    setFromTimeUp(true);
    setWarningContent({
      title: t("warning"),
      description: t("timeEnd"),
      onConfirm: async () => {
        setShowWarning(false);
        await handleSubmit();
      },
      showCancelButton: false,
    });
    setShowWarning(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const progress = Math.min(
    Math.max(
      timer /
      ((validTests.length > 20 ? 30 : validTests.length > 10 ? 20 : 10) * 60),
      0
    ),
    1
  );
  const strokeDashoffset = 2 * Math.PI * 25 * (1 - progress);

  const getGradient = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
  };

  const getProgressBackground = () => {
    if (skillName === "Addition") return theme.colors.GreenLight;
    if (skillName === "Subtraction") return theme.colors.purpleLight;
    if (skillName === "Multiplication") return theme.colors.orangeLight;
    if (skillName === "Division") return theme.colors.redLight;
    return theme.colors.pinkLight;
  };

  const visualProgressBar = () => {
    if (skillName === "Addition") return theme.colors.GreenDark;
    if (skillName === "Subtraction") return theme.colors.purpleDark;
    if (skillName === "Multiplication") return theme.colors.orangeDark;
    if (skillName === "Division") return theme.colors.redDark;
    return theme.colors.pinkDark;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    skillsContainer: {
      paddingBottom: 80,
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
    },
    backButton: {
      position: "absolute",
      top: 50,
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
      marginTop: 20,
      fontSize: 32,
      fontFamily: Fonts.NUNITO_EXTRA_BOLD,
      color: theme.colors.white,
      width: "60%",
      textAlign: "center",
    },
    subtitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 20,
    },
    subtitleText: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
    },
    visualProgressBar: {
      marginHorizontal: 20,
      height: 20,
      backgroundColor: getProgressBackground(),
      borderRadius: 10,
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      elevation: 3,
    },
    segmentBlock: {
      flex: 1,
      marginHorizontal: 1,
      height: "100%",
      borderRadius: 2,
    },
    bearIconWrapper: {
      position: "absolute",
      top: -25,
      left: -5,
      elevation: 3,
    },
    bearIcon: {
      width: 25,
      height: 25,
    },
    timerCircleContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 60,
      height: 60,
      alignSelf: "center",
      marginVertical: 20,
      elevation: 3,
    },
    timerTextOverlay: {
      position: "absolute",
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
      fontSize: 14,
    },
    questionContent: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      gap: 10,
    },
    question: {
      fontSize: 20,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    questionImage: {
      backgroundColor: "#fff",
      width: 300,
      height: 150,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: visualProgressBar(),
    },
    backQuestion: {
      marginVertical: 20,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: theme.colors.white,
      backgroundColor: visualProgressBar(),
      borderRadius: 50,
      padding: 10,
      elevation: 3,
      marginLeft: 20,
    },
    answerOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      paddingHorizontal: 20,
      width: "100%",
      gap: 20,
    },
    answerButton: {
      backgroundColor: visualProgressBar(),
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      elevation: 3,
      minWidth: (windowWidth - 60) / 2,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    answerSelectedButton: {
      backgroundColor: getProgressBackground(),
    },
    answerText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      fontSize: 18,
      textAlign: "center",
    },
    answerImage: {
      width: 50,
      height: 50,
      borderRadius: 10,
      alignSelf: "center",
    },
    submitButtonContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    submitButton: {
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.overlay,
    },
    modalCardContainer: {
      backgroundColor: visualProgressBar(),
      width: "80%",
      height: "auto",
      borderRadius: 10,
      justifyContent: "center",
      elevation: 3,
    },
    modalTitleText: {
      color: theme.colors.white,
      fontSize: 28,
      fontFamily: Fonts.NUNITO_BOLD,
      textAlign: "center",
    },
    modalTextContainer: {
      marginTop: 10,
    },
    modalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
      paddingHorizontal: 20,
      minHeight: 30,
    },
    modalText: {
      fontSize: 20,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.black,
    },
    modalResultText: {
      fontSize: 20,
      textAlign: "right",
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
      flexShrink: 1,
      flexWrap: "wrap",
      maxWidth: "60%",
    },
    closeIcon: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 10,
      borderWidth: 1,
      borderColor: theme.colors.white,
      borderRadius: 50,
    },
    loadingText: {
      fontSize: 18,
      textAlign: "center",
      color: theme.colors.text,
      marginTop: 20,
    },
    errorText: {
      fontSize: 18,
      textAlign: "center",
      color: theme.colors.error,
      marginTop: 20,
    },
  });

  const options = currentQ && currentQ.id ? shuffledOptions[currentQ.id] || [] : [];

  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradient()} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setConfirmContent({
              title: t("confirm"),
              description: t("wantToSkipTest"),
              onConfirm: () => {
                resetTestState();
                setShowConfirm(false);
                navigation.goBack();
              },
            });
            setShowConfirm(true);
          }}
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text
          style={styles.headerText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {t("exercise")}
        </Text>
      </LinearGradient>
      {loading ? (
        <View style={styles.container}>
          <Text style={styles.loadingText}>{t("loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : validTests.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.errorText}>{t("noExercisesFound")}</Text>
        </View>
      ) : !currentQ ? (
        <View style={styles.container}>
          <Text style={styles.errorText}>{t("noQuestionAvailable")}</Text>
        </View>
      ) : (
        <>
          <View style={styles.subtitleContainer}>
            <View>
              <Text style={styles.subtitleText}>
                {t("totalQuestions")}: {totalQuestions}
              </Text>
              <Text style={styles.subtitleText}>
                {t("answers")}: {currentQuestion}/{totalQuestions}
              </Text>
            </View>
            <View style={styles.timerCircleContainer}>
              <Svg width={60} height={60}>
                <Circle
                  cx={30}
                  cy={30}
                  r={25}
                  stroke={theme.colors.graySoft}
                  strokeWidth={10}
                  fill="none"
                />
                <Circle
                  cx={30}
                  cy={30}
                  r={25}
                  stroke={getProgressBackground()}
                  strokeWidth={10}
                  strokeDasharray={2 * Math.PI * 25}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  rotation={-90}
                  origin="30, 30"
                />
              </Svg>
              <Text style={styles.timerTextOverlay}>{formatTime(timer)}</Text>
            </View>
          </View>
          <View>
            <View style={styles.visualProgressBar}>
              {validTests.map((q, index) => (
                <View
                  key={q.id ?? `segment-${index}`}
                  style={[
                    styles.segmentBlock,
                    {
                      backgroundColor:
                        index <= currentQuestion - 1
                          ? visualProgressBar()
                          : theme.colors.progressTestBackground,
                    },
                  ]}
                />
              ))}
            </View>
            <Animated.View
              style={[
                styles.bearIconWrapper,
                {
                  transform: [
                    { translateX: bearPosition },
                    {
                      rotate: bearRotate.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: ["-10deg", "0deg", "10deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={theme.icons.test} style={styles.bearIcon} />
            </Animated.View >
          </View >
          <ScrollView contentContainerStyle={styles.skillsContainer}>
            <View>
              <View style={styles.questionContent}>
                {currentQ.question?.[i18n.language] && (
                  <Text
                    style={styles.question}
                    numberOfLines={5}
                    adjustsFontSizeToFit
                    minimumFontScale={0.1}
                  >
                    {currentQ.question?.[i18n.language]}
                  </Text>
                )}
                {currentQ.image && (
                  <Image
                    source={{ uri: currentQ.image }}
                    style={styles.questionImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleBack()}
              style={styles.backQuestion}
            >
              <Ionicons name="play-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.answerOptions}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.answerButton,
                    userAnswers[currentQ.id]?.processed === extractAnswerValue(option.value, option.levelId)
                      ? styles.answerSelectedButton
                      : null,
                  ]}
                  onPress={() => handleAnswer(option.value, option.levelId)}
                >
                  <Text style={styles.answerText}>
                    {extractAnswerValue(option.value?.[i18n.language], option.levelId)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.submitButtonContainer}>
            <LinearGradient
              colors={getGradient()}
              style={styles.submitButton}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            >
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.submitText}>{t("submit")}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      )
      }
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalCardContainer}>
            <Text style={styles.modalTitleText}>{t("result")}</Text>
            <View style={styles.modalTextContainer}>
              <View style={styles.modalRow}>
                <Text style={styles.modalText}>{t("score")}:</Text>
                <Text style={styles.modalResultText}>{finalScore}/10</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalText}>{t("correct")}:</Text>
                <Text style={styles.modalResultText}>{correctCount}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalText}>{t("wrong")}:</Text>
                <Text style={styles.modalResultText}>{wrongCount}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalText}>{t("time")}:</Text>
                <Text style={styles.modalResultText}>
                  {formatTime(elapsedTime)}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalText}>{t("bonusPoints")}:</Text>
                <Text style={styles.modalResultText}>{calculateBonusPoint(finalScore)}</Text>
              </View>
              {nextLessonName && (
                <>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalText}>{t("nextLesson")}:</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={[styles.modalResultText, { maxWidth: "100%", textAlign: "left" }]}>
                      {nextLessonName}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => {
                setShowResultModal(false);
                resetTestState(); // Reset trạng thái khi đóng modal
                navigation.goBack();
              }}
            >
              <Ionicons name="close" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <FullScreenLoading visible={loading} color={theme.colors.white} />
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
        onClose={() => navigation.goBack()}
      />
    </View >
  );
}