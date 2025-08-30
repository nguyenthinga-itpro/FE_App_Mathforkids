import { View, Text } from "react-native";

export default function ResultBox({ currentStep, styles }) {
  return (
    <View style={styles.resultTextContainer}>
      {currentStep.result !== "" && (
        <Text
          style={styles.resultText}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {currentStep.result}
        </Text>
      )}
    </View>
  );
}
