import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import FloatingMenu from "../../components/FloatingMenu";
import FullScreenLoading from "../../components/FullScreenLoading";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";
import { useDispatch, useSelector } from "react-redux";
import {
  pupilById,
  uploadPupilAvatar,
} from "../../redux/profileSlice";
import * as ImagePicker from "expo-image-picker";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function ProfilePupilScreen({ navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const { t } = useTranslation("profile");
  const { t: c } = useTranslation("common");
  const [newAvatar, setNewAvatar] = useState(null);
  const [refreshProfile, setRefreshProfile] = useState(false);
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

  const pupilId = useSelector((state) => state.auth.user?.pupilId);
  const pupil = useSelector((state) => state.profile.info);
  const loading = useSelector((state) => state.profile.loading);

  useEffect(() => {
    if (pupilId) {
      dispatch(pupilById(pupilId));
    }
  }, [pupilId]);

  useEffect(() => {
    if (isFocused && pupilId) {
      dispatch(pupilById(pupilId));
    }
  }, [isFocused, pupilId, refreshProfile]);

  const getFormatGender = (gender) => {
    if (!gender) return "none";
    const lowercaseGender = gender.toLowerCase();
    return lowercaseGender === "male" ? c("male") : lowercaseGender === "female" ? c("female") : "none";
  };

  const formatDateString = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return isNaN(date) ? "" : date.toLocaleDateString("vi-VN");
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
        await dispatch(uploadPupilAvatar({ id: pupilId, uri })).unwrap();
        dispatch(pupilById(pupilId));
        setRefreshProfile((prev) => !prev);
        setSuccessContent({
          title: c("success"),
          description: t("avatarUpdated"),
        });
        setShowSuccess(true);
      } catch (error) {
        setErrorContent({
          title: c("error"),
          description: error.message || t("avatarUpdateFailed"),
        });
        setShowError(true);
      }
    }
  };

  const userFields = [
    { label: t("fullName"), fieldName: "fullName", type: "text" },
    { label: t("birthday"), fieldName: "dateOfBirth", type: "date" },
    { label: t("gender"), fieldName: "gender", type: "text" },
    { label: t("grade"), fieldName: "grade", type: "text" },
  ];

  const profileData = {
    fullName: pupil.fullName || "none",
    grade: pupil.grade || "none",
    dateOfBirth: pupil.dateOfBirth?.seconds
      ? new Date(pupil.dateOfBirth.seconds * 1000).toISOString()
      : "",
    gender: getFormatGender(pupil.gender),
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
      fontSize: 36,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
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
      top: 0,
      left: 55,
      elevation: 5,
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
          <View style={styles.avatarWrapperModel}>
            <TouchableOpacity onPress={handlePickImage}>
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    newAvatar
                      ? { uri: newAvatar }
                      : pupil.image
                        ? { uri: pupil.image }
                        : theme.icons.avatarFemale
                  }
                  style={styles.avatar}
                />
                <Ionicons
                  name="camera-reverse-sharp"
                  size={28}
                  color={theme.colors.blueGray}
                  style={styles.iconCamera}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {userFields.map((field, idx) => (
          <View key={idx} style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.fieldBox}>
              <Text style={styles.fieldText}>
                {field.type === "date"
                  ? formatDateString(profileData[field.fieldName])
                  : profileData[field.fieldName]}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

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