import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import * as Progress from "react-native-progress";
import Modal from "react-native-modal";
import Ionicons from "react-native-vector-icons/Ionicons";
import FloatingMenu from "../components/FloatingMenu";
import {
  getRewardByDisabledStatus,
  getExchangeRewardByPupil,
} from "../redux/rewardSlice";
import { createOrUpdate, getByPupilId } from "../redux/owned_rewardSlice";
import { pupilById, updatePupilProfile } from "../redux/pupilSlice";
import { createExchangeReward } from "../redux/owned_rewardSlice";
import { createUserNotification } from "../redux/userNotificationSlice";
import { createPupilNotification } from "../redux/pupilNotificationSlice";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";
import FullScreenLoading from "../components/FullScreenLoading";
import MessageError from "../components/MessageError";
import MessageSuccess from "../components/MessageSuccess";
import MessageConfirm from "../components/MessageConfirm";
import MessageWarning from "../components/MessangeWarning";

export default function RewardScreen({ navigation }) {
  const { t, i18n } = useTranslation("reward");
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState("Exchange points");
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedRewardOwn, setSelectedRewardOwn] = useState(null);
  const [filteredRewardList, setFilteredRewardList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isValid, setIsValid] = useState(true);
  const [isExchanging, setIsExchanging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const lastFetchRef = useRef(null);
  const retryCountRef = useRef(0);
  const lastSyncRef = useRef(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmContent, setConfirmContent] = useState({
    title: "",
    description: "",
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
  const [showWarning, setShowWarning] = useState(false);
  const [warningContent, setWarningContent] = useState({
    title: "",
    description: "",
  });
  const user = useSelector((state) => state.auth);
  const userId = user?.user?.id;
  const pupil = useSelector((state) => state.pupil.pupil, isEqual);
  const pupilId = pupil?.id;
  const pupilLoading = useSelector((state) => state.pupil.loading);
  const pupilError = useSelector((state) => state.pupil.error);

  const rawRewardList = useSelector(
    (state) => state.reward?.rewards || [],
    isEqual
  );
  const loading = useSelector((state) => state.reward.loading || pupilLoading);
  const exchangeRewards = useSelector(
    (state) =>
      state.reward?.exchangeRewards || { rewardIds: [], rewardCount: [] },
    isEqual
  );
  const rewardLoading = useSelector((state) => state.reward.loading);
  const rewardError = useSelector((state) => state.reward.error);
  const owned_rewards = useSelector(
    (state) => state.owned_reward?.list || [],
    isEqual
  );
  const owned_reward_error = useSelector(
    (state) => state.owned_reward?.error || null
  );

  useEffect(() => {
    const invalidEntries = owned_rewards.filter(
      (o) => !o || typeof o !== "object" || !o.rewardId || o.quantity == null
    );
    if (invalidEntries.length > 0) {
      console.warn("Invalid owned_rewards entries detected:", invalidEntries);
    }
  }, [owned_rewards]);

  useEffect(() => {
    if (!user || !user.user || !userId) {
      setErrorContent({
        title: t("error"),
        description: t("User_data_missing"),
        onConfirm: () => {
          setShowError(false);
          navigation.navigate("Login");
        },
      });
      setShowError(true);
    }
  }, [user, userId, navigation, t]);

  useEffect(() => {
    if (!isFocused || !userId || !pupilId) return;

    const fetchData = async () => {
      const now = Date.now();
      if (!lastFetchRef.current || now - lastFetchRef.current > 60000) {
        lastFetchRef.current = now;
        retryCountRef.current = 0;

        try {
          await dispatch(getRewardByDisabledStatus()).unwrap();
          await dispatch(getExchangeRewardByPupil(pupilId)).unwrap();

          let targetPupilId = pupilId;
          if (!pupil || pupil.userId !== userId) {
            let pupilAction;
            while (retryCountRef.current < 3) {
              try {
                pupilAction = await dispatch(pupilById(userId)).unwrap();
                targetPupilId = pupilAction?.id || pupilId;
                break;
              } catch (error) {
                retryCountRef.current += 1;
                console.warn(
                  `pupilById retry ${retryCountRef.current}/3 failed:`,
                  error
                );
                if (retryCountRef.current >= 3) {
                  if (!pupil || !pupilId) {
                    setErrorContent({
                      title: t("error"),
                      description: t("Error_loading_pupil", {
                        error: "Failed to load pupil data",
                      }),
                      onConfirm: () => {
                        setShowError(false);
                        navigation.navigate("Login");
                      },
                    });
                    setShowError(true);
                    return;
                  }
                  break;
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

          if (targetPupilId) {
            await dispatch(getByPupilId(targetPupilId)).unwrap();
          } else {
            console.warn("No pupilId available for getByPupilId");
            setErrorContent({
              title: t("error"),
              description: t("Error_loading_pupil", {
                error: "No pupil ID found",
              }),
              onConfirm: () => {
                setShowError(false);
                navigation.navigate("Login");
              },
            });
            setShowError(true);
          }
        } catch (error) {
          console.error("API error:", error);
          setErrorContent({
            title: t("error"),
            description: t("Error_loading_rewards", {
              error: error?.[i18n.language] || "Unknown error",
            }),
            onConfirm: () => setShowError(false),
          });
          setShowError(true);
        }
      }
    };

    fetchData();
  }, [isFocused, userId, pupilId, pupil, dispatch, navigation, t]);

  useEffect(() => {
    if (!rawRewardList) return;
    setFilteredRewardList((prev) =>
      isEqual(prev, rawRewardList) ? prev : rawRewardList
    );
  }, [rawRewardList]);

  useEffect(() => {
    setQuantity(1);
    setIsValid(true);
  }, [selectedTab]);

  const handleRewardPress = (item) => {
    setSelectedReward(item);
    setQuantity(1);
    if (selectedTab === "Exchange points") {
      setIsValid(item.exchangePoint <= (pupil?.point || 0));
    } else if (selectedTab === "Exchange item") {
      const ownedNumber =
        owned_rewards.find((o) => o.rewardId === item.id)?.quantity || 0;
      setIsValid(50 <= ownedNumber);
    }
  };

  const handleOwnRewardPress = (item) => {
    setSelectedRewardOwn(item);
  };

  const handleQuantityChange = (action) => {
    if (selectedTab === "Exchange item") {
      return;
    }

    const currentQuantity = parseInt(quantity, 10) || 1;
    let newQuantity;
    if (action === "increment") {
      newQuantity = currentQuantity + 1;
    } else if (action === "decrement" && currentQuantity > 1) {
      newQuantity = currentQuantity - 1;
    } else {
      newQuantity = currentQuantity;
    }

    setQuantity(newQuantity);

    if (selectedTab === "Exchange points") {
      const totalPointsRequired = selectedReward?.exchangePoint * newQuantity;
      setIsValid(totalPointsRequired <= (pupil?.point || 0));
    }
  };

  const fetchOwnedRewardsWithRetry = async (pupilId, maxRetries = 3) => {
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        const now = Date.now();
        const action = await dispatch(getByPupilId(pupilId)).unwrap();
        lastSyncRef.current = now;
        return action;
      } catch (error) {
        retryCount += 1;
        console.warn(
          `getByPupilId retry ${retryCount}/${maxRetries} failed:`,
          error
        );
        if (retryCount >= maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const handleExchange = async () => {
    if (
      isExchanging ||
      !isValid ||
      !selectedReward ||
      !pupilId ||
      !pupil ||
      !userId
    ) {
      console.warn("handleExchange blocked:", {
        isExchanging,
        isValid,
        selectedReward,
        pupilId,
        pupil,
        userId,
      });
      setErrorContent({
        title: t("Error"),
        description: t("Invalid_input"),
      });
      setShowError(true);
      return;
    }

    const rewardId = selectedReward.id;
    const exchangeQuantity = parseInt(quantity, 10);
    const exchangePoint = parseInt(selectedReward.exchangePoint, 10);
    const exchangeReward = 50;
    const rewardName = {
      en: selectedReward?.name?.en || t("Unknown_reward", { lng: "en" }),
      vi: selectedReward?.name?.vi || t("Unknown_reward", { lng: "vi" }),
    };

    // console.log("Current language:", i18n.language);
    // console.log("selectedReward:", selectedReward);
    // console.log("rewardName:", rewardName);
    // console.log("pupil.fullName:", pupil.fullName);
    // console.log("exchangeQuantity:", exchangeQuantity);

    if (!rewardId) {
      setErrorContent({
        title: t("Error"),
        description: t("Missing_reward_id"),
      });
      setShowError(true);
      return;
    }

    if (!pupil.fullName || !rewardName || isNaN(exchangeQuantity)) {
      console.error("Invalid data:", {
        pupilFullName: pupil.fullName,
        rewardName,
        exchangeQuantity,
      });
      setErrorContent({
        title: t("Error"),
        description: t("Invalid_input"),
      });
      setShowError(true);
      return;
    }

    setIsExchanging(true);
    setIsRefreshing(true);

    try {
      if (selectedTab === "Exchange points") {
        if (isNaN(exchangePoint) || exchangePoint <= 0) {
          setErrorContent({
            title: t("Error"),
            description: t("Invalid_exchange_point"),
          });
          setShowError(true);
          return;
        }

        const totalPointsRequired = exchangePoint * exchangeQuantity;

        if (totalPointsRequired > pupil.point) {
          setErrorContent({
            title: t("error"),
            description: t("Not_enough_points", {
              required: totalPointsRequired,
              available: pupil.point,
            }),
            onConfirm: () => setShowError(false),
          });
          setShowError(true);
          return;
        }

        await dispatch(
          createOrUpdate({
            pupilId,
            rewardId,
            quantity: exchangeQuantity,
          })
        ).unwrap();

        await fetchOwnedRewardsWithRetry(pupilId);

        const updatePupilAction = await dispatch(
          updatePupilProfile({
            id: pupilId,
            data: {
              point: pupil.point - totalPointsRequired,
            },
          })
        ).unwrap();

        if (!updatePupilAction) {
          throw new Error("Failed to update pupil points.");
        }
        setSuccessContent({
          title: t("Success"),
          description: t("Exchange_success"),
        });
        setShowSuccess(true);
        setSelectedReward(null);
        setQuantity(1);
      } else if (selectedTab === "Exchange item") {
        const quantityToDeduct = exchangeReward * exchangeQuantity;
        const ownedReward = owned_rewards.find((o) => o.rewardId === rewardId);
        const ownedNumber = ownedReward
          ? parseInt(ownedReward.quantity, 10)
          : 0;

        if (quantityToDeduct > ownedNumber) {
          setErrorContent({
            title: t("error"),
            description: t("Not_enough_items", {
              required: quantityToDeduct,
              available: ownedNumber,
            }),
            onConfirm: () => setShowError(false),
          });
          setShowError(true);
          return;
        }

        await dispatch(
          createOrUpdate({
            pupilId,
            rewardId,
            quantity: -quantityToDeduct,
          })
        ).unwrap();

        const exchangeRewardIds = [];
        for (let i = 0; i < exchangeQuantity; i++) {
          const exchangeResult = await dispatch(
            createExchangeReward({
              pupilId,
              rewardId,
            })
          ).unwrap();
          if (!exchangeResult?.id) {
            throw new Error("createExchangeReward did not return an ID");
          }
          exchangeRewardIds.push(exchangeResult.id);
        }

        await fetchOwnedRewardsWithRetry(pupilId);

        const now = new Date();
        const createdAt = now.toISOString();
        const buildNotificationText = (templateKey, lang, values) =>
          t(templateKey, { ...values, lng: lang });

        const buildMultilangText = (templateKey, values) => ({
          en: buildNotificationText(templateKey, "en", values.en),
          vi: buildNotificationText(templateKey, "vi", values.vi),
        });

        const titleValues = {
          en: { pupilName: pupil.fullName, reward: rewardName.en },
          vi: { pupilName: pupil.fullName, reward: rewardName.vi },
        };

        const contentValues = {
          en: {
            pupilName: pupil.fullName,
            reward: rewardName.en,
            quantity: exchangeQuantity,
          },
          vi: {
            pupilName: pupil.fullName,
            reward: rewardName.vi,
            quantity: exchangeQuantity,
          },
        };

        for (const id of exchangeRewardIds) {
          dispatch(
            createUserNotification({
              userId,
              title: buildMultilangText(
                "notifyExchangeRewardRequestTitle",
                titleValues
              ),
              content: buildMultilangText(
                "notifyExchangeRewardRequestContent",
                contentValues
              ),
              exchangedRewardId: id,
              isRead: false,
              createdAt,
            })
          );
        }

        dispatch(
          createPupilNotification({
            pupilId,
            title: buildMultilangText(
              "notifyExchangeRewardSentTitle",
              titleValues
            ),
            content: buildMultilangText(
              "notifyExchangeRewardSentContent",
              contentValues
            ),
            isRead: false,
            createdAt,
          })
        );
        setSuccessContent({
          title: t("Success"),
          description: t("Exchange_success"),
        });
        setShowSuccess(true);
        setSelectedReward(null);
        setQuantity(1);
      }
    } catch (error) {
      setErrorContent({
        title: t("Error"),
        description: t("Exchange_failed", { message: error.message }),
      });
      setShowError(true);
    } finally {
      setIsExchanging(false);
      setIsRefreshing(false);
    }
  };

  const debouncedHandleExchange = useMemo(
    () => debounce(handleExchange, 300, { leading: true, trailing: false }),
    [handleExchange]
  );

  useEffect(() => {
    return () => {
      debouncedHandleExchange.cancel();
    };
  }, [debouncedHandleExchange]);

  const allTargets = useMemo(() => {
    if (
      !rawRewardList ||
      !Array.isArray(rawRewardList) ||
      !owned_rewards ||
      !Array.isArray(owned_rewards)
    ) {
      console.warn("Invalid input for allTargets:", {
        rawRewardList,
        owned_rewards,
      });
      return [];
    }

    const validOwnedRewards = owned_rewards.filter(
      (o) => o && typeof o === "object" && o.rewardId && o.quantity != null
    );

    if (validOwnedRewards.length !== owned_rewards.length) {
      console.warn(
        "Invalid entries detected in owned_rewards:",
        owned_rewards.filter(
          (o) =>
            !o || typeof o !== "object" || !o.rewardId || o.quantity == null
        )
      );
    }

    const targets = rawRewardList
      .filter((reward) => reward && typeof reward === "object" && reward.id)
      .map((reward) => {
        const owned = validOwnedRewards.find((o) => o?.rewardId === reward.id);
        return {
          ...reward,
          rewardId: reward.id,
          rewardImage: reward.image,
          ownedNumber: owned ? parseInt(owned.quantity, 10) : 0,
          pupilPoint: pupil ? pupil.point : 0,
          exchangeReward: 50,
        };
      })
      .filter((target) => target !== null && target?.id !== undefined);

    const unmatchedOwned = validOwnedRewards
      .filter((o) => !rawRewardList.some((r) => r && r.id === o.rewardId))
      .map((o) => ({
        id: o.rewardId,
        rewardId: o.rewardId,
        rewardImage: "https://via.placeholder.com/60",
        name: {
          vi: t("Unknown_reward", { id: o.rewardId }, { lng: "vi" }),
          en: t("Unknown_reward", { id: o.rewardId }, { lng: "en" }),
        },
        exchangePoint: 0,
        exchangeReward: 50,
        ownedNumber: parseInt(o.quantity, 10),
        pupilPoint: pupil ? pupil.point : 0,
      }));

    const result = [...targets, ...unmatchedOwned].filter(
      (target) => target !== null && target?.id !== undefined
    );

    return result;
  }, [rawRewardList, owned_rewards, pupil, t]);

  const filteredTargets = allTargets;
  const selectedTarget = allTargets.find(
    (item) => item && item.id === selectedReward?.id
  );

  const ownedExchangeRewards = useMemo(() => {
    if (
      !exchangeRewards ||
      !exchangeRewards.rewardIds ||
      !exchangeRewards.rewardCount ||
      !Array.isArray(exchangeRewards.rewardIds) ||
      !Array.isArray(exchangeRewards.rewardCount)
    ) {
      return [];
    }

    return exchangeRewards.rewardIds
      .map((rewardId) => {
        const rewardData = rawRewardList.find((r) => r && r.id === rewardId);
        const rewardCountData = exchangeRewards.rewardCount.find(
          (rc) => rc && rc.rewardId === rewardId
        );

        if (!rewardCountData) return null;

        return {
          id: rewardId,
          rewardId,
          rewardImage: rewardData?.image || "https://via.placeholder.com/60",
          name: rewardData?.name || {
            vi: t("Unknown_reward", { id: rewardId }, { lng: "vi" }),
            en: t("Unknown_reward", { id: rewardId }, { lng: "en" }),
          },
          ownedNumber: rewardCountData.count || 0,
          exchangeReward: 50,
          pupilPoint: pupil ? pupil.point : 0,
        };
      })
      .filter((item) => item !== null && item.ownedNumber > 0);
  }, [exchangeRewards, rawRewardList, pupil, t]);

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
      fontSize: 36,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
    },
    tabButton: {
      width: "40%",
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginHorizontal: 5,
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
      elevation: 3,
    },
    tabButtonActive: {
      backgroundColor: theme.colors.tabBackground || theme.colors.brandBlue,
    },
    tabText: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 12,
      textAlign: "center",
      color: theme.colors.black,
    },
    tabTextActive: {
      color: theme.colors.white,
    },
    cardTitle: {
      width: "50%",
      alignItems: "center",
      marginHorizontal: 20,
      padding: 5,
      marginBottom: 20,
      backgroundColor: theme.colors.greenLight,
      borderRadius: 10,
      elevation: 4,
    },
    cardOwn: {
      width: "40%",
      alignItems: "center",
      marginHorizontal: 20,
      padding: 5,
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: theme.colors.greenLight,
      borderRadius: 10,
      elevation: 4,
    },
    cardTitleText: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
    itemOwnContainer: {
      marginHorizontal: 20,
    },
    itemOwn: { alignItems: "center", marginRight: 16 },
    ownNumberContainer: {
      backgroundColor: theme.colors.cardBackground,
      paddingHorizontal: 20,
      paddingVertical: 5,
      marginTop: 10,
      borderTopLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    ownTextNumber: {
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      fontSize: 14,
      textAlign: "center",
    },
    modalContainer: {
      backgroundColor: theme.colors.overlay,
    },
    modalBackground: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      padding: 20,
      backgroundColor: theme.colors.cardBackground,
    },
    modalImage: {
      width: 60,
      height: 60,
      marginBottom: 10,
    },
    modalText: {
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      marginVertical: 5,
      color: theme.colors.black,
    },
    soundContainer: {
      position: "absolute",
      top: 50,
      left: 20,
      zIndex: 10,
      borderRadius: 50,
      padding: 10,
    },
    closeIcon: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 10,
      borderWidth: 1,
      borderColor: theme.colors.black,
      borderRadius: 50,
    },
    closeButton: {
      marginTop: 15,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.colors.red,
      borderRadius: 10,
    },
    closeButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 30,
    },
    exchangeButton: {
      marginTop: 15,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.colors.green,
      borderRadius: 10,
    },
    exchangeButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    quantityButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: theme.colors.cyanLight,
      borderRadius: 10,
    },
    quantityButtonText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
    },
    quantityText: {
      width: 60,
      height: 40,
      backgroundColor: theme.colors.cyanLight,
      borderRadius: 10,
      textAlign: "center",
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
      lineHeight: 40,
      marginHorizontal: 10,
    },
    rewardInfoText: {
      color: theme.colors.black,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    errorContainer: {
      backgroundColor: theme.colors.red,
      padding: 10,
      marginHorizontal: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    errorText: {
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_MEDIUM,
      fontSize: 14,
      textAlign: "center",
    },
    progressTextContainer: {
      backgroundColor: theme.colors.cardBackground,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      marginTop: 5,
      minWidth: 100,
    },
  });

  const exchangePoint = StyleSheet.create({
    cardPoint: { maxHeight: 200 },
    cardContentPoint: { alignItems: "center", marginTop: 10, marginLeft: 15 },
    rewardImageContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 16,
      padding: 8,
      alignItems: "center",
      elevation: 3,
    },
    rewardImageBackground: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: theme.colors.black,
      elevation: 3,
    },
    rewardImage: {
      width: 40,
      height: 40
    },
    progress: {
      width: 100,
      height: 20,
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.colors.greenLight,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    progressText: {
      position: "absolute",
      alignSelf: "center",
      fontSize: 10,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
  });

  const exchangeItem = StyleSheet.create({
    cardItem: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      margin: 10,
      maxHeight: 180,
    },
    cardContentItem: {
      flexDirection: "row",
      justifyContent: "space-around",
      borderRadius: 10,
      margin: 10,
    },
    rewardImageContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      padding: 0,
      alignItems: "center",
    },
    rewardImageBackground: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.black,
      elevation: 3,
    },
    rewardImage: {
      width: 60,
      height: 60,
      borderRadius: 9,
    },
    progress: {
      width: 150,
      height: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.colors.greenLight,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    progressText: {
      position: "absolute",
      alignSelf: "center",
      fontSize: 10,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "center",
    },
  });

  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      {owned_reward_error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("Error_loading_owned_rewards", {
              error:
                owned_reward_error?.en ||
                owned_reward_error?.vi ||
                owned_reward_error,
            })}
          </Text>
        </View>
      )}
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
        <Text style={styles.title}>{t("Reward")}</Text>
      </LinearGradient>
      {rewardLoading || pupilLoading ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("Loading_data")}</Text>
        </View>
      ) : null}
      {!userId ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("User_data_missing")}</Text>
        </View>
      ) : null}
      {rewardError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("Error_loading_rewards", {
              error: rewardError?.en || rewardError?.vi || rewardError,
            })}
          </Text>
        </View>
      ) : null}
      {pupilError && !pupil ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("Error_loading_pupil", {
              error: pupilError?.en || pupilError?.vi || pupilError,
            })}
          </Text>
        </View>
      ) : null}
      {!pupil || !rawRewardList ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("No_data_available")}</Text>
        </View>
      ) : null}
      {(!rewardLoading && !pupilLoading && userId && !rewardError && pupil && rawRewardList) && (
        <>
          {owned_reward_error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t("Error_loading_owned_rewards", {
                  error:
                    owned_reward_error?.en ||
                    owned_reward_error?.vi ||
                    owned_reward_error,
                })}
              </Text>
            </View>
          )}
          <View style={styles.tabContainer}>
            {["Exchange points", "Exchange item"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.tabTextActive,
                  ]}
                >
                  {t(
                    tab === "Exchange points" ? "Exchange_points" : "Exchange_item"
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.cardTitle}>
            <Text style={styles.cardTitleText}>{t("Rewards_achieved")}</Text>
          </View>
          {filteredRewardList.length === 0 && (
            <Text style={styles.errorText}>{t("No_rewards_available")}</Text>
          )}
          <FlatList
            data={allTargets.map((item) => ({
              ...item,
              ownedNumber:
                allTargets.find((item2) => item2.id === item.id)?.ownedNumber || 0,
            }))}
            keyExtractor={(item) => item.id?.toString()}
            numColumns={selectedTab === "Exchange points" ? 3 : 1}
            key={selectedTab}
            extraData={[selectedTab, allTargets]}
            style={
              selectedTab === "Exchange points"
                ? exchangePoint.cardPoint
                : exchangeItem.cardItem
            }
            renderItem={({ item }) => {
              const progressPoint =
                item.exchangePoint > 0 && pupil?.point != null
                  ? pupil.point / item.exchangePoint
                  : 0;
              const ownerReward =
                item.exchangeReward !== null && item.ownedNumber !== null
                  ? item.ownedNumber / item.exchangeReward
                  : 0;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleRewardPress(item)}
                >
                  <View
                    style={
                      selectedTab === "Exchange points"
                        ? exchangePoint.cardContentPoint
                        : exchangeItem.cardContentItem
                    }
                  >
                    <View
                      style={
                        selectedTab === "Exchange points"
                          ? exchangePoint.rewardImageContainer
                          : exchangeItem.rewardImageContainer
                      }
                    >
                      <View
                        style={
                          selectedTab === "Exchange points"
                            ? exchangePoint.rewardImageBackground
                            : exchangeItem.rewardImageBackground
                        }
                      >
                        <Image
                          source={{
                            uri: item.image || "https://via.placeholder.com/60",
                          }}
                          style={
                            selectedTab === "Exchange points"
                              ? exchangePoint.rewardImage
                              : exchangeItem.rewardImage
                          }
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      {selectedTab === "Exchange points" && (
                        <View style={exchangePoint.progress}>
                          <Progress.Bar
                            progress={progressPoint}
                            height={20}
                            borderRadius={20}
                            color={theme.colors.green}
                            unfilledColor={theme.colors.progressBackground}
                            borderWidth={1}
                            borderColor={theme.colors.greenLight}
                            style={{ position: "absolute", width: "100%" }}
                          />
                          <Text style={exchangePoint.progressText}>
                            {pupil?.point ?? 0} / {item.exchangePoint}
                          </Text>
                        </View>
                      )}
                      {selectedTab === "Exchange item" && (
                        <View style={exchangeItem.progress}>
                          <Progress.Bar
                            progress={ownerReward}
                            height={20}
                            borderRadius={20}
                            color={theme.colors.green}
                            unfilledColor={theme.colors.progressBackground}
                            borderWidth={1}
                            borderColor={theme.colors.greenLight}
                            style={{ position: "absolute", width: "100%" }}
                          />
                          <Text style={exchangeItem.progressText}>
                            {item.ownedNumber ?? 0} / {item.exchangeReward}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <View style={styles.cardOwn}>
            <Text style={styles.cardTitleText}>{t("Own")}</Text>
          </View>
          {(selectedTab === "Exchange points"
            ? allTargets.filter((item) => item && item.id && item.ownedNumber > 0)
            : ownedExchangeRewards
          ).length === 0 && (
              <Text style={styles.errorText}>{t("No_owned_rewards")}</Text>
            )}
          <FlatList
            data={
              selectedTab === "Exchange points"
                ? allTargets.filter((item) => {
                  if (!item || !item.id) return null;
                  const rewardData = rawRewardList.find(
                    (r) => r && r.id === item.id
                  );
                  if (!rewardData) return null;
                  return item.ownedNumber > 0;
                })
                : ownedExchangeRewards
            }
            keyExtractor={(item) => item.id.toString() + "-own"}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.itemOwnContainer}
            extraData={[selectedTab, allTargets, ownedExchangeRewards]}
            renderItem={({ item }) => (
              <View style={styles.itemOwn}>
                <TouchableOpacity onPress={() => handleOwnRewardPress(item)}>
                  <View style={exchangePoint.rewardImageBackground}>
                    <Image
                      source={{
                        uri: item.rewardImage || "https://via.placeholder.com/60",
                      }}
                      style={exchangePoint.rewardImage}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
                <View style={styles.ownNumberContainer}>
                  <Text style={styles.ownTextNumber}>{item.ownedNumber}</Text>
                </View>
              </View>
            )}
          />
          {selectedReward && (
            <Modal isVisible={true} onBackdropPress={() => setSelectedReward(null)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalBackground}>
                  {rewardLoading || isRefreshing ? (
                    <Text style={styles.modalText}>
                      {t("Loading_reward_details")}
                    </Text>
                  ) : rewardError ? (
                    <Text style={styles.errorText}>
                      {t("Error_loading_rewards", {
                        error: rewardError?.en || rewardError?.vi || rewardError,
                      })}
                    </Text>
                  ) : (
                    <>
                      <Image
                        source={{
                          uri:
                            selectedReward?.image ||
                            "https://via.placeholder.com/60",
                        }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.modalText}>
                        {selectedReward?.name?.en ||
                          selectedReward?.name?.vi ||
                          t("Unknown_reward")}
                      </Text>
                      <Text style={styles.rewardInfoText}>
                        {selectedReward?.description?.en ||
                          selectedReward?.description?.vi ||
                          t("No_description")}
                      </Text>
                      {selectedTab === "Exchange points" && (
                        <View style={styles.quantityContainer}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange("decrement")}
                            disabled={quantity <= 1}
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange("increment")}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {selectedTab === "Exchange item" && (
                        <View style={styles.quantityContainer}>
                          <Text style={styles.quantityText}>1</Text>
                        </View>
                      )}
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          disabled={isExchanging || !isValid}
                          style={
                            isExchanging || !isValid
                              ? {
                                ...styles.exchangeButton,
                                backgroundColor: theme.colors.grayDark,
                              }
                              : styles.exchangeButton
                          }
                          onPress={debouncedHandleExchange}
                        >
                          <Text style={styles.exchangeButtonText}>
                            {isExchanging || isRefreshing
                              ? t("Exchanging")
                              : t("Exchange")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={() => setSelectedReward(null)}
                        >
                          <Text style={styles.closeButtonText}>{t("Close")}</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </Modal>
          )}
          {selectedRewardOwn && (
            <Modal
              isVisible={true}
              onBackdropPress={() => setSelectedRewardOwn(null)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalBackground}>
                  <Image
                    source={{
                      uri:
                        selectedRewardOwn?.rewardImage ||
                        "https://via.placeholder.com/60",
                    }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.closeIcon}
                    onPress={() => setSelectedRewardOwn(null)}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.black} />
                  </TouchableOpacity>
                  <LinearGradient
                    colors={theme.colors.gradientBlue}
                    style={styles.soundContainer}
                  >
                    <TouchableOpacity>
                      <Ionicons
                        name="volume-high"
                        size={20}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                  <Text style={styles.modalText}>
                    {selectedRewardOwn?.name?.en ||
                      selectedRewardOwn?.name?.vi ||
                      t("Unknown_reward")}
                  </Text>
                  <Text style={styles.rewardInfoText}>
                    {(() => {
                      const reward = rawRewardList.find(
                        (r) => r && r.id === selectedRewardOwn.id
                      );
                      return (
                        reward?.description?.en ||
                        reward?.description?.vi ||
                        t("No_description")
                      );
                    })()}
                  </Text>
                </View>
              </View>
            </Modal>
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
            }}
          />
          <MessageWarning
            visible={showWarning}
            title={warningContent.title}
            description={warningContent.description}
            onCancel={warningContent.onCancel}
            onConfirm={warningContent.onConfirm}
            showCancelButton={warningContent.showCancelButton !== false}
          />
          <MessageConfirm
            visible={showConfirm}
            title={confirmContent.title}
            description={confirmContent.description}
            onConfirm={confirmContent.onConfirm}
            onCancel={() => setShowConfirm(false)}
          />
        </>
      )}
    </LinearGradient>
  );
}
