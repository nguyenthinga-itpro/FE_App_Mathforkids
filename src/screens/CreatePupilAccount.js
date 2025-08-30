import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "../../constants/Fonts";
import { useTheme } from "../themes/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { createPupil } from "../redux/pupilSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RadioButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../components/FullScreenLoading";
import MessageError from "../components/MessageError";
import MessageSuccess from "../components/MessageSuccess";
export default function CreatePupilAccountScreen({ navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?.id);
  // console.log("userId", userId);
  const [fullName, setFullName] = useState("");
  const [nickName, setNickName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthdayDate, setBirthdayDate] = useState(null); // Date object
  const [gender, setGender] = useState("female");
  const [focusedField, setFocusedField] = useState(null);
  const { t, i18n } = useTranslation("createpupilaccount");
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
  const [isLoading, setIsLoading] = useState(false);

  const onCreate = async () => {
    try {
      setIsLoading(true);
      const newErrors = {};
      if (!userId) {
        setErrorContent({
          title: t("errorTitle"),
          description: t("userNotFound"),
        });
        setShowError(true);
        return;
      }

      if (!fullName.trim()) {
        newErrors.fullName = t("fullNameRequired");
      }
      if (!nickName.trim()) {
        newErrors.nickName = t("nickNameRequired");
      }
      if (!studentClass) {
        newErrors.studentClass = t("gradeRequired");
      }

      if (!birthdayDate) {
        newErrors.birthday = t("birthdayRequired");
      }

      const today = new Date();
      const age =
        today.getFullYear() -
        (birthdayDate?.getFullYear() || 0) -
        (today <
        new Date(
          today.getFullYear(),
          birthdayDate?.getMonth(),
          birthdayDate?.getDate()
        )
          ? 1
          : 0);

      const minAgeForGrade = {
        1: 6,
        2: 7,
        3: 8,
      };

      if (birthdayDate && (age <= 1 || age >= 100)) {
        newErrors.birthday = t("ageBetween", { min: 1, max: 100 });
      }

      if (birthdayDate && age < minAgeForGrade[studentClass]) {
        newErrors.birthday = t("gradeAgeInvalid", {
          grade: studentClass,
          age: minAgeForGrade[studentClass],
        });
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      const formattedBirthday = birthdayDate.toISOString().split("T")[0];

      const data = {
        userId,
        fullName: fullName.trim(),
        nickName: nickName.trim(),
        image: "",
        gender,
        dateOfBirth: formattedBirthday,
        grade: studentClass,
        isDisabled: false,
      };

      await dispatch(createPupil(data)).unwrap();

      setSuccessContent({
        title: t("successTitle"),
        description: t("createPupilSuccess"),
      });
      setShowSuccess(true);
    } catch (error) {
      const msg =
        typeof error === "object"
          ? error[i18n.language] ?? error.en
          : error.message || error.toString();
      setErrorContent({
        title: t("errorTitle"),
        description: msg,
      });
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: {
      backgroundColor: theme.colors.cardBackground,
      width: "80%",
      padding: 30,
      paddingVertical: 80,
      alignItems: "center",
      elevation: 10,
      marginTop: 15,
    },
    title: {
      position: "absolute",
      top: 30,
      fontSize: 28,
      color: theme.colors.blueDark,
      fontFamily: Fonts.NUNITO_BOLD,
    },
    label: {
      width: "100%",
      fontSize: 16,
      color: theme.colors.black,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginBottom: 15,
    },
    inputWrapper: {
      width: "100%",
      height: 48,
      backgroundColor: theme.colors.paleBeige,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.colors.white,
      justifyContent: "center",
      elevation: 4,
    },
    input: {
      fontSize: 16,
      color: theme.colors.black,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    checkboxGroup: {
      width: "100%",
      flexDirection: "row",
      // justifyContent: "space-around",
      alignItems: "center",
      marginBottom: 10,
      gap: 50,
    },
    checkboxItem: {
      flexDirection: "row",
      alignItems: "center",
    },

    checkboxLabel: {
      marginLeft: 6,
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 16,
      color: theme.colors.grayMedium,
    },
    buttonRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      // paddingBottom: 30,
    },
    buttonWrapper: {
      width: "40%",
      borderRadius: 10,
      elevation: 6,
    },
    button: {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 16,
      color: theme.colors.white,
    },
    inputWrapperContainer: {
      width: 250,
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
          <Text style={styles.title}>{t("createPupilTitle")}</Text>

          {/* Full Name */}
          <View style={styles.inputWrapperContainer}>
            <Text style={styles.label}>{t("fullName")}</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === "fullName" && {
                  borderColor: theme.colors.blueDark,
                  elevation: 8,
                },
              ]}
            >
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholder={t("enterFullName")}
                placeholderTextColor={theme.colors.grayMedium}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.fullName && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
                {errors.fullName}
              </Text>
            )}
          </View>

          {/* Nickname */}
          <View style={styles.inputWrapperContainer}>
            <Text style={styles.label}>{t("nickName")}</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === "nickName" && {
                  borderColor: theme.colors.blueDark,
                  elevation: 8,
                },
              ]}
            >
              <TextInput
                value={nickName}
                onChangeText={setNickName}
                style={styles.input}
                placeholder={t("enterNickName")}
                placeholderTextColor={theme.colors.grayMedium}
                onFocus={() => setFocusedField("nickName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.nickName && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
                {errors.nickName}
              </Text>
            )}
          </View>

          {/* Grade */}
          <View style={styles.inputWrapperContainer}>
            <Text style={styles.label}>{t("grade")}</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === "class" && {
                  borderColor: theme.colors.blueDark,
                  elevation: 8,
                },
              ]}
            >
              <Picker
                selectedValue={studentClass}
                onValueChange={(itemValue) => setStudentClass(itemValue)}
                dropdownIconColor={theme.colors.black}
                style={[styles.input, { paddingLeft: 0 }]}
              >
                <Picker.Item
                  label={t("selectGrade")}
                  value=""
                  color={theme.colors.grayMedium}
                />
                <Picker.Item label={t("grade_1", { number: 1 })} value="1" />
                <Picker.Item label={t("grade_2", { number: 2 })} value="2" />
                <Picker.Item label={t("grade_3", { number: 3 })} value="3" />
              </Picker>
            </View>
            {errors.studentClass && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
                {errors.studentClass}
              </Text>
            )}
          </View>

          {/* Birthday */}
          <View style={styles.inputWrapperContainer}>
            <Text style={styles.label}>{t("birthday")}</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.inputWrapper,
                focusedField === "birthday" && {
                  borderColor: theme.colors.blueDark,
                  elevation: 8,
                },
              ]}
            >
              <Text
                style={[
                  styles.input,
                  {
                    color: birthdayDate
                      ? theme.colors.grayDark
                      : theme.colors.grayMedium,
                  },
                ]}
              >
                {birthdayDate
                  ? birthdayDate.toISOString().split("T")[0]
                  : t("selectBirthday")}
              </Text>
            </TouchableOpacity>
            {errors.birthday && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
                {errors.birthday}
              </Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={birthdayDate || new Date(2015, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setBirthdayDate(selectedDate);
                }
              }}
            />
          )}

          {/* Gender */}
          <View style={styles.inputWrapperContainer}>
            <Text style={styles.label}>{t("gender")}</Text>
            <RadioButton.Group
              onValueChange={(value) => setGender(value)}
              value={gender}
            >
              <View style={styles.checkboxGroup}>
                <View style={styles.checkboxItem}>
                  <RadioButton
                    value="female"
                    color={theme.colors.checkBoxBackground}
                  />
                  <Text style={styles.checkboxLabel}>{t("female")}</Text>
                </View>
                <View style={styles.checkboxItem}>
                  <RadioButton
                    value="male"
                    color={theme.colors.checkBoxBackground}
                  />
                  <Text style={styles.checkboxLabel}>{t("male")}</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonWrapper}
              onPress={() => navigation.goBack()}
            >
              <View
                style={[styles.button, { backgroundColor: theme.colors.red }]}
              >
                <Text style={styles.buttonText}>{t("cancel")}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonWrapper}
              onPress={onCreate}
            >
              <View
                style={[styles.button, { backgroundColor: theme.colors.green }]}
              >
                <Text style={styles.buttonText}>{t("create")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <FullScreenLoading visible={isLoading} color={theme.colors.white} />
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
            navigation.goBack();
          }}
        />
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}
