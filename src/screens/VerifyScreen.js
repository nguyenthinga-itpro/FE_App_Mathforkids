import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import { useDispatch, useSelector } from "react-redux";
import {
  sendOTPByPhone,
  sendOTPByEmail,
  verifyOTP,
  setUser,
  updateUser,
} from "../redux/authSlice";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../components/FullScreenLoading";
import MessageError from "../components/MessageError";
import MessageSuccess from "../components/MessageSuccess";
export default function VerifyOTP({ navigation, route }) {
  const { theme } = useTheme();
  const { userId, contact, isEmail, isLogin } = route.params;
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation("verify");
  const [isResending, setIsResending] = useState(false);
  const loading = useSelector((state) => state.auth.loading);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [errors, setErrors] = useState({});
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
  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
    if (!text && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("").trim();

    if (otpCode.length !== 4) {
      setErrors({ otp: "Please enter the full 4-digit OTP" });
      return;
    }

    setErrors({});

    try {
      const result = await dispatch(verifyOTP({ userId, otpCode })).unwrap();

      if (!isLogin) {
        await dispatch(updateUser({ id: result.id, data: { isVerify: true } }));
      }

      dispatch(
        setUser({
          id: result.id,
          role: result.role,
          token: result.token,
          fullName: result.fullName,
          image: result.image,
          email: result.email,
          pin: result.pin,
        })
      );

      setSuccessContent({
        title: t("successTitle"),
        description: t("successVerified"),
        type: "verify",
      });
      setShowSuccess(true);
    } catch (err) {
      let msg = t("errorVerifyFailed");

      if (err && typeof err === "object") {
        if (
          typeof err.message === "object" &&
          (err.message.vi || err.message.en)
        ) {
          msg =
            err.message[i18n.language] ||
            err.message.en ||
            err.message.vi ||
            msg;
        } else if (err.vi || err.en) {
          msg = err[i18n.language] || err.en || err.vi;
        } else if (typeof err.message === "string") {
          msg = err.message;
        }
      } else if (typeof err === "string") {
        msg = err;
      }

      setErrorContent({ title: t("errorTitle"), description: msg });
      setShowError(true);
      // setErrors({ otp: msg });
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const resendAction = isEmail ? sendOTPByEmail : sendOTPByPhone;
    const targetKey = isEmail ? "email" : "phoneNumber";

    try {
      const res = await dispatch(
        resendAction({ userId, [targetKey]: contact })
      );

      if (!res.error) {
        setSuccessContent({
          title: t("successTitle"),
          description: t("resendSuccess"),
          type: "resend",
        });
        setShowSuccess(true);
      } else {
        const msg =
          typeof res.payload === "object"
            ? res.payload?.[i18n.language] || res.payload?.en || res.payload?.vi
            : String(res.payload);

        setErrorContent({ title: t("errorTitle"), description: msg });
        setShowError(true);
      }
    } catch {
      setErrorContent({
        title: t("errorTitle"),
        description: t("resendFailed"),
      });
      setShowError(true);
    } finally {
      setIsResending(false);
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      height: "90%",
      marginTop: 20,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.blueDark,
      marginBottom: 10,
    },
    subtitle: {
      color: theme.colors.grayLight,
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 12,
    },
    phoneNumber: {
      marginBottom: 20,
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 12,
      color: theme.colors.grayMedium,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "80%",
      marginBottom: 5,
    },
    otpInput: {
      width: 55,
      height: 55,
      borderRadius: 12,
      backgroundColor: theme.colors.white,
      textAlign: "center",
      fontSize: 24,
      borderWidth: 1,
      borderColor: theme.colors.grayLight,
      elevation: 5,
    },
    otpInputFocused: {
      borderColor: theme.colors.skyBlue,
    },
    verifyButton: {
      width: 250,
      borderRadius: 10,
      paddingVertical: 12,
      marginBottom: 20,
      elevation: 8,
      marginTop: 20,
    },
    verifyText: {
      color: theme.colors.white,
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 16,
    },
    resendText: {
      color: theme.colors.grayMedium,
      fontSize: 14,
    },
    resendLink: {
      color: theme.colors.blueDark,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    errorText: {
      color: "red",
      fontSize: 12,
      alignSelf: "flex-start",
    },
    backContainer: {
      position: "absolute",
      top: 20,
      left: 5,
      backgroundColor: theme.colors.backBackgound,
      marginLeft: 20,
      padding: 8,
      borderRadius: 50,
    },
    backIcon: { width: 24, height: 24 },
  });
  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("verifyTitle")}</Text>

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

        <Text style={styles.subtitle}>
          {t("subtitle", {
            method: t(isEmail ? "byEmail" : "byPhone"),
          })}
        </Text>
        <Text style={styles.phoneNumber}>{contact}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              style={[
                styles.otpInput,
                focusedIndex === index && styles.otpInputFocused,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onChangeText={(text) => handleChange(text, index)}
            />
          ))}
        </View>

        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

        <LinearGradient
          colors={theme.colors.gradientBluePrimary}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.verifyButton}
        >
          <TouchableOpacity onPress={handleVerify}>
            <Text style={styles.verifyText}>{t("verifyButton")}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.resendText}>{t("noCode")}</Text>
        <Text style={styles.resendText}>
          {isResending ? (
            "Sending..."
          ) : (
            <Text style={styles.resendLink} onPress={handleResend}>
              {t("resendLink")}
            </Text>
          )}
        </Text>
      </View>
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
          if (successContent.type === "verify") {
            navigation.navigate("AccountScreen");
          }
        }}
      />
    </LinearGradient>
  );
}
