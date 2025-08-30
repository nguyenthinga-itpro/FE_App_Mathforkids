import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import FloatingMenu from "../components/FloatingMenu";
import Markdown from "react-native-markdown-display";
import {
  notificationsByUserId,
  updateNotification,
} from "../redux/userNotificationSlice";
import {
  notificationsByPupilId,
  updatePupilNotification,
  createPupilNotification,
} from "../redux/pupilNotificationSlice";
import { getExchangeReward, updateExchangeReward } from "../redux/rewardSlice";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../components/FullScreenLoading";
import MessageError from "../components/MessageError";
import MessageSuccess from "../components/MessageSuccess";

export default function NotificationScreen({ navigation, route }) {
  const { theme, isDarkMode } = useTheme();
  const { userId, pupilId } = route.params || {};
  const [expandedId, setExpandedId] = useState(null);
  const [rewardData, setRewardData] = useState({});
  const user = useSelector((state) => state.auth.user);

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
  const { t, i18n } = useTranslation("notification");
  const userNotifications = useSelector(
    (state) => state.notifications?.list || []
  );
  const loading = useSelector((state) => state.notifications.loading);
  const pupilNotifications = useSelector(
    (state) => state.pupilnotifications?.list || []
  );
  const notificationsToDisplay = pupilId
    ? pupilNotifications
    : userNotifications;

  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const buildNotificationText = (templateKey, lang, values) =>
    t(templateKey, { ...values, lng: lang });

  const buildMultilangText = (templateKey, values) => ({
    en: buildNotificationText(templateKey, "en", values.en),
    vi: buildNotificationText(templateKey, "vi", values.vi),
  });

  useEffect(() => {
    if (isFocused) {
      if (pupilId) {
        dispatch(notificationsByPupilId(pupilId));
      } else if (userId) {
        dispatch(notificationsByUserId(userId));
      }
    }
  }, [isFocused, pupilId, userId]);

  useEffect(() => {
    const fetchRewards = async () => {
      const rewards = {};
      for (const notification of notificationsToDisplay) {
        if (notification.exchangedRewardId) {
          try {
            const result = await dispatch(
              getExchangeReward(notification.exchangedRewardId)
            ).unwrap();
            rewards[notification.exchangedRewardId] = result;
          } catch (err) {
            console.error("Failed to fetch reward:", err);
          }
        }
      }
      setRewardData(rewards);
    };

    if (notificationsToDisplay.length > 0) {
      fetchRewards();
    }
  }, [notificationsToDisplay, dispatch]);

  const handlePress = async (id) => {
    const selected = notificationsToDisplay.find((n) => n.id === id);
    if (selected && !selected.isRead) {
      try {
        if (pupilId) {
          await dispatch(
            updatePupilNotification({ id, data: { ...selected, isRead: true } })
          ).unwrap();
          dispatch(notificationsByPupilId(pupilId));
        } else {
          await dispatch(
            updateNotification({ id, data: { ...selected, isRead: true } })
          ).unwrap();
          dispatch(notificationsByUserId(user.id));
        }
      } catch (err) {
        console.error("Failed to update notification:", err);
      }
    }
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (value) => {
    try {
      if (!value) return "Invalid Date";
      let date;
      if (value.seconds && typeof value.seconds === "number") {
        date = new Date(value.seconds * 1000);
      }
      return date && !isNaN(date.getTime())
        ? date.toLocaleDateString("en-GB")
        : "Invalid Date";
    } catch (err) {
      return "Invalid Date";
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
      fontSize: 36,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    notificationCard: {
      marginHorizontal: 30,
      padding: 5,
      backgroundColor: theme.colors.paleBeige,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.white,
      marginBottom: 20,
      elevation: 4,
    },
    notificationTitle: {
      fontSize: 16,
      padding: 10,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    notificationDateEnd: {
      position: "absolute",
      bottom: 0,
      right: 10,
      fontSize: 10,
      fontFamily: Fonts.NUNITO_MEDIUM_ITALIC,
      color: theme.colors.blueGray,
    },
    notificationContentContainer: {
      alignItems: "center",
    },
    notificationContent: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    notificationIcon: {
      position: "absolute",
      top: 10,
      right: 10,
      borderRadius: 50,
      padding: 5,
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
          onPress={() => navigation.goBack()}
        >
          <Image
            source={theme.icons.back}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t("notification")}</Text>
      </LinearGradient>

      <FlatList
        style={{ paddingTop: 10 }}
        data={notificationsToDisplay}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.notificationCard}
            onPress={() => handlePress(item.id)}
          >
            {!item.isRead && (
              <View style={styles.notificationIcon}>
                <Ionicons
                  name="notifications-circle"
                  size={14}
                  color={isDarkMode ? theme.colors.white : theme.colors.green}
                />
              </View>
            )}

            <View>
              <Text style={styles.notificationTitle}>
                <Markdown
                  style={{
                    body: {
                      fontSize: 16,
                      lineHeight: 22,
                      color: theme.colors.black,
                    },
                    strong: {
                      fontFamily: Fonts.NUNITO_MEDIUM,
                    },
                    paragraph: {
                      marginBottom: 8,
                    },
                  }}
                >
                  {item.title?.[i18n.language] ||
                    item.title?.vi ||
                    t("noTitle")}
                </Markdown>
              </Text>
              <Text style={styles.notificationDateEnd}>
                {(() => {
                  return formatDate(item.createdAt);
                })()}
              </Text>
            </View>

            {expandedId === item.id && (
              <View style={styles.notificationContentContainer}>
                <Markdown
                  style={{
                    body: {
                      fontSize: 14,
                      lineHeight: 22,
                      color: theme.colors.dropdownItemText,
                    },
                    strong: {
                      fontFamily: Fonts.NUNITO_MEDIUM,
                    },
                    paragraph: {
                      marginBottom: 8,
                    },
                  }}
                >
                  {item.content?.[i18n.language] ||
                    item.content?.en ||
                    t("noContent")}
                </Markdown>
                {item.exchangedRewardId &&
                  userId &&
                  rewardData[item.exchangedRewardId] &&
                  !rewardData[item.exchangedRewardId].isAccept && (
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          const reward = rewardData[item.exchangedRewardId];
                          await dispatch(
                            updateExchangeReward({
                              exchangedRewardId: item.exchangedRewardId,
                              isAccept: true,
                            })
                          ).unwrap();
                          // Send notification to pupil
                          const titleValues = {
                            en: { reward: reward.name?.en || "Reward" },
                            vi: { reward: reward.name?.vi || "Phần thưởng" },
                          };
                          const contentValues = {
                            en: { reward: reward.name?.en || "Reward" },
                            vi: { reward: reward.name?.vi || "Phần thưởng" },
                          };
                          await dispatch(
                            createPupilNotification({
                              pupilId: reward.pupilId,
                              title: buildMultilangText(
                                "notifyRewardConfirmedTitle",
                                titleValues
                              ),
                              content: buildMultilangText(
                                "notifyRewardConfirmedContent",
                                contentValues
                              ),
                              isRead: false,
                              createdAt: new Date(),
                            })
                          ).unwrap();
                          setSuccessContent({
                            title: t("success"),
                            description: t("rewardConfirmed"),
                          });
                          setShowSuccess(true);
                          // Cập nhật lại danh sách thông báo sau khi xác nhận
                          dispatch(notificationsByUserId(userId));
                        } catch (err) {
                          console.error(
                            "Failed to update exchange reward:",
                            err
                          );
                          setErrorContent({
                            title: t("error"),
                            description: t("failedToConfirm"),
                          });
                          setShowError(true);
                        }
                      }}
                      style={{
                        marginTop: 10,
                        backgroundColor: theme.colors.green,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        alignSelf: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.white,
                          fontFamily: Fonts.NUNITO_BOLD,
                          fontSize: 14,
                        }}
                      >
                        {t("acceptReward")}
                      </Text>
                    </TouchableOpacity>
                  )}
                {pupilId && item.goalId && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("TargetScreen", {
                        pupilId,
                        focusGoalId: item.goalId,
                      })
                    }
                    style={{
                      marginTop: 10,
                      backgroundColor: theme.colors.checkBoxBackground,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignSelf: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.white,
                        fontFamily: Fonts.NUNITO_BOLD,
                        fontSize: 14,
                      }}
                    >
                      {t("goToTasks")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
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
