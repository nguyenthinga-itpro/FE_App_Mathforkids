import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Fonts } from "../../constants/Fonts";
import { useTheme } from "../themes/ThemeContext";
export default function BaseMessage({
  visible,
  image,
  title,
  description,
  onClose,
  buttonText = "OK",
  themeColor = "#2196F3",
  borderColor = "#2196F3",
  cancelColor,
  showCancelButton,
  onConfirm,
  onCancel,
  cancelText,
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    alertBox: {
      width: 300,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      borderWidth: 7,
    },
    image: {
      width: 50,
      height: 50,
      marginBottom: 16,
      resizeMode: "contain",
      elevation: 3,
    },
    title: {
      fontFamily: Fonts.NUNITO_BOLD,
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 10,
      textAlign: "center",
      color: theme.colors.black,
    },
    description: {
      fontSize: 12,
      marginBottom: 20,
      textAlign: "center",
      color: theme.colors.black,
      fontFamily: Fonts.NUNITO_MEDIUM,
    },
    bottomContainer: { flexDirection: "row", gap: 30 },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 8,
    },
    buttonText: {
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_BOLD,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 8,
    },
    cancelText: {
      color: theme.colors.white,
      fontFamily: Fonts.NUNITO_BOLD,
    },
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay]}>
        <View style={[styles.alertBox, { borderColor }]}>
          {image && <Image source={image} style={styles.image} />}
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.bottomContainer}>
            {showCancelButton && (
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.cancelButton, { backgroundColor: cancelColor }]}
              >
                <Text style={styles.cancelText}>{cancelText || "No"}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onConfirm || onClose}
              style={[styles.button, { backgroundColor: themeColor }]}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
