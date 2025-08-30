import { View, Text } from "react-native";
export default function VerticalLayout({
  number1,
  number2,
  operator,
  currentStep,
  stepIndex,
  styles,
}) {
  return (
    <View style={styles.verticalWrap}>
      <Text style={styles.operatorOutside}>{operator}</Text>

      <View style={styles.verticalBox}>
        <View style={styles.verticalDashedBox}>
          <Text style={styles.verticalText}>{number1}</Text>
        </View>
        <View style={styles.verticalDashedBox}>
          <Text style={styles.verticalText}>{number2}</Text>
        </View>
        <View style={styles.verticalDashedBox}>
          <Text style={styles.verticalText}>──────</Text>
        </View>
        <View style={styles.verticalDashedBox}>
          <Text style={styles.verticalText}>
            {stepIndex === 3 ? currentStep.result : "?"}
          </Text>
        </View>
      </View>
    </View>
  );
}
