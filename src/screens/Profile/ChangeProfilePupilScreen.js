import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Image,
    TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { Fonts } from "../../../constants/Fonts";
import { useDispatch, useSelector } from "react-redux";
import { getAllPupils, updatePupilProfile } from "../../redux/pupilSlice";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import FullScreenLoading from "../../components/FullScreenLoading";
import MessageError from "../../components/MessageError";
import MessageSuccess from "../../components/MessageSuccess";

export default function ChangeProfilePupilScreen({ navigation }) {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { t } = useTranslation("profile");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPupil, setSelectedPupil] = useState(null);
    const [editedProfile, setEditedProfile] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentField, setCurrentField] = useState("");
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
    const pupils = useSelector((state) => state.pupil.pupils || []);
    const loading = useSelector((state) => state.pupil.loading);

    useEffect(() => {
        if (isFocused && users?.id) {
            dispatch(getAllPupils(users.id));
        }
    }, [isFocused, users?.id]);

    useEffect(() => {
        if (selectedPupil) {
            const dobSeconds = selectedPupil?.dateOfBirth?.seconds || 0;
            const dobDate = dobSeconds ? new Date(dobSeconds * 1000) : null;
            const isoDate = dobDate ? dobDate.toISOString() : "";

            setEditedProfile({
                fullName: selectedPupil.fullName || "",
                nickName: selectedPupil.nickName || "",
                grade: selectedPupil.grade || "",
                dateOfBirth: isoDate,
                gender: selectedPupil.gender || "", // Lưu giá trị gốc (male/female)
            });
        }
    }, [selectedPupil]);

    const formatDateForDisplay = (isoStr) => {
        if (!isoStr) return t("selectDate");
        const date = new Date(isoStr);
        return isNaN(date) ? t("selectDate") : date.toLocaleDateString("vi-VN");
    };

    const getFormatGender = (gender) => {
        if (!gender) return t("selectOption");
        return gender.toLowerCase() === "male" ? t("male") : t("female");
    };

    const handleChange = (field, value) => {
        setEditedProfile((prev) => ({ ...prev, [field]: value }));
    };
    const validateInputs = () => {
        const requiredFields = [
            { field: "fullName", label: t("fullName") },
            { field: "nickName", label: t("nickName") },
            { field: "grade", label: t("grade") },
            { field: "dateOfBirth", label: t("birthday") },
            { field: "gender", label: t("gender") },
        ];

        for (const { field, label } of requiredFields) {
            if (
                !editedProfile[field] ||
                editedProfile[field] === "none" ||
                editedProfile[field].trim() === ""
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

        // Kiểm tra tuổi dựa trên grade
        const dobDate = new Date(editedProfile.dateOfBirth);
        const age = new Date().getFullYear() - dobDate.getFullYear();
        const grade = parseInt(editedProfile.grade, 10);

        if (isNaN(dobDate.getTime()) || !editedProfile.dateOfBirth) {
            setErrorContent({
                title: t("errorTitle"),
                description: t("invalidDate"),
            });
            setShowError(true);
            return;
        }

        if (
            (grade === 1 && age < 6) ||
            (grade === 2 && age < 7) ||
            (grade === 3 && age < 8)
        ) {
            setErrorContent({
                title: t("errorTitle"),
                description: t("invalidAge", { minAge: grade + 5, grade }),
            });
            setShowError(true);
            return;
        }

        try {
            // Chuẩn bị dữ liệu để gửi lên server
            const profileData = {
                ...editedProfile,
                dateOfBirth: new Date(editedProfile.dateOfBirth).toISOString(),
                gender: editedProfile.gender.toLowerCase(), // Đảm bảo gender là lowercase (male/female)
            };

            await dispatch(
                updatePupilProfile({ id: selectedPupil.id, data: profileData })
            ).unwrap();
            dispatch(getAllPupils(users.id));
            setSuccessContent({
                title: t("successTitle"),
                description: t("profileUpdated"),
            });
            setShowSuccess(true);
            setModalVisible(false);
            setSelectedPupil(null);
        } catch (error) {
            setErrorContent({
                title: t("errorTitle"),
                description: t("updateProfileFailed"),
            });
            setShowError(true);
        }
    };

    const handleDropdownToggle = (fieldName) => {
        setCurrentField((prev) => (prev === fieldName ? "" : fieldName));
    };

    const genderOptions = [
        { display: t("male"), value: "male" },
        { display: t("female"), value: "female" },
    ];

    const pupilFields = [
        { label: t("fullName"), fieldName: "fullName", type: "text" },
        { label: t("nickName"), fieldName: "nickName", type: "text" },
        {
            label: t("grade"),
            fieldName: "grade",
            type: "dropdown",
            options: ["1", "2", "3"],
        },
        { label: t("birthday"), fieldName: "dateOfBirth", type: "date" },
        {
            label: t("gender"),
            fieldName: "gender",
            type: "dropdown",
            options: genderOptions,
        },
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
        backIcon: {
            width: 24,
            height: 24,
        },
        titlelable1: {
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
        },
        titlelable: {
            fontSize: 16,
            fontFamily: Fonts.NUNITO_BOLD,
            color: theme.colors.white,
            textAlign: "center",
        },
        title: {
            fontSize: 28,
            fontFamily: Fonts.NUNITO_BOLD,
            color: theme.colors.white,
            width: "50%",
            textAlign: "center",
        },
        scrollViewContainer: {
            alignItems: "center",
            paddingBottom: 20,
        },
        pupilItem: {
            width: "80%",
            padding: 15,
            borderRadius: 10,
            backgroundColor: theme.colors.paleBeige,
            marginBottom: 10,
            elevation: 3,
        },
        pupilName: {
            fontFamily: Fonts.NUNITO_MEDIUM,
            color: theme.colors.blueGray,
            fontSize: 16,
            textAlign: "center",
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: "center",
        },
        modalContainer: {
            marginHorizontal: 30,
            padding: 20,
            borderRadius: 20,
            backgroundColor: theme.colors.cardBackground,
            elevation: 3,
        },
        textModal: {
            color: theme.colors.blueGray,
            fontSize: 18,
            fontFamily: Fonts.NUNITO_MEDIUM,
            textAlign: "center",
            marginBottom: 20,
        },
        inputGroup: {
            marginBottom: 15,
        },
        inputLabel: {
            fontFamily: Fonts.NUNITO_MEDIUM,
            color: theme.colors.blueGray,
            marginBottom: 5,
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
        dropdownMenu: {
            marginTop: 5,
            borderRadius: 8,
            elevation: 5,
            backgroundColor: theme.colors.inputBoxModal,
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
        buttonText: {
            fontFamily: Fonts.NUNITO_MEDIUM,
            color: theme.colors.white,
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
                <Text style={styles.title}>{t("pupilProfiles")}</Text>
            </LinearGradient>
            <View style={styles.titlelable1}>
                <Text style={styles.titlelable}>{t("selectpupil")}</Text>
            </View>
            {/* Pupil List */}
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {pupils.length === 0 ? (
                    <Text style={styles.pupilName}>{t("noPupilsFound")}</Text>
                ) : (
                    pupils.map((pupil) => (
                        <TouchableOpacity
                            key={pupil.id}
                            style={styles.pupilItem}
                            onPress={() => {
                                setSelectedPupil(pupil);
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.pupilName}>{pupil.fullName}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.textModal}>{t("editPupilProfile")}</Text>
                        <ScrollView>
                            {pupilFields.map((field, index) => (
                                <View key={index} style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>{field.label}</Text>
                                    {field.type === "dropdown" ? (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => handleDropdownToggle(field.fieldName)}
                                                style={styles.dropdownButton}
                                            >
                                                <Text style={styles.dropdownButtonText}>
                                                    {field.fieldName === "gender"
                                                        ? getFormatGender(editedProfile[field.fieldName])
                                                        : editedProfile[field.fieldName] || t("selectOption")}
                                                </Text>
                                            </TouchableOpacity>
                                            {currentField === field.fieldName && (
                                                <View style={styles.dropdownMenu}>
                                                    {field.options.map((opt, i) => (
                                                        <TouchableOpacity
                                                            key={i}
                                                            onPress={() => {
                                                                handleChange(
                                                                    field.fieldName,
                                                                    field.fieldName === "gender" ? opt.value : opt
                                                                );
                                                                setCurrentField("");
                                                            }}
                                                            style={styles.dropdownItem}
                                                        >
                                                            <Text style={styles.dropdownItemText}>
                                                                {field.fieldName === "gender" ? opt.display : opt}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </>
                                    ) : field.type === "date" ? (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => setShowDatePicker(true)}
                                                style={styles.inputBox}
                                            >
                                                <Text
                                                    style={[
                                                        styles.inputTextBox,
                                                        { textAlign: "center", width: "100%" },
                                                    ]}
                                                >
                                                    {formatDateForDisplay(editedProfile.dateOfBirth)}
                                                </Text>
                                            </TouchableOpacity>
                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={
                                                        editedProfile.dateOfBirth
                                                            ? new Date(editedProfile.dateOfBirth)
                                                            : new Date()
                                                    }
                                                    mode="date"
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        setShowDatePicker(false);
                                                        if (selectedDate) {
                                                            handleChange("dateOfBirth", selectedDate.toISOString());
                                                        }
                                                    }}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <View style={styles.inputBox}>
                                            <TextInput
                                                value={editedProfile[field.fieldName]}
                                                onChangeText={(text) =>
                                                    handleChange(field.fieldName, text)
                                                }
                                                style={styles.inputTextBox}
                                                placeholder={t("placeholder", {
                                                    field: field.label.toLowerCase(),
                                                })}
                                                placeholderTextColor={theme.colors.grayMedium}
                                            />
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
                                onPress={() => {
                                    setModalVisible(false);
                                    setSelectedPupil(null);
                                    setCurrentField("");
                                }}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.buttonText}>{t("cancel")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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