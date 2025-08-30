import React from "react";
import BaseMessage from "./BaseMessage";
import { useTheme } from "../themes/ThemeContext";
import { useTranslation } from "react-i18next";

export default function MessageWarning({
  visible,
  title,
  description,
  onCancel,
  onConfirm,
  showCancelButton = true,
}) {
  const { theme } = useTheme();
  const { t } = useTranslation("loading");

  return (
    <BaseMessage
      visible={visible}
      image={theme.icons.warning}
      title={title}
      description={description}
      onCancel={onCancel}
      onConfirm={onConfirm}
      showCancelButton={showCancelButton}
      cancelText={t("no")}
      themeColor={theme.colors.warning}
      borderColor={theme.colors.warning}
      cancelColor={theme.colors.cancel}
      buttonText={t("ok")}
    />
  );
}
