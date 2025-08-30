import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import FloatingMenu from "../../components/FloatingMenu";
import { useTranslation } from "react-i18next";

export default function PrivacyManagementScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation("privacy");
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
    backIcon: {
      width: 24,
      height: 24
    },
    title: {
      fontSize: 24,
      fontFamily: Fonts.NUNITO_EXTRA_BOLD,
      color: theme.colors.white,
      width: "50%",
      textAlign: "center",
    },
    scrollcontainer: { paddingVertical: 40 },
    buttonContainer: {
      gap: 35,
      paddingHorizontal: 20,
    },
    wrapContainer: {
      flexDirection: "row",
      gap: 35,
      justifyContent: "space-evenly",
    },
    button: {
      width: "45%",
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      paddingVertical: 20,
      alignItems: "center",
      elevation: 3,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.blueDark,
    },
    buttonImage: {
      width: 80,
      height: 80,
      marginBottom: 10,
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
          onPress={() => navigation.navigate("StatisticScreen")}
        >
          <Image
            source={theme.icons.back}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t("title")}</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollcontainer}>
        <View style={styles.buttonContainer}>
          <View style={styles.wrapContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("DetailScreen")}
            >
              <Image
                source={theme.icons.viewprofile}
                style={styles.buttonImage}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{t("viewProfile")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("ChangeEmailScreen")}
            >
              <Image
                source={theme.icons.changeemail}
                style={styles.buttonImage}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{t("changeEmail")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wrapContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("ChangePhoneScreen")}
            >
              <Image
                source={theme.icons.changephone}
                style={styles.buttonImage}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{t("changePhone")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("ChangePinScreen")}
            >
              <Image
                source={theme.icons.changepin}
                style={styles.buttonImage}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{t("changePin")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wrapContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("ChangeProfilePupilScreen")}
            >
              <Image
                source={theme.icons.profilepupil || theme.icons.profilepupil}
                style={styles.buttonImage}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>{t("changePupilProfile")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <FloatingMenu />
    </LinearGradient>
  );
}