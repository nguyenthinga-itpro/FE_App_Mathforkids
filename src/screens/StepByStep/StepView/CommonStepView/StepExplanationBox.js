import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useTranslation } from "react-i18next"; 

const convertMathSymbolsToSpeech = (text, lang) => {
  let converted = text;

  if (lang === "vi") {
    converted = converted
      .replace(/\+/g, " cộng ")
      .replace(/-/g, " trừ ")
      .replace(/x/gi, " nhân ")
      .replace(/÷/g, " chia ")
      .replace(/=/g, " bằng ");
  } else if (lang === "en") {
    converted = converted
      .replace(/\+/g, " plus ")
      .replace(/-/g, " minus ")
      .replace(/x/gi, " times ")
      .replace(/÷/g, " divided by ")
      .replace(/=/g, " equals ");
  }

  return converted;
};

export default function StepExplanationBox({
  stepIndex,
  currentStep,
  styles,
  getGradient,
  theme,
  t,
}) {
  const { i18n } = useTranslation();

  return (
    <View style={styles.titleContainer}>
      <LinearGradient colors={getGradient()} style={styles.soundContainer}>
        <TouchableOpacity
          onPress={() => {
            Speech.stop();

            if (stepIndex === 0) {
              Speech.speak(t("instruction.enter_numbers"), {
                language: i18n.language === "vi" ? "vi-VN" : "en-US",
                pitch: 1,
                rate: 0.9,
              });
            } else if (currentStep?.title || currentStep?.description) {
              const rawText = `${currentStep.title || ""}. ${
                currentStep.description || ""
              }`;

              const speechText = convertMathSymbolsToSpeech(
                rawText,
                i18n.language
              );

              Speech.speak(speechText, {
                language: i18n.language === "vi" ? "vi-VN" : "en-US",
                pitch: 1,
                rate: 0.9,
              });
            }
          }}
        >
          <Ionicons name="volume-medium" size={30} color={theme.colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {stepIndex === 0 ? (
        <Text style={styles.title}>{t("instruction.enter_numbers")}</Text>
      ) : (
        currentStep?.title && (
          <Text
            style={styles.title}
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {currentStep.title}
            {"\n"}
            {currentStep.description}
          </Text>
        )
      )}
    </View>
  );
}
