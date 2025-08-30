import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import FloatingMenu from "../../components/FloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import {
  profileById,
  updateProfile,
  uploadAvatar,
} from "../../redux/profileSlice";
import * as ImagePicker from "expo-image-picker";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../../components/FullScreenLoading";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";
export default function DetailScreen({ navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const { t } = useTranslation("profile");
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [refreshProfile, setRefreshProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [tempProfile, setTempProfile] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState(null);
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
  const users = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile?.info || {});
  const loading =
    useSelector((state) => state.auth.loading) ||
    useSelector((state) => state.profile.loading);

  useEffect(() => {
    if (isFocused) {
      dispatch(profileById(users.id));
    }
  }, [isFocused, users?.id]);

  useEffect(() => {
    const dobSeconds = profile?.dateOfBirth?.seconds;
    const dobDate = dobSeconds ? new Date(dobSeconds * 1000) : null;
    const formattedBirthday = dobDate ? dobDate.toISOString() : "";
    const initialProfile = {
      fullName: profile.fullName || "none",
      phoneNumber: profile.phoneNumber || "none",
      email: profile.email || "none",
      pin: profile.pin || "none",
      dateOfBirth: formattedBirthday,
      gender: getFormatGender(profile.gender) || "none",
      address: profile.address || "none",
    };
    setEditedProfile(initialProfile);
    setTempProfile(initialProfile);
  }, [profile]);

  const getFormatGender = (gender) => {
    if (!gender) return "none";
    const lowercaseGender = gender.toLowerCase();
    return lowercaseGender === "male" ? t("male") : lowercaseGender === "female" ? t("female") : "none";
  };

  const formatDateString = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return isNaN(date) ? "" : date.toLocaleDateString("vi-VN");
  };

  const handleChange = (field, value) => {
    setTempProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setNewAvatar(uri);

      try {
        await dispatch(uploadAvatar({ id: users.id, uri })).unwrap();
        dispatch(profileById(users.id));
        setSuccessContent({
          title: t("successTitle"),
          description: t("avatarUpdated"),
        });
        setShowSuccess(true);
      } catch (error) {
        setErrorContent({
          title: t("errorTitle"),
          description: t("uploadFailed"),
        });
        setShowError(true);
      }
    }
  };
  const handlePickerDate = (fieldName) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && currentDateField) {
      const selectedYear = selectedDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - selectedYear;

      if (age < 18 || age > 100) {
        setErrorContent({
          title: t("errorTitle"),
          description: t("ageRangeInvalid"),
        });
        setShowError(true);
        return;
      }
      handleChange(currentDateField, selectedDate.toISOString());
    }
  };

  const validateInputs = () => {
    const requiredFields = [
      { field: "fullName", label: t("fullName") },
      { field: "dateOfBirth", label: t("birthday") },
      { field: "gender", label: t("gender") },
      { field: "address", label: t("address") },
    ];

    for (const { field, label } of requiredFields) {
      if (
        !tempProfile[field] ||
        tempProfile[field] === "none" ||
        tempProfile[field].trim() === ""
      ) {
        setErrorContent({
          title: t("errorTitle"),
          description: t("requiredField", { field: label }),
        });
        setShowError(true);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }
    try {
      await dispatch(
        updateProfile({ id: users.id, data: tempProfile })
      ).unwrap();
      setEditedProfile(tempProfile);
      setRefreshProfile((prev) => !prev);
      setSuccessContent({
        title: t("success"),
        description: t("profileUpdated"),
      });
      setShowSuccess(true);
      setModalVisible(false);
    } catch (error) {
      setErrorContent({
        title: t("error"),
        description: t("updateProfileFailed"),
      });
      setShowError(true);
    }
  };
  const handleCancel = () => {
    setTempProfile(editedProfile);
    setModalVisible(false);
    setNewAvatar(null);
  };
  const userFields = [
    { label: t("fullName"), fieldName: "fullName", type: "text" },
    { label: t("birthday"), fieldName: "dateOfBirth", type: "date" },
    {
      label: t("gender"),
      fieldName: "gender",
      type: "dropdown",
      options: [t("male"), t("female")],
    },
    { label: t("address"), fieldName: "address", type: "text" },
  ];

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
      fontSize: 28,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
      width: "50%",
      textAlign: "center",
    },
    scrollViewContainer: {
      alignItems: "center",
    },
    imageWrapper: {
      alignItems: "center",
      marginBottom: 10,
    },
    avatarContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderColor: theme.colors.white,
      borderWidth: 1,
      borderRadius: 50,
      elevation: 3,
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 50,
    },
    fieldWrapper: {
      width: "80%",
      marginBottom: 15,
    },
    fieldLabel: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      fontSize: 18,
      marginBottom: 5,
    },
    fieldBox: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.paleBeige,
      elevation: 3,
    },
    fieldText: {
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.blueGray,
      fontSize: 16,
    },
    editButton: {
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    },
    modalContainer: {
      marginHorizontal: 30,
      padding: 20,
      borderRadius: 20,
      maxHeight: "98%",
      backgroundColor: theme.colors.cardBackground,
      elevation: 3,
    },
    fieldInputWrapper: {
      marginBottom: 15,
    },
    fieldLabelModal: {
      marginBottom: 5,
    },
    dropdownMenu: {
      marginTop: 5,
      borderRadius: 8,
      elevation: 5,
      backgroundColor: theme.colors.inputBoxModal,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
    },
    inputGroup: {
      marginBottom: 15,
    },
    inputLabel: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.blueGray,
      marginBottom: 5,
    },
    editChangeButtonContainer: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.blueGray,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      left: 0,
    },

    editChangeTextButton: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      fontSize: 14,
    },

    dropdownButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.inputBoxModal,
      elevation: 3,
    },
    dropdownButtonText: {
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.blueGray,
    },
    dropdownItem: {
      padding: 10,
      borderBottomColor: theme.colors.grayMedium,
      borderBottomWidth: 1,
    },
    dropdownItemText: {
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.grayDark,
    },
    inputBox: {
      borderRadius: 10,
      backgroundColor: theme.colors.inputBoxModal,
      elevation: 3,
      overflow: "hidden",
      width: "100%",
    },
    inputTextBox: {
      padding: 10,
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.blueGray,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    saveButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.green,
      elevation: 3,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.red,
      elevation: 3,
    },
    buttonText: { fontFamily: Fonts.NUNITO_MEDIUM, color: theme.colors.white },
    carModalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    carModal: {
      backgroundColor: theme.colors.cardBackground,
      padding: 20,
      borderRadius: 20,
      width: "80%",
      height: "95%",
    },
    textModal: {
      color: theme.colors.blueGray,
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      textAlign: "center",
    },
    avatarWrapperModel: {
      marginVertical: 10,
      borderWidth: 2,
      borderColor: theme.colors.white,
      borderRadius: 50,
      backgroundColor: theme.colors.cardBackground,
      elevation: 5,
      alignSelf: "center",
    },
    avatar: { width: 70, height: 70, borderRadius: 40 },
    iconCamera: {
      position: "absolute",
      top: 50,
      left: 120,
      elevation: 5,
    },
  });

  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      {/* Header */}
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
        <Text style={styles.title}>{t("title")}</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.imageWrapper}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                profile?.image
                  ? { uri: profile?.image }
                  : theme.icons.avatarFemale
              }
              style={styles.avatarImage}
            />
          </View>
        </View>

        {userFields.map((field, idx) => (
          <View key={idx} style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.fieldBox}>
              <Text style={styles.fieldText}>
                {field.type === "date"
                  ? formatDateString(tempProfile[field.fieldName])
                  : tempProfile[field.fieldName]}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={
            tempProfile.dateOfBirth
              ? new Date(tempProfile.dateOfBirth)
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={handleDateChange}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <View style={styles.carModalContainer}>
                <View style={styles.carModal}>
                  <Text style={styles.textModal}>{t("editProfile")}</Text>
                  <View style={styles.avatarWrapperModel}>
                    <TouchableOpacity onPress={handlePickImage}>
                      <Image
                        source={
                          newAvatar
                            ? { uri: newAvatar }
                            : profile?.image
                              ? { uri: profile?.image }
                              : theme.icons.avatarFemale
                        }
                        style={styles.avatar}
                      />
                    </TouchableOpacity>
                  </View>
                  <Ionicons
                    name="camera-reverse-sharp"
                    size={28}
                    color={theme.colors.blueGray}
                    style={styles.iconCamera}
                  />
                </View>
              </View>

              {userFields.map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Text style={styles.inputLabel}>{field.label}</Text>
                  </View>

                  {field.type === "dropdown" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setCurrentField(field.fieldName);
                          setMenuVisible((prev) => !prev);
                        }}
                        style={styles.dropdownButton}
                      >
                        <Text style={styles.dropdownButtonText}>
                          {tempProfile[field.fieldName] || t("selectOption")}
                        </Text>
                      </TouchableOpacity>
                      {menuVisible && currentField === field.fieldName && (
                        <View style={styles.dropdownMenu}>
                          {field.options.map((opt, i) => (
                            <TouchableOpacity
                              key={i}
                              onPress={() => {
                                handleChange(field.fieldName, opt);
                                setMenuVisible(false);
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>{opt}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </>
                  ) : field.type === "date" ? (
                    <TouchableOpacity
                      onPress={() => handlePickerDate(field.fieldName)}
                      style={[styles.inputBox, { justifyContent: "center" }]}
                    >
                      <Text style={styles.inputTextBox}>
                        {tempProfile[field.fieldName]
                          ? formatDateString(tempProfile[field.fieldName])
                          : t("selectDate")}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        styles.inputBox,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        },
                        ["phoneNumber", "email", "pin"].includes(
                          field.fieldName
                        ) && {
                          backgroundColor: theme.colors.grayMedium,
                        },
                      ]}
                    >
                      <TextInput
                        value={tempProfile[field.fieldName]}
                        onChangeText={(text) =>
                          handleChange(field.fieldName, text)
                        }
                        editable={
                          !["phoneNumber", "email", "pin"].includes(
                            field.fieldName
                          )
                        }
                        style={[
                          styles.inputTextBox,
                          { flex: 1 },
                          ["phoneNumber", "email", "pin"].includes(
                            field.fieldName
                          ) && {
                            color: theme.colors.graySoft,
                          },
                        ]}
                        placeholder={t("placeholder", {
                          field: field.label.toLowerCase(),
                        })}
                        placeholderTextColor={theme.colors.grayMedium}
                      />

                      {["phoneNumber", "email", "pin"].includes(
                        field.fieldName
                      ) && (
                          <TouchableOpacity
                            onPress={() => {
                              if (field.fieldName === "phoneNumber") {
                                navigation.navigate("ChangePhoneScreen");
                              } else if (field.fieldName === "email") {
                                navigation.navigate("ChangeEmailScreen");
                              } else if (field.fieldName === "pin") {
                                navigation.navigate("ChangePinScreen");
                              }
                            }}
                            style={styles.editChangeButtonContainer}
                          >
                            <Text style={styles.editChangeTextButton}>
                              {t("edit")}
                            </Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.buttonText}>{t("save")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <LinearGradient
          colors={theme.colors.gradientBlue}
          style={styles.editButton}
        >
          <Text style={styles.fieldLabel}>{t("edit")}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <FloatingMenu />
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
        onClose={() => setShowSuccess(false)}
      />
    </LinearGradient>
  );
}