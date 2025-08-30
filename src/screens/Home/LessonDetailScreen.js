import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Image,
} from "react-native";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import FloatingMenu from "../../components/FloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import { getEnabledByLesson } from "../../redux/lessonDetailSlice";
import { getLessonById } from "../../redux/lessonSlice";
import { useTranslation } from "react-i18next";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import swipeGifLeft from "../../../assets/animations/swipe.gif/1.json";
import swipeGifRight from "../../../assets/animations/swipe.gif/2.json";
import { useWindowDimensions } from "react-native";
import FullScreenLoading from "../../components/FullScreenLoading";
import AutoHeightWebView from "react-native-autoheight-webview";

export default function LessonDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { skillName, lessonId, grade } = route.params;
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation("lesson");
  const { width } = useWindowDimensions();
  const screenWidth = Dimensions.get("window").width;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const position = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const enabledList = useSelector((state) => state.lessonDetail.enabledList);
  const loading = useSelector((state) => state.lessonDetail.loading);
  // console.log("enabledList", enabledList);
  const [lessonName, setLessonName] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [autoNumber1, setAutoNumber1] = useState("");
  const [autoNumber2, setAutoNumber2] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const getOperatorFromSkillName = (skill) => {
    const normalizedSkill = skill?.toLowerCase(); // Chuẩn hóa skillName để tránh lỗi viết hoa
    switch (normalizedSkill) {
      case "addition":
        return "+";
      case "subtraction":
        return "-";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        console.warn(`Unknown skillName: ${skill}, defaulting to '+'`);
        return "+";
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    let cleanText = html
      .replace(/<[^>]+>/g, "") // Loại bỏ thẻ HTML
      .replace(/&nbsp;/g, " ") // Thay &nbsp; bằng khoảng trắng
      .replace(/\s+/g, " ") // Chuẩn hóa nhiều khoảng trắng thành một khoảng
      .trim();

    // Thay thế ký hiệu toán học tùy theo ngôn ngữ
    const isVietnamese = i18n.language === "vi";
    cleanText = cleanText
      .replace(/\+/g, isVietnamese ? " cộng " : " plus ")
      .replace(/-/g, isVietnamese ? " trừ " : " minus ")
      .replace(/×/g, isVietnamese ? " nhân " : " times ")
      .replace(/÷/g, isVietnamese ? " chia " : " divided by ")
      .replace(/=/g, isVietnamese ? " bằng " : " equals ");

    return cleanText;
  };
  const speakWithPauses = (text, language) => {
    // Tách dựa trên mẫu phép tính
    const lines = text.split(/(\d+\s*[-+×÷]\s*\d+\s*=)\s*(\d+)/).filter(line => line.trim() !== "");
    let index = 0;

    const speakNext = () => {
      if (index < lines.length) {
        const cleanLine = stripHtml(lines[index]);
        console.log("Speaking line:", cleanLine);
        Speech.speak(cleanLine, {
          language: language === "vi" ? "vi-VN" : "en-US",
          onDone: () => {
            setTimeout(() => {
              index++;
              speakNext();
            }, 500);
          },
        });
      }
    };

    speakNext();
  };
  // console.log("gradeLeson", grade);
  // console.log("autoNumber2", autoNumber2);
  // console.log("getOperatorFromSkillName", getOperatorFromSkillName);
  useFocusEffect(
    useCallback(() => {
      if (lessonId) {
        dispatch(getLessonById(lessonId)).then((res) => {
          const data = res.payload;
          setLessonName(data?.name?.[i18n.language] || data?.name?.en || "");
        });
        dispatch(getEnabledByLesson(lessonId));
      }
    }, [lessonId, i18n.language])
  );

  useEffect(() => {
    setShowSwipeHint(true);
    const timeout = setTimeout(() => setShowSwipeHint(false), 4000);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        Speech.stop();
      };
    }, [])
  );

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    const found = enabledList?.find((item) => item.order === currentIndex + 1);
    const contentText = found?.content?.[i18n.language] || "";
    setContent(contentText);
    setImageUrl(found?.image || null);
    setCurrentOrder(found?.order || null);

    const lines = contentText.split("\n");
    const firstExampleLine = lines.find((line) =>
      /(\d+)\s*[\+\-\×\÷]\s*(\d+)/.test(line)
    );
    if (firstExampleLine) {
      const match = firstExampleLine.match(/(\d+)\s*[\+\-\×\÷]\s*(\d+)/);
      if (match) {
        setAutoNumber1(match[1]);
        setAutoNumber2(match[2]);
      }
    }
  }, [currentIndex, enabledList, i18n.language]);

  const tabTitles = useMemo(() => {
    return Array.isArray(enabledList)
      ? enabledList
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) => item.title?.[i18n.language] || "")
      : [];
  }, [enabledList, i18n.language]);

  const handleSwipe = (direction) => {
    const maxIndex = enabledList.length - 1;
    const indexNow = currentIndexRef.current;
    if (isAnimating.current) return;

    const newIndex =
      direction === "left" && indexNow < maxIndex
        ? indexNow + 1
        : direction === "right" && indexNow > 0
          ? indexNow - 1
          : null;

    if (newIndex === null) return;

    isAnimating.current = true;
    Animated.timing(position, {
      toValue: direction === "left" ? -screenWidth : screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(newIndex);
      position.setValue(direction === "left" ? screenWidth : -screenWidth);
      Animated.timing(position, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 30,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -100) handleSwipe("left");
        else if (gesture.dx > 100) handleSwipe("right");
      },
    })
  ).current;

  const getGradient = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
  };

  const getCardBackground = () => {
    if (skillName === "Addition") return theme.colors.GreenLight;
    if (skillName === "Subtraction") return theme.colors.purpleLight;
    if (skillName === "Multiplication") return theme.colors.orangeLight;
    if (skillName === "Division") return theme.colors.redLight;
    return theme.colors.pinkLight;
  };
  // console.log("dịch:", t("go_to_step_by_step"));

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
      fontFamily: Fonts.NUNITO_EXTRA_BOLD,
      color: theme.colors.white,
      width: "60%",
      textAlign: "center",
    },
    soundContainer: {
      width: 40,
      alignItems: "center",
      paddingVertical: 5,
      borderRadius: 50,
      elevation: 3,
      marginLeft: 20,
    },
    swipeHintContainer: {
      marginBottom: 10,
      position: "absolute",
      top: 200,
      elevation: 20,
      left: 60,
    },
    swipeHintImage: {
      width: 200,
      height: 200,
    },
    swipeHintTextContainer: {
      backgroundColor: theme.colors.cardBackground,
      elevation: 20,
      borderRadius: 40,
    },
    swipeHintText: {
      color: theme.colors.text,
      fontSize: 13,
      fontFamily: Fonts.NUNITO_MEDIUM,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    cardLesson: {
      paddingHorizontal: 20,
      paddingTop: 40,
      backgroundColor: getCardBackground(),
      borderRadius: 40,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 40,
      elevation: 3,
      minHeight: 250,
      maxHeight: 400,
    },
    lessonTextListContainer: {
      minHeight: 300,
      color: theme.colors.text
    },
    lessonTextList: {
      fontSize: 20,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      paddingBottom: 80,
    },
    lessonTitleTextList: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      fontSize: 22,
    },
    linkButton: {
      marginTop: 30,
      alignSelf: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
    },
    linkTextContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: -90,
      left: 120,
      fontSize: 16,
    },
    linkText: {
      width: "70%",
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.blueDark,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.blueDark,
    },
    imageContainer: { alignItems: "center", marginBottom: 16 },
    image: { width: 200, height: 200, resizeMode: "contain", borderRadius: 12 },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradient()} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
          {lessonName}
        </Text>
      </LinearGradient>
      <LinearGradient colors={getGradient()} style={styles.soundContainer}>
        <TouchableOpacity
          onPress={() => {
            if (content) {
              speakWithPauses(content, i18n.language); // Gọi hàm đọc có dừng
            }
          }}
        >
          <Ionicons name="volume-medium" size={28} color={theme.colors.white} />
        </TouchableOpacity>
      </LinearGradient>
      {showSwipeHint && currentOrder !== 2 && (
        <View style={styles.swipeHintContainer}>
          <LottieView
            source={currentOrder === 3 ? swipeGifRight : swipeGifLeft}
            autoPlay
            loop
            style={styles.swipeHintImage}
          />
          <View style={styles.swipeHintTextContainer}>
            <Text style={styles.swipeHintText}>{t("swipe_hint")}</Text>
          </View>
        </View>
      )}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.cardLesson, { transform: [{ translateX: position }] }]}
      >
        <Text style={styles.lessonTitleTextList}>
          {tabTitles?.[currentIndex] || ""}
        </Text>
        <ScrollView style={styles.lessonTextListContainer}>
          {typeof content === "string" && content.trim().length > 1 ? (
            <View style={{ width: width - 40 }}>
              <AutoHeightWebView
                originWhitelist={["*"]}
                source={{
                  html: `
                    <div style="color: ${theme.colors.text}">
                      ${content}
                    </div>
                  `}}
                style={{
                  backgroundColor: "transparent",
                  width: width - 80,
                }}
                scrollEnabled={false}
                scalesPageToFit={false}
                javaScriptEnabled
              />
            </View>
          ) : (
            <Text style={styles.lessonTextList}>{t("noData")}</Text>
          )}

          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
            </View>
          )}
        </ScrollView>

        {[1, 2].includes(currentIndex) && (
          <TouchableOpacity
            style={[styles.linkButton, styles.linkTextContainer]}
            onPress={() => {
              const operator = getOperatorFromSkillName(skillName);
              const baseParams = { skillName };

              if (currentIndex === 1 && autoNumber1 && autoNumber2) {
                navigation.navigate("StepByStepScreen", {
                  ...baseParams,
                  number1: autoNumber1,
                  number2: autoNumber2,
                  operator,
                  grade: grade,
                });
              } else if (currentIndex === 2) {
                navigation.navigate("StepByStepScreen", {
                  ...baseParams,
                  grade: grade,
                });
              }
            }}
          >
            <Text style={styles.linkText}>
              {currentIndex === 1
                ? t("go_to_step_by_step")
                : t("practice_custom_problem")}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={24}
              color={theme.colors.black}
              style={styles.linkIcon}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </View>
  );
}
