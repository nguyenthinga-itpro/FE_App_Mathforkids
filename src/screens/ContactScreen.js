import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../themes/ThemeContext";
import { Fonts } from "../../constants/Fonts";
import FloatingMenu from "../components/FloatingMenu";
import { getAllUser } from "../redux/authSlice";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../components/FullScreenLoading";
export default function ContactScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation("contact");
  const users = useSelector((state) => state.auth.list || []);
  const loading = useSelector((state) => state.auth.loading);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isFocused) {
      dispatch(getAllUser());
    }
  }, [isFocused]);
  const filteredUsers = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  );
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
    userCard: {
      alignItems: "center",
      justifyContent: "center",
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
      alignItems: "center",
      gap: 10,
    },
    avatarContainer: {
      padding: 10,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.white,
      backgroundColor: theme.colors.white,
      elevation: 5,
    },
    avatar: {
      width: 50,
      height: 50,
    },
    name: {
      width: "50%",
      fontSize: 14,
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.white,
    },
    rightContainer: {
      alignItems: "center",
    },
    position: {
      width: "50%",
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.white,
    },
    email: {
      width: "50%",
      fontSize: 14,
      fontFamily: Fonts.NUNITO_MEDIUM,
      color: theme.colors.black,
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
        <Text style={styles.title}>{t("contactTitle")}</Text>
      </LinearGradient>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
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
                      item.image
                        ? { uri: item.image }
                        : item.gender === "female"
                          ? theme.icons.avatarFemale
                          : theme.icons.avatarMale
                    }
                    style={styles.avatar}
                  />
                </View>
                <Text style={styles.name}>{item.fullName}</Text>
              </View>
              <View style={styles.rightContainer}>
                <Text style={styles.position}>{t(item.role)}</Text>
                <Text style={styles.email}>{item.email || t("noEmail")}</Text>
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
