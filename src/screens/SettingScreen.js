import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { useSound } from "../audio/SoundContext";
import FloatingMenu from "../components/FloatingMenu";
import { updateProfile, updatePupilProfile } from "../redux/profileSlice";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  setLanguage,
  setMode,
  setTheme,
  setVolume,
} from "../redux/settingsSlice";
import FullScreenLoading from "../components/FullScreenLoading";
export default function SettingScreen({ navigation }) {
  const { theme, isDarkMode, themeKey, toggleThemeMode, switchThemeKey } =
    useTheme();
  const { t, i18n } = useTranslation("setting");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const pupilId = useSelector((state) => state.auth.user?.pupilId);
  const loading = useSelector((state) => state.auth.loading);
  const profile = pupilId?.userId ? pupilId : user;
  const updateUserOrPupil = (data) => {
    if (pupilId) {
      dispatch(updatePupilProfile({ id: pupilId, data }));
    } else if (user?.id) {
      dispatch(updateProfile({ id: user.id, data }));
    } else {
      console.warn("No valid user ID found!");
    }
  };
  const reduxVolume = useSelector((state) => state.settings.volume);
  const volume = reduxVolume / 100;
  const handleVolumeChange = (change) => {
    const currentVolume = reduxVolume / 100;
    const newVolume = Math.max(0, Math.min(1, currentVolume + change));
    const volumeNumber = Math.round(newVolume * 100);

    dispatch(setVolume(volumeNumber));
    updateUserOrPupil({ volume: volumeNumber });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
    dispatch(setLanguage(newLang));
    updateUserOrPupil({ language: newLang });
  };

  const handleToggleMode = () => {
    const newMode = isDarkMode ? "light" : "dark";
    toggleThemeMode();
    dispatch(setMode(newMode));
    updateUserOrPupil({ mode: newMode });
  };

  const themeKeyToNumber = (key) => {
    switch (key) {
      case "theme1":
        return 1;
      case "theme2":
        return 2;
      case "theme3":
        return 3;
      default:
        return 1;
    }
  };
  const handleSwitchTheme = () => {
    const nextThemeKey =
      themeKey === "theme1"
        ? "theme2"
        : themeKey === "theme2"
        ? "theme3"
        : "theme1";

    switchThemeKey(nextThemeKey);

    const themeNumber = themeKeyToNumber(nextThemeKey);
    dispatch(setTheme(themeNumber));
    updateUserOrPupil({ theme: themeNumber });
  };

  if (!profile) return null;
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
      marginBottom: 40,
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
    sectionTitle: {
      fontSize: 32,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "center",
      marginBottom: 10,
    },
    volume: {
      textAlign: "center",
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 8,
    },
    selectorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    musicDots: { flexDirection: "row", gap: 10 },
    dot: {
      width: 50,
      height: 15,
      borderRadius: 10,
      elevation: 6,
    },
    languageContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
    flagIcon: { width: 40, height: 30 },
    languageText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 18,
      color: theme.colors.white,
    },
    darkModeOption: { flexDirection: "row", alignItems: "center", gap: 8 },
    darkIcon: { width: 35, height: 35 },
    darkModeText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 18,
      color: theme.colors.white,
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
          onPress={() => navigation.goBack()}
        >
          <Image
            source={theme.icons.back}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t("setting")}</Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>{t("music")}</Text>
      <Text style={styles.volume}>
        {t("volume", { value: Math.round(volume * 100) })}
      </Text>
      <View style={styles.selectorRow}>
        <TouchableOpacity
          onPress={() => handleVolumeChange(-0.2)}
          dispatch={volume <= 0}
        >
          <Ionicons
            name="caret-back-outline"
            size={30}
            color={volume <= 0 ? theme.colors.grayDark : theme.colors.grayLight}
          />
        </TouchableOpacity>
        <View style={styles.musicDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i < Math.round(volume * 3)
                      ? theme.colors.blueLight
                      : theme.colors.grayLight,
                },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => handleVolumeChange(0.2)}
          disabled={volume >= 1}
        >
          <Ionicons
            name="caret-forward-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t("language")}</Text>
      <View style={styles.selectorRow}>
        <TouchableOpacity onPress={toggleLanguage}>
          <Ionicons
            name="caret-back-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
        <View style={styles.languageContainer}>
          <Image
            source={
              i18n.language === "en"
                ? theme.icons.languageEnglish
                : theme.icons.languageVietnamese
            }
            style={styles.flagIcon}
          />
          <Text style={styles.languageText}>
            {i18n.language === "en" ? t("english") : t("vietnamese")}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleLanguage}>
          <Ionicons
            name="caret-forward-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t("mode")}</Text>
      <View style={styles.selectorRow}>
        <TouchableOpacity onPress={handleToggleMode}>
          <Ionicons
            name="caret-back-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.darkModeOption}>
          <Image
            source={isDarkMode ? theme.icons.themeDark : theme.icons.themeLight}
            style={styles.darkIcon}
          />
          <Text style={styles.darkModeText}>
            {isDarkMode ? t("dark") : t("light")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleMode}>
          <Ionicons
            name="caret-forward-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t("theme")}</Text>
      <View style={styles.selectorRow}>
        <TouchableOpacity
          onPress={() =>
            switchThemeKey(themeKey === "theme1" ? "theme2" : "theme1")
          }
        >
          <Ionicons
            name="caret-back-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
        <View style={styles.darkModeOption}>
          <Image source={theme.icons.graphic} style={styles.darkIcon} />
          <Text style={styles.darkModeText}>
            {themeKey === "theme1"
              ? t("capybara")
              : themeKey === "theme2"
              ? t("animal")
              : t("super_hero")}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSwitchTheme}>
          <Ionicons
            name="caret-forward-outline"
            size={30}
            color={theme.colors.grayLight}
          />
        </TouchableOpacity>
      </View>

      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </LinearGradient>
  );
}
