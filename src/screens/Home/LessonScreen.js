import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import FloatingMenu from "../../components/FloatingMenu";
import { getLessonsByGradeAndType } from "../../redux/lessonSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import FullScreenLoading from "../../components/FullScreenLoading";
export default function LessonScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { skillName, grade, pupilId, skillIcon } = route.params;
  // console.log("LessonScreen params:", route.params);

  const { t } = useTranslation("lesson");
  const { t: c } = useTranslation("common");
  const dispatch = useDispatch();
  const normalizedSkillName = skillName.toLowerCase();
  // const [activeTab] = useState("Lesson");
  // console.log("skillIcon", skillIcon);
  const { lessons, error: lessonError } = useSelector((state) => state.lesson);
  const loading = useSelector((state) => state.lesson.loading);
  useFocusEffect(
    useCallback(() => {
      dispatch(
        getLessonsByGradeAndType({ grade, type: normalizedSkillName, pupilId })
      );
    }, [dispatch, grade, normalizedSkillName, pupilId])
  );

  const filteredLessons = lessons.filter(
    (item) => item.type?.toLowerCase() === normalizedSkillName
  );
  // console.log("filteredLessons", filteredLessons);
  const getGradient = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
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
    },
    lessonList: {
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    lessonCard: {
      borderRadius: 20,
      padding: 15,
      marginBottom: 30,
      height: 100,
      justifyContent: "center",
      elevation: 3,
    },
    lessonContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    lessonIcon: {
      position: "absolute",
      top: -40,
      left: -140,
      width: 30,
      height: 30,
    },
    lessonTextContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    lessonText: {
      color: theme.colors.white,
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      textAlign: "center",
    },
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
    },
    lockText: {
      color: theme.colors.white,
      fontSize: 16,
      marginTop: 5,
      fontFamily: Fonts.NUNITO_BOLD,
    },
  });

  if (lessonError) {
    const errorText =
      typeof lessonError === "object"
        ? lessonError[i18n.language] || lessonError.en || "Unknown error"
        : lessonError;

    return <Text>Error: {errorText}</Text>;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradient()} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeScreen", { pupilId })}
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("lesson")}</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.lessonList}>
        {filteredLessons.map((item) => {
          const title =
            item.name?.[i18n.language] || item.name?.en || item.title;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (item.isBlock) {
                  alert(t("lockedLesson"));
                  return;
                }
                navigation.navigate("SkillScreen", {
                  skillName,
                  title: item.name,
                  grade,
                  skillIcon: skillIcon,
                  lessonId: item.id,
                  pupilId: pupilId,
                  grade,
                });
              }}
              activeOpacity={item.isBlock ? 1 : 0.7}
            >
              <LinearGradient
                colors={getGradient()}
                style={[styles.lessonCard, item.isBlock && { opacity: 0.5 }]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
              >
                <View style={styles.lessonContent}>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        const speakText = item.name?.[i18n.language];
                        item.title;
                        Speech.speak(speakText, { language: i18n.language });
                      }}
                    >
                      <Image
                        source={theme.icons.soundOn}
                        style={styles.lessonIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.lessonTextContainer}>
                    <Text style={styles.lessonText}>{title}</Text>
                  </View>

                  {item.isBlock && (
                    <View style={styles.lockOverlay}>
                      <Ionicons
                        name="lock-closed"
                        size={40}
                        color={theme.colors.white}
                      />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </View>
  );
}
