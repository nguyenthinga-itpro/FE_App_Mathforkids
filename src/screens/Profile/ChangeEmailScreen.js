import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile,
  profileById,
  sendOtpToUpdateEmail,
} from "../../redux/profileSlice";
import { verifyOnlyOTP } from "../../redux/authSlice";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../../components/FullScreenLoading";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";
// Helper để xử lý lỗi
const parseErrorMessage = (error, t, fallbackKey = "unknownError") => {
  if (typeof error === "object") {
    if (error.vi || error.en) return error;
    if (error.message && (error.message.vi || error.message.en))
      return error.message;
  }
  if (typeof error === "string") {
    return { vi: error, en: error };
  }
  return { vi: t(fallbackKey), en: t(fallbackKey) };
};

export default function ChangeEmailScreen({ navigation }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("profile");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile?.info);
  const loading = useSelector((state) => state.profile.loading);
  const [newEmail, setNewEmail] = useState("");
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinModalVisible, setPinModalVisible] = useState(false);
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
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    if (user?.id) {
      dispatch(profileById(user?.id));
    }
  }, [user?.id, dispatch]);

  const handleConfirmPin = async () => {
    const joinedPin = pin.join("");

    if (!/^\d{4}$/.test(joinedPin)) {
      setErrors({ pin: t("invalidPinMessage") });
      return;
    }

    try {
      await dispatch(
        verifyOnlyOTP({ userId: user?.id, otpCode: joinedPin })
      ).unwrap();

      await dispatch(
        updateProfile({ id: user?.id, data: { email: newEmail } })
      ).unwrap();

      await dispatch(profileById(user?.id)).unwrap();

      setErrors({});
      setSuccessContent({
        title: t("successTitle"),
        description: t("emailUpdateSuccess"),
      });
      setShowSuccess(true);
      setPinModalVisible(false);
      setPin(["", "", "", ""]);
    } catch (error) {
      const message = parseErrorMessage(error, t, "otpOrUpdateFailed");
      setErrorContent({
        title: t("errorTitle"),
        description: message[i18n.language] || message.vi || message.en,
      });
      setShowError(true);
    }
  };

  const handleOpenPinModal = async () => {
    const validationErrors = {};

    const trimmedEmail = newEmail.trim().toLowerCase();
    const currentEmail = profile.email?.trim().toLowerCase();

    if (!trimmedEmail) {
      validationErrors.newEmail = t("emailRequired");
    } else if (!validateEmail(trimmedEmail)) {
      validationErrors.newEmail = t("invalidEmailMessage");
    } else if (trimmedEmail === currentEmail) {
      validationErrors.newEmail = t("emailDuplicateMessage");
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await dispatch(
        sendOtpToUpdateEmail({ id: user?.id, email: user?.email, newEmail })
      ).unwrap();

      setErrors({});
      setPinModalVisible(true);
    } catch (error) {
      const message = parseErrorMessage(error, t, "sendOtpFailed");
      const text =
        message[i18n.language] ||
        message.vi ||
        message.en ||
        t("sendOtpFailed");

      if (
        text.toLowerCase().includes("đã được sử dụng") ||
        text.toLowerCase().includes("already used")
      ) {
        setErrorContent({
          title: t("emailAlreadyExists"),
          description: text,
        });
        setShowError(true);
      } else {
        setErrorContent({
          title: t("sendOtpFailedTitle"),
          description: text,
        });
        setShowError(true);
      }
    }
  };

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
      fontSize: 26,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    formContainer: {
      paddingHorizontal: 20,
    },
    iconImage: {
      width: 100,
      height: 100,
      alignSelf: "center",
      marginBottom: 20,
    },
    currentEmailText: {
      fontFamily: Fonts.NUNITO_MEDIUM_ITALIC,
      color: theme.colors.white,
      textAlign: "center",
      marginBottom: 10,
    },
    descriptionText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      fontSize: 14,
      marginBottom: 20,
      textAlign: "center",
    },
    label: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      marginBottom: 10,
      fontSize: 16,
    },
    input: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      padding: 12,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginBottom: 20,
    },
    confirmButton: {
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    },
    confirmText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    pinModalContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 40,
      marginHorizontal: 40,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      marginBottom: 20,
    },
    pinRow: {
      flexDirection: "row",
      gap: 10,
      width: "80%",
      marginBottom: 5,
    },
    pinBox: {
      borderWidth: 1,
      borderColor: theme.colors.graySoft,
      borderRadius: 8,
      padding: 10,
      fontSize: 20,
      textAlign: "center",
      width: 50,
      height: 50,
      backgroundColor: theme.colors.cardBackground,
      elevation: 5,
      color: theme.colors.black
    },
    modalButtonRow: {
      flexDirection: "row",
      gap: 40,
      width: "100%",
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.red,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    verifyButton: {
      flex: 1,
      backgroundColor: theme.colors.green,
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
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
          onPress={() => navigation.navigate("PrivacyScreen")}
        >
          <Image
            source={theme.icons.back}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t("changeEmail")}</Text>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        <View style={styles.formContainer}>
          <Image
            source={theme.icons.changeemail}
            style={styles.iconImage}
            resizeMode="contain"
          />
          <Text style={styles.currentEmailText}>
            {t("currentEmail")}: {profile?.email}
          </Text>
          <Text style={styles.descriptionText}>
            {t("changeEmailInstruction")}
          </Text>
          <Text style={styles.label}>{t("newEmail")}</Text>
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            placeholder={t("emailPlaceholder")}
            placeholderTextColor={theme.colors.grayMedium}
            color={theme.colors.blueDark}
          />
          {errors.newEmail && (
            <Text style={{ color: "red", marginTop: -15, marginBottom: 10 }}>
              {errors.newEmail}
            </Text>
          )}
        </View>
      </View>

      <Modal visible={pinModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pinModalContainer}>
            <Text style={styles.modalTitle}>{t("enterPin")}</Text>
            <View style={styles.pinRow}>
              {pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={pinRefs[index]}
                  value={digit}
                  onChangeText={(val) => {
                    const newPin = [...pin];
                    newPin[index] = val;
                    setPin(newPin);
                    if (val && index < 3) pinRefs[index + 1].current.focus();
                    if (!val && index > 0) pinRefs[index - 1].current.focus();
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.pinBox}
                />
              ))}
            </View>
            {errors.pin && (
              <Text style={{ color: "red", fontSize: 12 }}>{errors.pin}</Text>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPin(["", "", "", ""]);
                  setPinModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleConfirmPin}
              >
                <Text style={styles.buttonText}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={handleOpenPinModal}>
        <LinearGradient
          colors={theme.colors.gradientBlue}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmText}>{t("confirm")}</Text>
        </LinearGradient>
      </TouchableOpacity>
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
          navigation.navigate("PrivacyScreen");
        }}
      />
    </LinearGradient>
  );
}
