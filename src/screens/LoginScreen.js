import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { sendOTPByPhone, sendOTPByEmail } from "../redux/authSlice";
import { Fonts } from "../../constants/Fonts";
import { useTheme } from "../themes/ThemeContext";
import useSound from "../audio/useSound";
import { useTranslation } from "react-i18next";
import MessageError from "../components/MessageError";
import FullScreenLoading from "../components/FullScreenLoading";
export default function LoginScreen({ navigation }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errorContent, setErrorContent] = useState({
    title: "",
    description: "",
  });

  const dispatch = useDispatch();
  const { theme, isDarkMode } = useTheme();
  const { play } = useSound();
  const { t, i18n } = useTranslation("login");
  const [errors, setErrors] = useState({});
  const loading = useSelector((state) => state.auth.loading);
  const handleLogin = async () => {
    play("openClick");

    const value = inputValue.trim();
    const newErrors = {};

    if (!value) {
      newErrors.contact = t("errorEnterContact");
    } else if (
      !/^[0-9]{10}$/.test(value) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      newErrors.contact = t("errorInvalidContact");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const isPhone = /^[0-9]{10}$/.test(value);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    try {
      setIsLoading(true);

      const sendAction = isEmail ? sendOTPByEmail : sendOTPByPhone;
      const contactKey = isEmail ? "email" : "phoneNumber";
      const result = await dispatch(
        sendAction({ [contactKey]: value, role: "user" })
      ).unwrap();

      const userId = result?.userId;
      if (!userId) throw new Error(t("errorNoUserId"));

      navigation.navigate("VerifyScreen", {
        userId,
        contact: value,
        isEmail,
        isLogin: true,
      });
    } catch (err) {
      let msg = t("errorSendOtp");
      if (err && typeof err === "object") {
        if (err.messageKey) {
          msg = t(err.messageKey);
        } else if (err.vi || err.en) {
          msg = err[i18n.language] || err.vi || err.en || msg;
        } else if (typeof err.message === "object") {
          msg =
            err.message[i18n.language] ||
            err.message.vi ||
            err.message.en ||
            msg;
        } else if (typeof err.message === "string") {
          msg = err.message;
        }
      } else if (typeof err === "string") {
        msg = err;
      }
      setErrorContent({
        title: t("loginFailedTitle"),
        description: msg,
      });
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      backgroundColor: theme.colors.cardBackground,
      width: "85%",
      height: "90%",
      borderRadius: 20,
      padding: 30,
      marginTop: 45,
      alignItems: "center",
      elevation: 3,
    },
    logo: {
      width: 150,
      height: 150,
      position: "absolute",
      top: -15,
    },
    title: {
      fontSize: 28,
      color: theme.colors.blueDark,
      fontFamily: Fonts.NUNITO_BOLD,
      marginBottom: 15,
      marginTop: 110,
    },
    inputWrapper: {
      width: "100%",
      height: 50,
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.white,
      elevation: 5,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.skyBlue,
      shadowColor: theme.colors.skyBlue,
      elevation: 8,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.blueDark,
      fontFamily: Fonts.NUNITO_REGULAR,
    },
    buttonWrapper: {
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 20,
      elevation: 6,
    },
    button: {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    footer: {
      flexDirection: "row",
    },
    footerText: {
      color: theme.colors.grayLight,
      fontSize: 14,
      fontFamily: Fonts.NUNITO_REGULAR,
    },
    registerText: {
      color: theme.colors.blueDark,
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginLeft: 5,
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: -10,
      marginBottom: 10,
      alignSelf: "flex-start",
      width: "100%",
    },
    inputWrapperContainer: {
      width: 250,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={theme.colors.gradientBlue}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.card}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={isDarkMode ? theme.icons.logoDark : theme.icons.logoLight}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t("title")}</Text>

          <View style={styles.inputWrapperContainer}>
            <View
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder={t("placeholder")}
                placeholderTextColor={theme.colors.grayLight}
                value={inputValue}
                onChangeText={setInputValue}
                onFocus={() => {
                  play("openClick");
                  setIsFocused(true);
                }}
                onBlur={() => {
                  play("closeClick");
                  setIsFocused(false);
                }}
              />
            </View>
            {errors.contact && (
              <Text style={styles.errorText}>{errors.contact}</Text>
            )}
          </View>

          <View style={styles.inputWrapperContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonWrapper}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={theme.colors.gradientBlue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t("loginButton")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("noAccount")}</Text>
            <TouchableOpacity
              onPress={() => {
                play("openClick");
                navigation.navigate("RegisterScreen");
              }}
            >
              <Text style={styles.registerText}>{t("registerLink")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Overlay Loading */}
        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <MessageError
          visible={showError}
          title={errorContent.title}
          description={errorContent.description}
          onClose={() => setShowError(false)}
        />
        <FullScreenLoading visible={loading} color={theme.colors.white} />
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}
