import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { useDispatch, useSelector } from "react-redux";
import { updatePin, profileById } from "../../redux/profileSlice";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../../components/FullScreenLoading";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";
export default function ChangePinScreen({ navigation }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("profile");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
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
  const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pinRefs = {
    current: [useRef(), useRef(), useRef(), useRef()],
    new: [useRef(), useRef(), useRef(), useRef()],
    confirm: [useRef(), useRef(), useRef(), useRef()],
  };

  const handleInput = (value, index, pin, setPin, refs) => {
    const newValues = [...pin];
    newValues[index] = value.replace(/[^0-9]/g, "");
    setPin(newValues);
    if (value && index < 3) refs[index + 1].current.focus();
    if (!value && index > 0) refs[index - 1].current.focus();
  };

  const renderPinInputs = (pin, setPin, refs, show, setShow, errorKey) => (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.pinRowContainer}>
        <View style={styles.pinRow}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={refs[index]}
              style={styles.pinBox}
              value={digit}
              onChangeText={(val) => handleInput(val, index, pin, setPin, refs)}
              maxLength={1}
              keyboardType="number-pad"
              secureTextEntry={!show}
              textAlign="center"
              color={theme.colors.blueDark}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => setShow(!show)}
          style={styles.lockIconContainer}
        >
          <View style={styles.lockIcon}>
            <Ionicons
              name={show ? "eye" : "eye-off"}
              size={14}
              color={theme.colors.blueGray}
            />
          </View>
        </TouchableOpacity>
      </View>

      {errors[errorKey] && (
        <Text style={{ color: theme.colors.red, fontSize: 10 }}>
          {errors[errorKey]}
        </Text>
      )}
    </View>
  );

  const handleChangePin = async () => {
    const current = currentPin.join("");
    const newCode = newPin.join("");
    const confirm = confirmPin.join("");
    setErrors({});
    const newErrors = {};
    if (!/^\d{4}$/.test(current)) newErrors.currentPin = t("invalidPinMsg");
    if (!/^\d{4}$/.test(newCode)) newErrors.newPin = t("invalidPinMsg");
    if (!/^\d{4}$/.test(confirm)) newErrors.confirmPin = t("invalidPinMsg");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (newCode !== confirm) {
      setErrors({ confirmPin: t("mismatchPinMsg") });
      return;
    }

    try {
      await dispatch(
        updatePin({ id: user.id, data: { oldPin: current, newPin: newCode } })
      ).unwrap();
      dispatch(profileById(user.id));
      setSuccessContent({
        title: t("success"),
        description: t("updateSuccess"),
      });
      setShowSuccess(true);
    } catch (error) {
      const msg =
        typeof error === "object"
          ? error?.vi || error?.en || t("updateFailed")
          : typeof error === "string"
          ? error
          : t("updateFailed");

      setErrorContent({
        title: t("incorrectPinTitle"),
        description: msg,
      });
      setShowError(true);
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
      marginBottom: 10,
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
      fontSize: 30,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    section: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
    label: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      marginBottom: 10,
      fontSize: 16,
    },
    hint: {
      fontSize: 12,
      fontFamily: Fonts.NUNITO_MEDIUM_ITALIC,
      color: theme.colors.graySoft,
      marginBottom: 5,
    },
    pinRowContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    pinRow: {
      flexDirection: "row",
      gap: 10,
    },
    pinBox: {
      borderWidth: 1,
      borderColor: theme.colors.graySoft,
      borderRadius: 10,
      padding: 10,
      fontSize: 20,
      width: 50,
      height: 50,
      backgroundColor: theme.colors.cardBackground,
      elevation: 3,
      color: theme.colors.black,
    },
    lockIconContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 50,
      padding: 10,
      marginLeft: 30,
      elevation: 3,
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
        <Text style={styles.title}>{t("changePin")}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.section}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label]}>{t("currentPin")}</Text>
        <Text style={styles.hint}>{t("currentPinHint")}</Text>
        {renderPinInputs(
          currentPin,
          setCurrentPin,
          pinRefs.current,
          showCurrent,
          setShowCurrent,
          "currentPin"
        )}

        <Text style={styles.label}>{t("newPin")}</Text>
        <Text style={styles.hint}>{t("newPinHint")}</Text>
        {renderPinInputs(
          newPin,
          setNewPin,
          pinRefs.new,
          showNew,
          setShowNew,
          "newPin"
        )}

        <Text style={styles.label}>{t("confirmPin")}</Text>
        <Text style={styles.hint}>{t("confirmPinHint")}</Text>
        {renderPinInputs(
          confirmPin,
          setConfirmPin,
          pinRefs.confirm,
          showConfirm,
          setShowConfirm,
          "confirmPin"
        )}
      </ScrollView>

      <TouchableOpacity onPress={handleChangePin}>
        <LinearGradient
          colors={theme.colors.gradientBlue}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmText}>{t("update")}</Text>
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
