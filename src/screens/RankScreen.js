import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import FloatingMenu from "../components/FloatingMenu";
import { useDispatch, useSelector } from "react-redux";
import { pupilById, rankings } from "../redux/pupilSlice";
import FullScreenLoading from "../components/FullScreenLoading";
import { useTranslation } from "react-i18next";
const AnimatedStar = ({ color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Ionicons name="star" size={14} color={color} />
    </Animated.View>
  );
};

export default function RankScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const pupilId = useSelector((state) => state.auth.user?.pupilId);
  const pupilData = useSelector((state) => state.pupil.pupil);
  const rankingData = useSelector((state) => state.pupil.rankings);
  const loading = useSelector((state) => state.pupil.loading);
  const error = useSelector((state) => state.pupil.error);
  const { t, i18n } = useTranslation("ranking");
  useEffect(() => {
    if (pupilId) {
      dispatch(pupilById(pupilId));
    }
    if (pupilData?.grade) {
      dispatch(rankings(pupilData.grade));
    }
  }, [dispatch, pupilId, pupilData?.grade]);

  console.log("rankingData", rankingData);
  // Sort pupils by point in descending order
  const sortedPupils = [...rankingData]
    .sort((a, b) => b.point - a.point)
    .slice(0, 5);
  // const sortedPupils = Array.isArray(rankingData)
  //   ? rankingData
  //       .filter((item) => item && item.id) // tránh lỗi undefined
  //       .sort((a, b) => b.point - a.point)
  //       .slice(0, 5)
  //   : [];
  console.log("sortedPupils", sortedPupils);
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
    backIcon: {
      width: 24,
      height: 24,
    },
    title: {
      fontSize: 36,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
      textAlign: "left", // Căn trái tiêu đề
    },
    topContainer: {
      paddingHorizontal: 10,
    },
    top23: {
      flexDirection: "row",
      justifyContent: "space-between",
    }, // Căn trái top 2, 3
    topUser: {
      alignItems: "center", // Căn trái nội dung trong topUser
      width: "30%",
    },
    topName: {
      marginTop: 5,
      textAlign: "left", // Căn trái tên top user
      fontSize: 12,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
    topIcon: {
      width: 50,
      height: 50,
      backgroundColor: theme.colors.white,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.white,
      elevation: 5,
    },
    userCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between", // Căn trái nội dung trong userCard
      marginHorizontal: 30,
      padding: 10,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.white,
      marginBottom: 20,
      elevation: 5,
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatarContainer: {
      borderRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.white,
      backgroundColor: theme.colors.white,
      elevation: 5,
      position: "relative",
    },
    star: {
      position: "absolute",
      top: -3,
      right: -6,
      backgroundColor: theme.colors.white,
      padding: 4,
      borderRadius: 50,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 50,
    },
    name: {
      width: "60%",
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "left", // Căn trái tên trong userCard
    },
    rightContainer: {
      alignItems: "flex-start", // Căn trái nội dung trong rightContainer
    },
    point: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
      textAlign: "left", // Căn trái điểm
    },
    time: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_REGULAR,
      color: theme.colors.white,
      textAlign: "left", // Căn trái thời gian
    },
    loadingText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_REGULAR,
      color: theme.colors.white,
      textAlign: "left", // Căn trái văn bản loading
      marginTop: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: Fonts.NUNITO_REGULAR,
      color: theme.colors.red,
      textAlign: "left", // Căn trái văn bản lỗi
      marginTop: 20,
    },
  });

  // if (loading) {
  //   return (
  //     <LinearGradient
  //       colors={theme.colors.gradientBlue}
  //       style={styles.container}
  //     >
  //       <Text style={styles.loadingText}>Loading...</Text>
  //     </LinearGradient>
  //   );
  // }

  if (error) {
    return (
      <LinearGradient
        colors={theme.colors.gradientBlue}
        style={styles.container}
      >
        <Text style={styles.errorText}>
          {t("error")}: {error?.message || error}
        </Text>
      </LinearGradient>
    );
  }

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
        <Text style={styles.title}>{t("title")}</Text>
      </LinearGradient>
      <View style={styles.topContainer}>
        <View style={styles.top23}>
          <View style={[styles.topUser, { marginTop: 20 }]}>
            <Image source={theme.icons.top2} style={styles.topIcon} />
            <Text style={styles.topName}>
              {sortedPupils[1]?.pupil?.fullName}
            </Text>
          </View>
          <View style={[styles.topUser, { marginTop: 0 }]}>
            <Image source={theme.icons.top1} style={styles.topIcon} />
            <Text style={styles.topName}>
              {sortedPupils[0]?.pupil?.fullName}
            </Text>
          </View>
          <View style={[styles.topUser, { marginTop: 20 }]}>
            <Image source={theme.icons.top3} style={styles.topIcon} />
            <Text style={styles.topName}>
              {sortedPupils[2]?.pupil?.fullName}
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={sortedPupils}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity key={item.id}>
            <LinearGradient
              colors={
                index % 2 === 0
                  ? theme.colors.gradientBluePrimary
                  : theme.colors.gradientGreen
              }
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={styles.userCard}
            >
              <View style={styles.leftContainer}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={
                      item.pupil?.image
                        ? { uri: item.pupil.image }
                        : theme.icons.badge
                    }
                    style={styles.avatar}
                  />
                  {(index === 0 || index === 1 || index === 2) && (
                    <View style={styles.star}>
                      <AnimatedStar
                        color={
                          index === 0
                            ? theme.colors.starColor
                            : index === 1
                            ? theme.colors.grayMedium
                            : theme.colors.brown
                        }
                      />
                    </View>
                  )}
                </View>
                <Text style={styles.name}>{item.pupil.fullName}</Text>
              </View>
              <View style={styles.rightContainer}>
                <Text style={styles.point}>
                  {item.point} {t("point")}
                </Text>
                {/* <Text style={styles.time}>{item.time} Hours</Text> */}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
      <FloatingMenu />
      <FullScreenLoading visible={loading} color={theme.colors.white} />
    </LinearGradient>
  );
}
