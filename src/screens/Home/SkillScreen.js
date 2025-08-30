import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  getEnabledLevels,
  countLevelIdsInLesson,
} from "../../redux/levelSlice";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"; // Thêm import này
import FullScreenLoading from "../../components/FullScreenLoading";
export default function SkillScreen({ navigation, route }) {
  const { theme } = useTheme();
  const {
    skillName,
    skillIcon,
    grade,
    pupilId,
    title,
    lessonId,
    levelId,
    levelIds,
  } = route.params;
  // console.log("skillIcon", skillIcon);
  // console.log("pupilId", pupilId);
  // console.log("lessonId", lessonId);
  // console.log("title", title);
  // console.log("levelIds", levelIds);
  // console.log("level", level);
  const { t, i18n } = useTranslation("skill");
  const dispatch = useDispatch();
  const { levels, levelIdCounts, loading, error } = useSelector(
    (state) => state.level
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [persistedLevels, setPersistedLevels] = useState([]);
  // console.log("selectedLevels", selectedLevels);
  // console.log("persistedLevels", persistedLevels);
  useFocusEffect(
    useCallback(() => {
      setSelectedLevels([]);
      setPersistedLevels([]);
      return () => { };
    }, [])
  );

  useEffect(() => {
    dispatch(getEnabledLevels());
  }, [dispatch]);

  const level = useMemo(() => {
    if (!Array.isArray(levelIds) || levelIds.length === 0) {
      if (levels && levels.length > 0) {
        return [levels[0].id]; // gan level dau tien khi levelIds undefine
      }
      return [];
    }
    return levelIds;
  }, [levelIds, levels]);

  useEffect(() => {
    if (levelId && !route.params?.fromExercise) {
      setSelectedLevels(Array.isArray(levelId) ? levelId : [levelId]);
      setPersistedLevels(Array.isArray(levelId) ? levelId : [levelId]);

      navigation.replace("ExerciseDetailScreen", {
        levelIds: Array.isArray(levelId) ? levelId : [levelId],
        lessonId,
        skillName,
        title,
        grade,
        pupilId,
        skillIcon: skillIcon,
      });
    }
  }, []);

  useEffect(() => {
    if (modalVisible && levels.length > 0) {
      const levelIds = levels.map((level) => level.id);
      dispatch(countLevelIdsInLesson({ lessonId, levelIds }));
    }
  }, [modalVisible, levels, lessonId, dispatch]);

  const actions = [
    { label: "lesson", icon: theme.icons.lesson },
    { label: "exercise", icon: theme.icons.exercise },
    { label: "test", icon: theme.icons.test },
  ];

  const getGradientBySkill = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
  };

  const getSelectedGradient = () => {
    return [theme.colors.gradientRed, "#CC0000"];
  };
  const getDisabledGradient = () => {
    return ["#A9A9A9", "#808080"];
  };

  const toggleLevelSelection = (levelId) => {
    if (levelIdCounts?.levelIdCounts?.[levelId] === 0) return;

    const current = selectedLevels || [];
    const updated = current.includes(levelId)
      ? current.filter((id) => id !== levelId)
      : [...current, levelId];

    setSelectedLevels(updated);
    setPersistedLevels(updated);
  };

  const handleContinue = () => {
    if (selectedLevels.length === 0) {
      alert(t("pleaseSelectLevel"));
      return;
    }
    const sortedLevels = levels
      .filter((level) => selectedLevels.includes(level.id))
      .sort((a, b) => {
        const levelA = parseInt(a.name?.[i18n.language] || "0");
        const levelB = parseInt(b.name?.[i18n.language] || "0");
        return levelA - levelB;
      })
      .map((level) => level.id);
    setModalVisible(false);
    navigation.navigate("ExerciseDetailScreen", {
      levelIds: sortedLevels,
      lessonId,
      skillName,
      title,
      grade,
      pupilId: pupilId,
      skillIcon: skillIcon,
    });
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
      marginBottom: 40,
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
    headerContent: {
      flexDirection: "row",
      gap: 5,
      alignItems: "center",
    },
    skillIcon: {
      width: 50,
      height: 50,
    },
    skillName: {
      fontSize: 24,
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_BOLD,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-evenly",
      marginTop: 30,
      padding: 10,
    },
    card: {
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      elevation: 2,
      padding: 20,
    },
    cardIconContainer: {
      backgroundColor: theme.colors.cardBackground,
      padding: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 3,
    },
    cardIcon: {
      width: 80,
      height: 80,
      marginBottom: 10,
    },
    cardLabel: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "center",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "80%",
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      position: "relative",
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.text,
      marginBottom: 20,
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      padding: 5,
    },
    levelCard: {
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      elevation: 2,
      padding: 10,
      width: 120,
      marginRight: 5,
    },
    levelCardLabel: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      textAlign: "center",
    },
    continueButton: {
      marginTop: 20,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      width: "80%",
    },
    continueButtonText: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
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

  const renderLevelItem = useCallback(
    ({ item }) => {
      const isDisabled = levelIdCounts?.levelIdCounts?.[item.id] === 0;
      return (
        <TouchableOpacity
          onPress={() => toggleLevelSelection(item.id)}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={
              isDisabled
                ? getDisabledGradient()
                : selectedLevels.includes(item.id)
                  ? getSelectedGradient()
                  : getGradientBySkill()
            }
            style={[
              styles.levelCard,
              {
                borderWidth: selectedLevels.includes(item.id) ? 2 : 0,
                borderColor: theme.colors.white,
                opacity: isDisabled ? 0.6 : 1,
              },
            ]}
          >
            <Text
              style={[styles.levelCardLabel, { color: theme.colors.white }]}
            >
              {item.name?.[i18n.language] || item.name?.en || "Unknown Level"}
            </Text>
            {selectedLevels.includes(item.id) && (
              <Ionicons
                name="checkmark"
                size={20}
                color={theme.colors.white}
                style={{ position: "absolute", top: 5, right: 5 }}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [selectedLevels, i18n.language, theme.colors, levelIdCounts]
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradientBySkill()} style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("LessonScreen", {
              skillName,
              grade,
              pupilId,
              skillIcon,
            })
          }
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image source={skillIcon} style={styles.skillIcon} />
          <Text style={styles.skillName}>{t(skillName)}</Text>
        </View>
      </LinearGradient>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <LinearGradient
            key={index}
            colors={getGradientBySkill()}
            style={styles.card}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          >
            <TouchableOpacity
              style={styles.cardTouchable}
              onPress={() => {
                if (action.label === "lesson") {
                  navigation.navigate("LessonDetailScreen", {
                    skillName,
                    title,
                    lessonId,
                    levelIds:
                      persistedLevels.length > 0
                        ? persistedLevels
                        : selectedLevels,
                    grade,
                  });
                } else if (action.label === "exercise") {
                  setModalVisible(true);
                } else if (action.label === "test") {
                  navigation.navigate("TestScreen", {
                    skillName,
                    grade,
                    title,
                    lessonId,
                    pupilId,
                    skillIcon,
                    levelIds: level,
                  });
                }
              }}
            >
              <View style={styles.cardIconContainer}>
                <Image source={action.icon} style={styles.cardIcon} />
              </View>
              <Text style={styles.cardLabel}>{t(action.label)}</Text>
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedLevels([]);
          // setPersistedLevels([]);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedLevels([]); // Reset selected levels when closing the modal
                // setPersistedLevels([]);
              }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t("selectLevels")}</Text>
            {loading ? (
              <Text style={styles.loadingText}>{t("loading")}</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <FlatList
                data={levels}
                renderItem={renderLevelItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={{ alignItems: "center" }}
              />
            )}
            <LinearGradient
              colors={getGradientBySkill()}
              style={styles.continueButton}
            >
              <TouchableOpacity onPress={handleContinue}>
                <Text style={styles.continueButtonText}>{t("continue")}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </View>
  );
}
