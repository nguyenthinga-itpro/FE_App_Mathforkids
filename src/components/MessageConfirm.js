import React from "react";
import BaseMessage from "./BaseMessage";
import { useTheme } from "../themes/ThemeContext";
import { useTranslation } from "react-i18next";

export default function MessageConfirm({
  visible,
  title,
  description,
  onClose,
  onCancel,
}) {
  const { theme } = useTheme();
  const { t } = useTranslation("loading");

  return (
    <BaseMessage
      visible={visible}
      image={theme.icons.confirm}
      title={title}
      description={description}
      onClose={onClose}
      onCancel={onCancel}
      showCancelButton={true}
      cancelText={t("no")}
      themeColor={theme.colors.confirm}
      borderColor={theme.colors.confirm}
      cancelColor={theme.colors.cancel}
      buttonText={t("ok")}
    />
  );
}
