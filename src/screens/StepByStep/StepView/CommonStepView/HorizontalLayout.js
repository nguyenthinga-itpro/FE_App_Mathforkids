import { View, Text } from "react-native";
export default function HorizontalLayout({
  number1,
  operator,
  number2,
  styles,
}) {
  return (
    <View style={styles.horizontalBox}>
      <View style={styles.dashedBox}>
        <Text
          style={styles.horizontalText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {number1}
        </Text>
      </View>
      <View style={styles.dashedOperatorBox}>
        <Text style={styles.horizontalText}>{operator}</Text>
      </View>
      <View style={styles.dashedBox}>
        <Text
          style={styles.horizontalText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {number2}
        </Text>
      </View>
    </View>
  );
}
