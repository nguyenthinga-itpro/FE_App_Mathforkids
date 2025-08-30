import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import Ionicons from "react-native-vector-icons/Ionicons";
import FloatingMenu from "../components/FloatingMenu";
import { pupilByUserId } from "../redux/pupilSlice";
import {
  Modal,
  Portal,
  Button,
  Checkbox,
  RadioButton,
} from "react-native-paper";
import { getRewardByDisabledStatus } from "../redux/rewardSlice";
import {
  createGoal,
  getLessonsByGradeAndTypeFiltered,
  getGoalsWithin30Days,
  getEnabledLevels,
  getAvailableLessons,
} from "../redux/goalSlice";
import { useTranslation } from "react-i18next";
import { createPupilNotification } from "../redux/pupilNotificationSlice";
import { createUserNotification } from "../redux/userNotificationSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import FullScreenLoading from "../components/FullScreenLoading";
import MessageError from "../components/MessageError";
import MessageSuccess from "../components/MessageSuccess";
export default function GoalScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [selectedAccount, setSelectedAccount] = useState();
  const [errors, setErrors] = useState({
    dateStart: "",
    dateEnd: "",
  });
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [skillType, setSkillType] = useState("");
  const [lesson, setLesson] = useState(null);
  const [reward, setReward] = useState(null);
  const [exercise, setExercise] = useState([]);
  const [rewardQuantity, setRewardQuantity] = useState();
  const quantityOptions = ["3", "5", "7"];
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const dispatch = useDispatch();
  const { pupils, pupilloading } = useSelector((state) => state.pupil);
  const { user, authloading } = useSelector((state) => state.auth);
  const { rewards, rewardloading } = useSelector((state) => state.reward);
  const loading = pupilloading || authloading || rewardloading;
  const { filteredLessons, enabledLevels, availableLessons } = useSelector(
    (state) => state.goal
  );
  const { t, i18n } = useTranslation("goal");
  // console.log("filteredLessons", filteredLessons);
  // console.log("availableLessons", availableLessons);
  useEffect(() => {
    dispatch(getRewardByDisabledStatus());
    dispatch(getEnabledLevels());
    dispatch(pupilByUserId(user?.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const selectedPupil = pupils?.find((p) => p.id === selectedAccount);
    if (selectedPupil && skillType) {
      dispatch(
        getLessonsByGradeAndTypeFiltered({
          grade: parseInt(selectedPupil.grade),
          type: skillType.toLowerCase(),
          pupilId: selectedPupil.id,
        })
      );
      dispatch(getGoalsWithin30Days(selectedPupil.id));
    }
  }, [skillType, selectedAccount]);
  // useEffect(() => {
  //   const selectedPupil = pupils?.find((p) => p.id === selectedAccount);
  //   if (selectedPupil && skillType && lesson && startDate && endDate) {
  //     const formattedStart = startDate.toISOString().split("T")[0];
  //     const formattedEnd = endDate.toISOString().split("T")[0];
  //     dispatch(
  //       getAvailableLessons({
  //         pupilId: selectedPupil.id,
  //         skillType,
  //         startDate: formattedStart,
  //         endDate: formattedEnd,
  //       })
  //     );
  //   }
  // }, [selectedAccount, skillType, lesson, startDate, endDate]);
  useEffect(() => {
    const selectedPupil = pupils?.find((p) => p.id === selectedAccount);
    if (selectedPupil && skillType && startDate && endDate) {
      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = endDate.toISOString().split("T")[0];
      dispatch(
        getAvailableLessons({
          pupilId: selectedPupil.id,
          skillType,
          startDate: formattedStart,
          endDate: formattedEnd,
        })
      );
    }
  }, [selectedAccount, skillType, startDate, endDate]);

  const handleSaveGoal = async () => {
    const newErrors = {};
    if (!selectedAccount) newErrors.selectedAccount = t("selectAccountError");
    if (!skillType) newErrors.skillType = t("selectSkillTypeError");
    if (!lesson) newErrors.lesson = t("selectLessonError");
    if (exercise.length === 0) newErrors.exercise = t("selectExerciseError");
    if (!reward) newErrors.reward = t("selectRewardError");
    if (!rewardQuantity)
      newErrors.rewardQuantity = t("selectRewardQuantityError");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const goalData = {
      pupilId: selectedAccount,
      skillType,
      exercise,
      lessonId: lesson?.id,
      rewardId: reward?.id,
      dateStart: startDate.toISOString(),
      dateEnd: endDate.toISOString(),
      rewardQuantity,
    };

    try {
      // await dispatch(createGoal(goalData)).unwrap();
      const goalCreated = await dispatch(createGoal(goalData)).unwrap();
      // console.log("goalCreated", goalCreated.id);
      const now = new Date();
      const createdAt = now.toISOString();
      const updatedAt = now.toISOString();
      const selectedPupil = pupils?.find((p) => p.id === selectedAccount);
      const mapExerciseNames = (lang) =>
        exercise
          .map((id) => {
            const level = enabledLevels.find((lvl) => lvl.id === id);
            return level?.name?.[lang] || id;
          })
          .join(", ");

      // Notification cho phụ huynh
      // Hàm tạo nội dung
      const buildNotificationText = (templateKey, lang, values) =>
        i18n.getFixedT(lang)(templateKey, values);

      //Hàm title/content
      const buildMultilangText = (templateKey, values) => ({
        en: buildNotificationText(templateKey, "en", values.en),
        vi: buildNotificationText(templateKey, "vi", values.vi),
      });
      //dùng chung
      const titleValues = {
        en: { skill: skillType, lesson: lesson?.name?.en },
        vi: { skill: skillType, lesson: lesson?.name?.vi },
      };
      const contentValues = {
        en: {
          dateStart: formatDate(startDate),
          dateEnd: formatDate(endDate),
          skill: i18n.getFixedT("en")(`skill_${skillType}`),
          lesson: lesson?.name?.en,
          level: mapExerciseNames("en"),
          reward: reward?.name?.en,
          quantity: rewardQuantity,
        },
        vi: {
          dateStart: formatDate(startDate),
          dateEnd: formatDate(endDate),
          skill: i18n.getFixedT("vi")(`skill_${skillType}`),
          lesson: lesson?.name?.vi,
          level: mapExerciseNames("vi"),
          reward: reward?.name?.vi,
          quantity: rewardQuantity,
        },
      };
      // Notification cho phụ huynh
      dispatch(
        createUserNotification({
          userId: user.id,
          title: buildMultilangText("notifyGoalCreatedTitle", titleValues),
          content: buildMultilangText(
            "notifyGoalCreatedContent",
            contentValues
          ),
          isRead: false,
          createdAt,
          updatedAt,
        })
      );

      // Notification cho học sinh
      dispatch(
        createPupilNotification({
          pupilId: selectedAccount,
          goalId: goalCreated.id,
          title: buildMultilangText("notifyNewGoalTitle", titleValues),
          content: buildMultilangText("notifyNewGoalContent", contentValues),
          isRead: false,
          createdAt,
          updatedAt,
        })
      );

      // Refetch toàn bộ dữ liệu
      if (selectedPupil) {
        const formattedStart = startDate.toISOString().split("T")[0];
        const formattedEnd = endDate.toISOString().split("T")[0];

        dispatch(getRewardByDisabledStatus());
        dispatch(getEnabledLevels());
        dispatch(pupilByUserId(user?.id));
        dispatch(getGoalsWithin30Days(selectedPupil.id));
        dispatch(
          getLessonsByGradeAndTypeFiltered({
            grade: parseInt(selectedPupil.grade),
            type: skillType.toLowerCase(),
            pupilId: selectedPupil.id,
          })
        );
        dispatch(
          getAvailableLessons({
            pupilId: selectedPupil.id,
            skillType,
            startDate: formattedStart,
            endDate: formattedEnd,
          })
        );
      }
      setErrors({ dateStart: "", dateEnd: "" });
      setSuccessContent({
        title: t("success"),
        description: t("confirmSubmissionDescription"),
      });
      setShowSuccess(true);
    } catch (err) {
      setErrorContent({
        title: t("error"),
        description: t("errorDescription"),
      });
      setShowError(true);
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  //An nhung bai hoc du level
  const filteredAvailableLessons = filteredLessons.filter((lesson) => {
    const available = availableLessons?.find((a) => a.lessonId === lesson.id);
    if (!available) return true; // nếu chưa có dữ liệu -> cho hiện
    return available.disabledExercises.length < enabledLevels.length; // chỉ hiện nếu chưa đủ level
  });
  //Lấy danh sách level bị disable của bài học đang chọn
  const getDisabledExercisesByLesson = (lessonId) => {
    const match = availableLessons?.find((a) => a.lessonId === lessonId);
    return match?.disabledExercises || [];
  };
  const getLessonGradient = (lessonId) => {
    const found = filteredAvailableLessons?.find((a) => a.id === lessonId);
    // console.log("filteredAvailableLessons", filteredAvailableLessons);
    // console.log("found", found);
    if (!found) return theme.colors.gradientPurple;
    if (found.isBlock && !found.isCompleted) return theme.colors.gradientOrange;
    if (!found.isBlock && found.isCompleted) return theme.colors.gradientGreen;
    return theme.colors.gradientBluePrimary;
  };
  const getLessonLabel = (lessonId) => {
    const found = filteredAvailableLessons?.find((a) => a.id === lessonId);
    if (!found) return t("lessonNotStarted");
    if (found.isBlock && !found.isCompleted) return t("lessonLocked");
    if (!found.isBlock && found.isCompleted) return t("lessonCompleted");
    return t("lessonInProgress");
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
    backIcon: { width: 24, height: 24 },
    title: {
      fontSize: 30,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    labelTitle: {
      fontSize: 24,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "center",
    },
    label: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      marginLeft: 10,
      marginTop: 10,
    },
    accountScrollContainer: {
      paddingLeft: 60,
      paddingVertical: 6,
      paddingRight: 20,
    },
    accountButton: {
      backgroundColor: theme.colors.grayLight,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginRight: 10,
    },
    selectedAccount: { backgroundColor: theme.colors.green },
    accountText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    selectedAccountText: { color: theme.colors.white },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 10,
    },
    dateInput: { flex: 0.45 },
    input: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.cardBackground,
      padding: 10,
      borderRadius: 20,
      textAlign: "center",
      borderWidth: 1,
      borderColor: theme.colors.blueDark,
      marginHorizontal: 10,
      marginBottom: 10,
      color: theme.colors.black,
    },
    saveButton: {
      padding: 14,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      alignItems: "center",
      marginTop: 20,
    },
    saveText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      fontSize: 16,
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
    },
    modalBox: {
      width: "80%",
      height: "65%",
      backgroundColor: "#fff",
      borderRadius: 20,
      paddingVertical: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.blueDark,
      elevation: 3,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginBottom: 16,
    },
    modalButton: {
      width: "100%",
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.blueDark,
      marginVertical: 10,
      overflow: "hidden",
      elevation: 3,
    },
    modalButtonText: {
      textAlign: "center",
      width: "100%",
      color: theme.colors.white,
      fontSize: 16,
      padding: 10,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    labelValueContainer: {
      flexDirection: "column",
      flex: 1,
    },

    rewardContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      padding: 10,
      gap: 10,
    },
    rewardImage: {
      width: 40,
      height: 40,
      marginRight: 10,
      marginLeft: 20,
      borderRadius: 8,
    },
  });
  const renderOptionModal = (title, options, onSelect, onClose) => (
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
        <Text style={styles.modalTitle}>{title}</Text>
        <ScrollView style={{ width: "100%" }}>
          {options.map((item) => (
            <LinearGradient
              key={item.value?.id || item.label}
              colors={
                title === t("selectLesson")
                  ? getLessonGradient(item.value?.id)
                  : theme.colors.gradientBluePrimary
              }
              style={styles.modalButton}
            >
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                style={styles.rewardContainer}
              >
                {item.image && (
                  <Image
                    source={item.image}
                    style={styles.rewardImage}
                    resizeMode="contain"
                  />
                )}
                {title === t("selectLesson") && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: theme.colors.grayDark,
                      position: "absolute",
                      top: 5,
                      right: 10,
                    }}
                  >
                    {getLessonLabel(item.value?.id)}
                  </Text>
                )}

                <View style={styles.labelValueContainer}>
                  <Text
                    style={styles.modalButtonText}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
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
        <Text style={styles.title}>{t("setGoal")}</Text>
      </LinearGradient>

      <ScrollView>
        <Text style={styles.labelTitle}>{t("selectAccount")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountScrollContainer}
        >
          {pupils.map((pupil) => (
            <TouchableOpacity
              key={pupil.id}
              style={[
                styles.accountButton,
                selectedAccount === pupil.id && styles.selectedAccount,
              ]}
              onPress={() => setSelectedAccount(pupil.id)}
            >
              <Text
                style={[
                  styles.accountText,
                  selectedAccount === pupil.id && styles.selectedAccountText,
                ]}
              >
                {pupil.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.selectedAccount && (
          <Text style={{ color: theme.colors.red, textAlign: "center" }}>
            {errors.selectedAccount}
          </Text>
        )}
        <View style={styles.dateRow}>
          {/* Start Date */}
          <View style={styles.dateInput}>
            <Text style={styles.label}>{t("dateStart")}</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                value={formatDate(startDate)}
                editable={false}
                style={styles.input}
              />
            </TouchableOpacity>
            {errors.dateStart ? (
              <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
                {errors.dateStart}
              </Text>
            ) : null}
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (event.type === "set" && selectedDate) {
                    const minStartDate = new Date(endDate);
                    minStartDate.setDate(endDate.getDate() - 7);

                    if (selectedDate < minStartDate) {
                      setErrors((prev) => ({
                        ...prev,
                        dateStart: t("alertStartTooEarly"),
                      }));
                      return;
                    }
                    if (selectedDate > endDate) {
                      setErrors((prev) => ({
                        ...prev,
                        dateStart: t("alertStartAfterEnd"),
                      }));
                      return;
                    }
                    if (selectedDate < new Date()) {
                      setErrors((prev) => ({
                        ...prev,
                        dateStart: t("alertStartBeforeToday"),
                      }));
                      return;
                    }

                    setErrors((prev) => ({ ...prev, dateStart: "" }));
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* End Date */}
          <View style={styles.dateInput}>
            <Text style={styles.label}>{t("dateEnd")}</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                value={formatDate(endDate)}
                editable={false}
                style={styles.input}
              />
            </TouchableOpacity>
            {errors.dateEnd ? (
              <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
                {errors.dateEnd}
              </Text>
            ) : null}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (event.type === "set" && selectedDate) {
                    const maxEndDate = new Date(startDate);
                    maxEndDate.setDate(startDate.getDate() + 7);

                    if (selectedDate > maxEndDate) {
                      setErrors((prev) => ({
                        ...prev,
                        dateEnd: t("alertDateLimit"),
                      }));
                      return;
                    }
                    if (selectedDate < startDate) {
                      setErrors((prev) => ({
                        ...prev,
                        dateEnd: t("alertDateStartDate"),
                      }));
                      return;
                    }

                    setErrors((prev) => ({ ...prev, dateEnd: "" }));
                    setEndDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
        </View>

        <Text style={styles.label}>{t("selectSkillType")}</Text>
        <TouchableOpacity
          onPress={() => setShowSkillModal(true)}
          style={styles.input}
        >
          <Text
            style={{
              color: theme.colors.black,
            }}
          >
            {skillType ? t(`skill_${skillType}`) : t("selectSkillType")}
          </Text>

          <Ionicons
            name="caret-down-outline"
            size={24}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        {errors.skillType && (
          <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
            {errors.skillType}
          </Text>
        )}
        <Text style={styles.label}>{t("lesson")}</Text>
        <TouchableOpacity
          onPress={() => setShowLessonModal(true)}
          style={styles.input}
        >
          <Text
            style={{
              color: theme.colors.black,
            }}
          >
            {lesson?.name?.[i18n.language] ||
              lesson?.name?.en ||
              t("selectLesson")}
          </Text>
          <Ionicons
            name="caret-down-outline"
            size={24}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        {errors.lesson && (
          <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
            {errors.lesson}
          </Text>
        )}
        <Text style={styles.label}>{t("exercise")}</Text>
        <TouchableOpacity
          onPress={() => setShowExerciseModal(true)}
          style={styles.input}
        >
          <Text
            style={{
              color: theme.colors.black,
            }}
          >
            {exercise.length > 0
              ? exercise
                  .map(
                    (id) =>
                      enabledLevels?.find((lvl) => lvl.id === id)?.name[
                        i18n.language
                      ] || id
                  )
                  .join(", ")
              : t("selectLevel")}
          </Text>

          <Ionicons
            name="caret-down-outline"
            size={24}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        {errors.exercise && (
          <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
            {errors.exercise}
          </Text>
        )}
        <Text style={styles.label}>{t("reward")}</Text>
        <TouchableOpacity
          onPress={() => setShowRewardModal(true)}
          style={styles.input}
        >
          <Text
            style={{
              color: theme.colors.black,
            }}
          >
            {reward?.name?.[i18n.language] ||
              reward?.name?.en ||
              t("selectReward")}
          </Text>
          <Ionicons
            name="caret-down-outline"
            size={24}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        {errors.reward && (
          <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
            {errors.reward}
          </Text>
        )}
        <Text style={styles.label}>{t("selectRewardQuantity")}</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setRewardQuantity(newValue)}
          value={rewardQuantity}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {quantityOptions.map((qty) => (
              <View
                key={qty}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <RadioButton value={qty} color={theme.colors.white} />
                <Text style={{ color: theme.colors.white }}>{qty}</Text>
              </View>
            ))}
          </View>
          {errors.rewardQuantity && (
            <Text style={{ color: theme.colors.red, marginLeft: 12 }}>
              {errors.rewardQuantity}
            </Text>
          )}
        </RadioButton.Group>
      </ScrollView>

      <LinearGradient
        colors={theme.colors.gradientBlue}
        style={styles.saveButton}
      >
        <TouchableOpacity onPress={handleSaveGoal}>
          <Text style={styles.saveText}>{t("save")}</Text>
        </TouchableOpacity>
      </LinearGradient>

      {showSkillModal &&
        renderOptionModal(
          t("selectSkillTypeTitle"),
          [
            { label: t("skill_Addition"), value: "Addition" },
            { label: t("skill_Subtraction"), value: "Subtraction" },
            { label: t("skill_Multiplication"), value: "Multiplication" },
            { label: t("skill_Division"), value: "Division" },
            {
              label: t("skill_Multiplications"),
              value: "Multiplications table",
            },
          ],
          setSkillType,
          () => setShowSkillModal(false)
        )}

      {showLessonModal &&
        renderOptionModal(
          t("selectLesson"),
          (filteredAvailableLessons || []).map((l) => ({
            label: l.name?.[i18n.language] || l.name?.en || t("unnamedLesson"),
            value: { id: l.id, name: l.name },
          })),
          setLesson,
          () => setShowLessonModal(false)
        )}

      <Portal>
        <Modal
          visible={showExerciseModal}
          onDismiss={() => setShowExerciseModal(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.cardBackground,
            margin: 20,
            padding: 20,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            {t("selectLevel")}
          </Text>

          {enabledLevels.map((level) => {
            const isDisabled = getDisabledExercisesByLesson(
              lesson?.id
            ).includes(level.id);
            const isSelected = exercise.includes(level.id);

            return (
              <View
                key={level.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                <Checkbox
                  status={isSelected ? "checked" : "unchecked"}
                  onPress={() => {
                    if (isDisabled) return;
                    setExercise((prev) =>
                      isSelected
                        ? prev.filter((l) => l !== level.id)
                        : [...prev, level.id]
                    );
                  }}
                  disabled={isDisabled}
                  color={theme.colors.blueDark}
                />
                <Text>{level.name[i18n.language]}</Text>
              </View>
            );
          })}
        </Modal>
      </Portal>

      {showRewardModal &&
        renderOptionModal(
          t("selectReward"),
          rewards.map((r) => ({
            label: r.name?.[i18n.language] || r.name?.en || t("unnamed"),
            value: { id: r.id, name: r.name },
            image: r.image ? { uri: r.image } : undefined,
          })),
          setReward,
          () => setShowRewardModal(false)
        )}

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
        onClose={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />
    </LinearGradient>
  );
}
