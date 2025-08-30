import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export default function StepZeroInput({
  number1,
  number2,
  operator,
  setNumber1,
  setNumber2,
  setOperator,
  dynamicFontSize,
  getMaxLength,
  styles,
  routeOperator,
  autoNumber1,
  autoNumber2,
  grade,
}) {
  const isLock = !!routeOperator && autoNumber1 !== "" && autoNumber2 !== "";
  const isGradeOne = grade === "1";

  return (
    <View style={styles.stepZeroContainer}>
      <View style={styles.operatorRow}>
        {["+", "-", "×", "÷"].map((op) => (
          <TouchableOpacity
            key={op}
            onPress={() => {
              if (!isLock && !(isGradeOne && (op === "×" || op === "÷"))) {
                setOperator(op);
              }
            }}
            style={[
              styles.operatorButton,
              operator === op ? styles.operatorActive : styles.operatorInactive,
            ]}
            disabled={isLock || (isGradeOne && (op === "×" || op === "÷"))}
          >
            <View style={styles.operatorSymbolContainer}>
              <Text style={styles.operatorSymbol}>{op}</Text>
              {isGradeOne && (op === "×" || op === "÷") && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={40} color="#ffffff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberInputRow}>
        {number1 === "" && (
          <Text style={[styles.placeholderText, styles.placeholderLeft]}>
            Num 1
          </Text>
        )}
        <TextInput
          style={[styles.inputBox, { fontSize: dynamicFontSize(number1) }]}
          value={number1}
          onChangeText={setNumber1}
          keyboardType="numeric"
          maxLength={getMaxLength(1)}
          editable={!isLock}
          selectTextOnFocus={!isLock}
        />
        {number2 === "" && (
          <Text style={[styles.placeholderText, styles.placeholderRight]}>
            Num 2
          </Text>
        )}
        <TextInput
          style={[styles.inputBox, { fontSize: dynamicFontSize(number2) }]}
          value={number2}
          onChangeText={setNumber2}
          keyboardType="numeric"
          maxLength={getMaxLength(2)}
          editable={!isLock}
          selectTextOnFocus={!isLock}
        />
      </View>
    </View>
  );
}
