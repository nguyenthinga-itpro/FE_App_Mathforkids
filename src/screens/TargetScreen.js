import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import FloatingMenu from "../components/FloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import { getGoalsWithin30Days } from "../redux/goalSlice";
import { getLessonById } from "../redux/lessonSlice";
import { getRewardById } from "../redux/rewardSlice";
import { getEnabledLevels } from "../redux/goalSlice";
import { pupilById } from "../redux/pupilSlice";
import FullScreenLoading from "../components/FullScreenLoading";
import { useTranslation } from "react-i18next";
export default function TargetScreen({ navigation, route }) {
  const { theme } = useTheme();
  const flatListRef = useRef(null);
  const { focusGoalId } = route.params || {};
  // console.log("focusGoalId", focusGoalId);
  const [selectedTab, setSelectedTab] = useState("target");
  const [mergedGoals, setMergedGoals] = useState([]);
  // console.log("mergedGoals", mergedGoals);
  const { t, i18n } = useTranslation("target");
  const pupilId = useSelector((state) => state.auth.user?.pupilId);
  const pupilData = useSelector((state) => state.pupil.pupil);

  const goals = useSelector((state) => state.goal.goals || []);
  const { enabledLevels } = useSelector((state) => state.goal);
  // console.log("enabledLevels", enabledLevels);
  const dispatch = useDispatch();
  const loading = useSelector(
    (state) =>
      state.goal.loading ||
      state.goal.enabledLevels?.loading ||
      state.pupil.loading 
  );

  const getSkillIconByName = (skillName = "") => {
    const name = skillName.toLowerCase();
    const iconMap = {
      addition: 9,
      subtraction: 55,
      multiplication: 37,
      division: 22,
    };
    return iconMap[name] || 0;
  };

  useEffect(() => {
    dispatch(getEnabledLevels());
    if (pupilId) {
      dispatch(getGoalsWithin30Days(pupilId));
      dispatch(pupilById(pupilId));
    }
  }, [pupilId]);

  useEffect(() => {
    const fetchDetailsForGoals = async () => {
      const updatedGoals = await Promise.all(
        goals.map(async (goal) => {
          let lesson = {};
          let reward = {};

          if (goal.lessonId) {
            try {
              lesson = await dispatch(getLessonById(goal.lessonId)).unwrap();
            } catch {}
          }
          if (goal.rewardId) {
            try {
              reward = await dispatch(getRewardById(goal.rewardId)).unwrap();
            } catch {}
          }
          return {
            ...goal,
            lessonId: goal.lessonId,
            lessonName: {
              en: lesson.name?.en || lesson.name?.vi || "Unnamed Lesson",
              vi: lesson.name?.vi || lesson.name?.en || "Unnamed Lesson",
            },
            skillName: lesson.type || "",
            skillIcon: getSkillIconByName(lesson.type),
            rewardName: {
              en: reward.name?.en || reward.name?.vi || "Unnamed Reward",
              vi: reward.name?.vi || reward.name?.en || "Unnamed Reward",
            },
            rewardImage: reward.image ? { uri: reward.image } : undefined,
          };
        })
      );
      setMergedGoals(updatedGoals);
    };

    if (goals.length > 0) fetchDetailsForGoals();
  }, [goals]);
  useEffect(() => {
    if (!focusGoalId || filteredTargets.length === 0) return;

    const index = filteredTargets.findIndex((goal) => goal.id === focusGoalId);

    if (index >= 0 && index < filteredTargets.length) {
      setTimeout(() => {
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.5,
            });
          } catch (e) {
            console.warn("Scroll to index failed:", e);
          }
        }
      }, 100);
    }
  }, [filteredTargets, focusGoalId]);

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const filteredTargets = mergedGoals.filter((item) => {
    if (selectedTab === "success") return item.isCompleted === true;
    return item.isCompleted !== true; // includes false or undefined
  });

  // console.log("mergedGoals", mergedGoals);
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
      fontSize: 36,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      marginHorizontal: 20,
    },
    tabButton: {
      paddingVertical: 10,
      paddingHorizontal: 30,
      marginHorizontal: 5,
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
      elevation: 3,
    },
    tabButtonActive: {
      backgroundColor: theme.colors.green,
    },
    tabText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 14,
      color: theme.colors.black,
    },
    tabTextActive: {
      color: theme.colors.white,
    },
    targetCard: {
      marginHorizontal: 20,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 3,
      marginBottom: 20,
      paddingLeft: 10,
      borderWidth: 1,
      borderColor: theme.colors.white,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingVertical: 10,
    },
    cardTitle: {
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_BOLD,
      fontSize: 16,
      marginBottom: 4,
    },
    cardMission: {
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 14,
    },
    cardReward: {
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 14,
    },
    rewardHighlight: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
    cardDateEnd: {
      color: theme.colors.white,
      fontSize: 10,
      fontFamily: Fonts.NUNITO_ITALIC,
      marginTop: 4,
    },
    rewardImageWrapper: {
      width: 64,
      height: 80,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 10,
      elevation: 5,
    },
    rewardImageContainer: {
      borderRadius: 50,
      backgroundColor: theme.colors.white,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.colors.grayLight,
      elevation: 3,
    },
    rewardImage: {
      width: 40,
      height: 40,
    },
    boldText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
  });

  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradientBluePrimary}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => navigation.navigate("HomeScreen", { pupilId })}
        >
          <Image
            source={theme.icons.back}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t("taskTitle")}</Text>
      </LinearGradient>
      <View style={styles.tabContainer}>
        {["target", "success"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredTargets}
        ref={flatListRef}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        getItemLayout={(data, index) => ({
          length: 160,
          offset: 160 * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({ index, animated: true });
            }
          }, 500);
        }}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              fontSize: 16,
              fontFamily: Fonts.NUNITO_MEDIUM,
              color: theme.colors.white,
            }}
          >
            {t("noTasks")}
          </Text>
        }
        renderItem={({ item, index }) => {
          const isExpired =
            new Date(item.dateEnd).getTime() < new Date().setHours(0, 0, 0, 0);
          const isFocused = item.id === focusGoalId;

          return (
            <LinearGradient
              colors={
                !item.isCompleted && isExpired
                  ? [theme.colors.grayLight, theme.colors.grayDark]
                  : item.isCompleted
                  ? theme.colors.gradientGreen
                  : theme.colors.gradientBluePrimary
              }
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={[
                styles.targetCard,
                isFocused && {
                  borderWidth: 2,
                  borderColor: theme.colors.green,
                  elevation: 6,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.cardContent}
                disabled={!item.isCompleted && isExpired}
                onPress={() => {
                  if (isExpired) return;
                  navigation.navigate("SkillScreen", {
                    skillName: capitalizeFirstLetter(item.skillName),
                    title: item.lessonName,
                    skillIcon: item.skillIcon,
                    lessonId: item.lessonId,
                    pupilId: pupilId,
                    grade: pupilData.grade,
                    // goalId: item.id,
                    levelId: item.exercise,
                  });
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {t("request")} {item.lessonName?.[i18n.language]}
                  </Text>
                  <Text style={styles.cardMission}>
                    {t("exercise")}:{" "}
                    <Text style={styles.boldText}>
                      {enabledLevels
                        .filter((lvl) => item.exercise?.includes(lvl.id))
                        .map((lvl) => lvl.name[i18n.language])
                        .join(", ")}
                    </Text>
                  </Text>

                  <Text style={styles.cardReward}>
                    {t("reward")}:{" "}
                    <Text style={styles.rewardHighlight}>
                      {item.rewardName[i18n.language]}
                    </Text>
                  </Text>

                  <Text style={styles.cardDateEnd}>
                    {item.isCompleted
                      ? t("taskCompleted") // -> ví dụ: "Hoàn thành tốt!"
                      : isExpired
                      ? t("expired") // -> "Đã hết hạn"
                      : `${t("end")}: ${new Date(
                          item.dateEnd
                        ).toLocaleDateString("en-GB")}`}
                  </Text>

                  {isExpired && !item.isCompleted && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {t("taskExpired")}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.rewardImageWrapper,
                    {
                      backgroundColor:
                        index % 2 === 0
                          ? theme.colors.yellowLight
                          : theme.colors.orangeLight,
                      opacity: isExpired ? 0.4 : 1,
                    },
                  ]}
                >
                  <View style={styles.rewardImageContainer}>
                    <View
                      style={{
                        position: "absolute",
                        bottom: -20,
                        right: -10,
                        backgroundColor: theme.colors.cardBackground,
                        borderRadius: 30,
                        padding: 5,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: Fonts.NUNITO_MEDIUM,
                          color: theme.colors.blueDark,
                        }}
                      >
                        x {item.rewardQuantity}
                      </Text>
                    </View>
                    <Image
                      source={item.rewardImage}
                      style={styles.rewardImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          );
        }}
      />
      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </LinearGradient>
  );
}
