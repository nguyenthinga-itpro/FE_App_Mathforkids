import React from "react";
import BaseMessage from "./BaseMessage";
import { useTheme } from "../themes/ThemeContext";

import { useTranslation } from "react-i18next";
export default function MessageError({ visible, title, description, onClose }) {
  const { theme } = useTheme();
  const { t } = useTranslation("loading");
  return (
    <BaseMessage
      visible={visible}
      image={theme.icons.error}
      title={title}
      description={description}
      onClose={onClose}
      themeColor={theme.colors.cancel}
      borderColor={theme.colors.cancel}
      buttonText={t("again")}
    />
  );
}
