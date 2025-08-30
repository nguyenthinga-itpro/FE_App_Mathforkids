import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { getEnabledLevels } from "../../redux/levelSlice";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import FullScreenLoading from "../../components/FullScreenLoading";
export default function LevelScreen({ navigation, route }) {
  const colony = "colony";
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("common");
  const { skillName, grade, lessonId } = route.params;
  const dispatch = useDispatch();
  const { levels, loading, error } = useSelector((state) => state.level);
  const [selectedLevels, setSelectedLevels] = useState([]);

  useEffect(() => {
    // console.log("Dispatching getEnabledLevels...");
    dispatch(getEnabledLevels());
  }, [dispatch]);

  const toggleLevelSelection = (levelId) => {
    if (selectedLevels.includes(levelId)) {
      setSelectedLevels(selectedLevels.filter((id) => id !== levelId));
    } else {
      setSelectedLevels([...selectedLevels, levelId]);
    }
  };

  const getGradientBySkill = () => {
    if (skillName === "Addition") return theme.colors.gradientGreen;
    if (skillName === "Subtraction") return theme.colors.gradientPurple;
    if (skillName === "Multiplication") return theme.colors.gradientOrange;
    if (skillName === "Division") return theme.colors.gradientRed;
    return theme.colors.gradientPink;
  };

  const getSelectedGradient = () => {
    // Use a distinct color for selected state to contrast with the skill-based gradient
    return [theme.colors.white, theme.colors.lightGray]; // Light gradient for selected state
  };

  const handleContinue = () => {
    if (selectedLevels.length === 0) {
      alert(t("pleaseSelectLevel"));
      return;
    }
    navigation.navigate("ExerciseDetailScreen", {
      levelIds: selectedLevels, // Pass the array of selected level IDs
      lessonId, // Pass the lessonId from route.params
      skillName, // Pass the skillName from route.params
      grade, // Pass the grade from route.params
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
    headerContent: {
      flexDirection: "row",
      gap: 5,
      alignItems: "center",
    },
    skillName: {
      fontSize: 24,
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_BOLD,
    },
    grid: {
      marginTop: 40,
      flex: 1,
      alignItems: "center", // Center the grid items horizontally
    },
    card: {
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      elevation: 2,
      padding: 20,
      width: 150, // Fixed width for cards to ensure centering
      marginHorizontal: 10,
    },
    cardLabel: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "center",
    },
    continueButton: {
      margin: 20,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
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

  const renderLevelItem = ({ item }) => (
    <LinearGradient
      colors={
        selectedLevels.includes(item.id)
          ? getSelectedGradient()
          : getGradientBySkill()
      }
      style={styles.card}
    >
      <TouchableOpacity onPress={() => toggleLevelSelection(item.id)}>
        <Text
          style={[
            styles.cardLabel,
            {
              color: selectedLevels.includes(item.id)
                ? theme.colors.black
                : theme.colors.white,
            },
          ]}
        >
          {item.name[i18n.language]}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={getGradientBySkill()} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.skillName}>{t(skillName)}</Text>
        </View>
      </LinearGradient>
      {loading ? (
        <Text style={styles.loadingText}>{t("loading")}</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={levels}
          renderItem={renderLevelItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.grid}
          numColumns={2}
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
      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </View>
  );
}
