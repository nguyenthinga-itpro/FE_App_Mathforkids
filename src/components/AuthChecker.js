import React, { useEffect } from "react";
import { AppState, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { checkTokenExpiration } from "../redux/authSlice";
import { resetToLogin } from "./navigationRef";

export default function AuthChecker() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.settings.language);

  const handleCheck = async () => {
    const expired = await dispatch(checkTokenExpiration()).unwrap();
    if (expired) {
      const isVI = language === "vi";
      Alert.alert(
        isVI ? "Phiên đăng nhập đã hết hạn" : "Session Expired",
        isVI
          ? "Vui lòng đăng nhập lại để tiếp tục sử dụng."
          : "Please log in again to continue.",
        [
          {
            text: isVI ? "Đồng ý" : "OK",
            onPress: () => resetToLogin(),
          },
        ],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    handleCheck();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") handleCheck();
    });
    const interval = setInterval(handleCheck, 30000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, []);

  return null;
}
