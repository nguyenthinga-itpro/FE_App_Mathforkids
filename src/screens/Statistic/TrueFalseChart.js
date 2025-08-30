import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { LineChart } from "react-native-chart-kit";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../themes/ThemeContext";
const screenWidth = Dimensions.get("window").width;
const sanitize = (value) =>
  Number.isFinite(value) && !isNaN(value) ? value : 0;

export default function TrueFalseChart({
  t,
  styles,
  accuracyByMonth = [],
  retryList = [],
  correct = 0,
  wrong = 0,
  total = 0,
  data = [],
  weakSkills = [],
  rangeType = "month",
  selectedRange,
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { theme } = useTheme();
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const [selectedBarLevelIndex, setSelectedBarLevelIndex] = useState(null);
  // Tim levelName theo exerciseId
  const enrichedRetryList = retryList.map((retryItem) => {
    const match = data.find((item) => item.exerciseId === retryItem.exerciseId);
    return {
      ...retryItem,
      levelName:
        match?.levelName?.[i18n.language] || match?.levelName?.en || null,
    };
  });
  // Xử lý label hiển thị theo rangeType
  const getLabelFromRange = (rangeKey) => {
    if (rangeType === "week") return t("week") + " " + rangeKey.split("-W")[1];
    if (rangeType === "quarter")
      return t("quarter") + " " + rangeKey.split("-Q")[1];
    return moment(rangeKey).format("MM/YYYY");
  };
  const accuracies = accuracyByMonth.map((m) => sanitize(m.accuracy));
  const wrongs = accuracyByMonth.map((m) => sanitize(100 - m.accuracy));
  const labels = accuracyByMonth.map((m) => getLabelFromRange(m.range));

  const chartData = {
    labels,
    datasets: [
      {
        data: wrongs,
        color: () => theme.colors.chartRed,
        strokeWidth: 2,
      },
      {
        data: accuracies,
        color: () => theme.colors.chartGreen,
        strokeWidth: 2,
      },
      {
        data: [0, 0],
        color: () => theme.colors.white,
        strokeWidth: 0,
        withDots: false,
      },
    ],
    legend: [t("wrong"), t("correct")],
  };

  //Bieu do hieu xuat
  const resultByRange = {};
  // Gom dữ liệu đúng/sai theo từng rangeKey
  accuracyByMonth.forEach((m) => {
    resultByRange[m.range] = { correct: m.correct, wrong: m.wrong };
  });
  // Sắp xếp các range theo thời gian
  const sortedRanges = Object.keys(resultByRange).sort();
  // Tạo dữ liệu cho stackedBar chart
  const stackedBarData = sortedRanges.map((range, index) => ({
    label: getLabelFromRange(range),
    stacks: [
      { value: resultByRange[range].correct, color: theme.colors.chartGreen },
      { value: resultByRange[range].wrong, color: theme.colors.chartRed },
    ],
    onPress: () => setSelectedBarIndex(index),
  }));

  const chartHeight = 240;
  const maxValue = 30;
  const unitHeight = chartHeight / maxValue;
  const barWidth = 28;
  const spacing = 40;
  const leftOffset = 16;
  const tooltipWidth = selectedBarIndex === 0 ? -135 : -195;
  const totals =
    stackedBarData[selectedBarIndex]?.stacks?.reduce(
      (sum, s) => sum + s.value,
      0
    ) || 0;
  const offset = 45;

  const topOffset = chartHeight - totals * unitHeight - offset;
  const left =
    leftOffset +
    selectedBarIndex * (barWidth + spacing) +
    barWidth / 2 -
    tooltipWidth / 2;

  // Bieu do cau dung sai theo cap do
  const resultByLevel = {};
  data.forEach((item) => {
    const level =
      item.levelName?.[i18n.language] || item.levelName?.en || "Unknown";
    if (!resultByLevel[level]) {
      resultByLevel[level] = { correct: 0, wrong: 0 };
    }
    resultByLevel[level][item.isCorrect ? "correct" : "wrong"] += 1;
  });
  const levelLabels = Object.keys(resultByLevel);
  const stackedLevelData = levelLabels.map((level, index) => {
    const { correct, wrong } = resultByLevel[level];
    const total = correct + wrong;
    const correctPercent = total > 0 ? (correct / total) * 100 : 0;
    const wrongPercent = total > 0 ? (wrong / total) * 100 : 0;
    return {
      label: level,
      stacks: [
        { value: correctPercent, color: theme.colors.chartGreen },
        { value: wrongPercent, color: theme.colors.chartRed },
      ],
      onPress: () => setSelectedBarLevelIndex(index),
    };
  });
  const yAxisLabelTexts = Array.from({ length: 11 }, (_, i) => `${i * 10}%`);
  // Thong ke cau dung/sai nhieu nhat o level nao
  const levelStats = {};
  data.forEach((item) => {
    const levelName = item.levelName?.vi || item.levelName?.en || "Unknown";
    if (!levelStats[levelName]) {
      levelStats[levelName] = { correct: 0, wrong: 0 };
    }
    if (item.isCorrect) {
      levelStats[levelName].correct += 1;
    } else {
      levelStats[levelName].wrong += 1;
    }
  });
  // Tìm level sai nhiều nhất
  const mostWrongLevel = Object.entries(levelStats).reduce(
    (max, [level, stats]) => {
      return stats.wrong > (max?.stats?.wrong || 0) ? { level, stats } : max;
    },
    null
  );
  // Tìm level đúng nhiều nhất
  const mostCorrectLevel = Object.entries(levelStats).reduce(
    (max, [level, stats]) => {
      return stats.correct > (max?.stats?.correct || 0)
        ? { level, stats }
        : max;
    },
    null
  );
  useEffect(() => {
    if (selectedBarIndex !== null) {
      const timeout = setTimeout(() => {
        setSelectedBarIndex(null);
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [selectedBarIndex]);
  useEffect(() => {
    if (selectedBarLevelIndex !== null) {
      const timeout = setTimeout(() => {
        setSelectedBarLevelIndex(null);
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [selectedBarLevelIndex]);
  // gui time cho bieu do 1
  const selectedMonth = selectedPoint
    ? accuracyByMonth[selectedPoint.index]
    : null;
  // gui time cho bieu do 2
  const time = stackedBarData.at(-1)?.label || "";
  const totalTrue = stackedBarData.reduce(
    (sum, item) => sum + (item.stacks?.[0]?.value || 0),
    0
  );
  const accuracy = total > 0 ? (totalTrue / total) * 100 : 0;
  let comment = "";
  if (accuracy >= 80) {
    comment = t("excellentAccuracy", { correct: accuracy.toFixed(1), time });
  } else if (accuracy >= 50) {
    comment = t("goodAccuracy", {
      correct: accuracy.toFixed(1),
      incorrect: (100 - accuracy).toFixed(1),
      time,
    });
  } else {
    comment = t("lowAccuracy", { correct: accuracy.toFixed(1), time });
  }

  return (
    <ScrollView contentContainerStyle={styles.containerTF}>
      {/* Biểu đồ Accuracy */}
      {accuracyByMonth.length > 0 && (
        <>
          <Text
            style={styles.chartTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            Caves
            minimumFontScale={0.5}
          >
            {t("accuracyOverTime")}
          </Text>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={240}
            fromZero
            yAxisSuffix="%"
            bezier
            chartConfig={{
              backgroundGradientFrom: theme.colors.cardBackground,
              backgroundGradientTo: theme.colors.cardBackground,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => theme.colors.black,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: theme.colors.white,
              },
              useShadowColorFromDataset: true,
              fillShadowGradientOpacity: 0.3,
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
            onDataPointClick={({ value, index, dataset, x, y }) => {
              setSelectedPoint({ value, index, datasetIndex: dataset, x, y });
              setTimeout(() => setSelectedPoint(null), 6000);
            }}
            renderDotContent={({ x, y, index }) =>
              selectedPoint?.index === index &&
              selectedPoint?.x === x &&
              selectedPoint?.y === y ? (
                <View
                  key={`dot-${index}`}
                  style={{
                    position: "absolute",
                    top: y - 300,
                    left: x - 20,
                    backgroundColor: theme.colors.chartRed,
                    padding: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: theme.colors.white, fontSize: 10 }}>
                    {selectedPoint.value.toFixed(1)}%
                  </Text>
                </View>
              ) : null
            }
          />
          <View style={styles.chartTFNote}>
            <Text style={styles.chartNote}>
              {t("accuracyOverTime")} – {t("comment")}:{" "}
              {selectedMonth
                ? selectedMonth.accuracy >= 80
                  ? t("excellentAccuracy", {
                      correct: selectedMonth.accuracy,
                      time: selectedMonth.range,
                    })
                  : selectedMonth.accuracy >= 50
                  ? t("goodAccuracy", {
                      correct: selectedMonth.accuracy,
                      incorrect: (100 - selectedMonth.accuracy).toFixed(1),
                      time: selectedMonth.range,
                    })
                  : t("lowAccuracy", {
                      correct: selectedMonth.accuracy,
                      time: selectedMonth.range,
                    })
                : t("tapToSeeComment")}
            </Text>
          </View>
        </>
      )}

      {/* Biểu đồ đúng/sai theo tháng */}
      {stackedBarData.length > 0 && (
        <>
          <Text
            style={styles.chartTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            Caves
            minimumFontScale={0.5}
          >
            {t("correctWrongByMonth")}
          </Text>
          <View style={[styles.chartWrapperWithMargin, { marginBottom: 10 }]}>
            <View style={styles.noteContainer}>
              <View style={styles.noteItem}>
                <View
                  style={[
                    styles.noteColorBox,
                    { backgroundColor: theme.colors.chartGreen },
                  ]}
                />
                <Text style={styles.noteLabel}>{t("correct")}</Text>
              </View>
              <View style={styles.noteItem}>
                <View
                  style={[
                    styles.noteColorBox,
                    { backgroundColor: theme.colors.chartRed },
                  ]}
                />
                <Text style={styles.noteLabel}>{t("wrong")}</Text>
              </View>
            </View>
            <Text style={styles.yAxisUnitLabel}>
              {t("unit")}: {t("questions")}
            </Text>
            <BarChart
              stackData={stackedBarData}
              barWidth={40}
              spacing={60}
              height={200}
              yAxisColor={{ color: theme.colors.black }}
              xAxisColor={{ color: theme.colors.black }}
              xAxisLabelTextStyle={styles.chartAxisLabel}
              yAxisTextStyle={styles.chartAxisText}
              showValuesOnTopOfBars
              selectedIndex={selectedBarIndex}
              showTooltip={false}
            />
            {selectedBarIndex !== null && (
              <View style={styles.tooltipContainer}>
                <Text style={styles.tooltipText}>
                  {t("total")}:{" "}
                  {stackedBarData[selectedBarIndex]?.stacks[0].value +
                    stackedBarData[selectedBarIndex]?.stacks[1].value}
                </Text>
                <Text style={styles.correctText}>
                  {t("correct")}:{" "}
                  {stackedBarData[selectedBarIndex]?.stacks[0].value}
                </Text>
                <Text style={styles.wrongText}>
                  {t("wrong")}:{" "}
                  {stackedBarData[selectedBarIndex]?.stacks[1].value}
                </Text>
              </View>
            )}
          </View>
          {stackedBarData.length > 0 && (
            <View style={styles.chartTFNote}>
              <Text style={styles.chartNote}>
                {t("correctWrongByMonth")} – {t("comment")}:{" "}
                {t("tapToSeeComment")}
              </Text>

              {selectedBarIndex !== null &&
                (() => {
                  const item = stackedBarData[selectedBarIndex];
                  const trueVal = item.stacks?.[0]?.value || 0;
                  const falseVal = item.stacks?.[1]?.value || 0;
                  const total = trueVal + falseVal;
                  const accuracy = total > 0 ? (trueVal / total) * 100 : 0;

                  return (
                    <Text style={styles.chartNote}>
                      {accuracy >= 80
                        ? t("excellentAccuracy", {
                            correct: accuracy.toFixed(1),
                            time: item.label,
                          })
                        : accuracy >= 50
                        ? t("goodAccuracy", {
                            correct: accuracy.toFixed(1),
                            incorrect: (100 - accuracy).toFixed(1),
                            time: item.label,
                          })
                        : t("lowAccuracy", {
                            correct: accuracy.toFixed(1),
                            time: item.label,
                          })}
                    </Text>
                  );
                })()}
            </View>
          )}
        </>
      )}

      {/* Tinh theo level */}
      {stackedLevelData.length > 0 && (
        <>
          <Text
            style={styles.chartTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            Caves
            minimumFontScale={0.5}
          >
            {t("accuracyByLevel")}
          </Text>
          <View style={[styles.chartWrapperWithMargin, { marginBottom: 10 }]}>
            <View style={styles.noteContainer}>
              <View style={styles.noteItem}>
                <View
                  style={[
                    styles.noteColorBox,
                    { backgroundColor: theme.colors.chartGreen },
                  ]}
                />
                <Text style={styles.noteLabel}>{t("correct")}</Text>
              </View>
              <View style={styles.noteItem}>
                <View
                  style={[
                    styles.noteColorBox,
                    { backgroundColor: theme.colors.chartRed },
                  ]}
                />
                <Text style={styles.noteLabel}>{t("wrong")}</Text>
              </View>
            </View>

            <BarChart
              stackData={stackedLevelData}
              barWidth={40}
              spacing={40}
              height={200}
              yAxisColor={{ color: theme.colors.black }}
              xAxisColor={{ color: theme.colors.black }}
              maxValue={100}
              yAxisLabelTexts={yAxisLabelTexts}
              xAxisLabelTextStyle={styles.chartAxisLabel}
              yAxisTextStyle={styles.chartAxisText}
              showValuesOnTopOfBars={true}
            />
            {selectedBarLevelIndex !== null && (
              <View style={styles.levelTooltipContainer}>
                <Text style={styles.levelLabel}>
                  {levelLabels[selectedBarLevelIndex]}
                </Text>
                <Text style={styles.levelCorrect}>
                  {t("correct")}:{" "}
                  {resultByLevel[levelLabels[selectedBarLevelIndex]].correct} (
                  {sanitize(
                    (resultByLevel[levelLabels[selectedBarLevelIndex]].correct /
                      (resultByLevel[levelLabels[selectedBarLevelIndex]]
                        .correct +
                        resultByLevel[levelLabels[selectedBarLevelIndex]]
                          .wrong)) *
                      100
                  ).toFixed(1)}
                  %)
                </Text>
                <Text style={styles.levelWrong}>
                  {t("wrong")}:{" "}
                  {resultByLevel[levelLabels[selectedBarLevelIndex]].wrong} (
                  {sanitize(
                    (resultByLevel[levelLabels[selectedBarLevelIndex]].wrong /
                      (resultByLevel[levelLabels[selectedBarLevelIndex]]
                        .correct +
                        resultByLevel[levelLabels[selectedBarLevelIndex]]
                          .wrong)) *
                      100
                  ).toFixed(1)}
                  %)
                </Text>
              </View>
            )}
          </View>
          {mostWrongLevel && mostCorrectLevel && (
            <View style={styles.chartTFNote}>
              <Text style={styles.chartNote}>
                {t("mostCorrectLevel")}: {mostCorrectLevel.level} (
                {mostCorrectLevel.stats.correct} {t("times")}) –{" "}
                {t("mostWrongLevel")}: {mostWrongLevel.level} (
                {mostWrongLevel.stats.wrong} {t("times")})
              </Text>
            </View>
          )}
        </>
      )}

      <View style={styles.summaryTFContainer}>
        {/* Tổng kết tiêu đề */}
        <Text style={styles.summaryTitle}>
          {t("summary")} ({selectedRange?.join(" → ")})
        </Text>

        {/* Tổng đúng/sai toàn giai đoạn */}
        <Text style={styles.commentText}>
          {t("performance")}: {correct} / {total} (
          {sanitize((correct / total) * 100).toFixed(1)}%)
        </Text>

        {/* So sánh xu hướng giữa 2 giai đoạn */}
        {Array.isArray(accuracyByMonth) &&
          accuracyByMonth.length > 1 &&
          (() => {
            const [prev, curr] = accuracyByMonth;
            const prevAcc = sanitize(
              (prev.correct / (prev.correct + prev.wrong)) * 100
            );
            const currAcc = sanitize(
              (curr.correct / (curr.correct + curr.wrong)) * 100
            );
            const diff = sanitize(currAcc - prevAcc);

            return (
              <Text style={styles.summaryItem}>
                {t("trend")}: {diff >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(diff).toFixed(1)}% (
                {t(diff >= 0 ? "increased" : "decreased")})
              </Text>
            );
          })()}

        {/* Chi tiết đúng/sai theo từng giai đoạn */}
        {Array.isArray(accuracyByMonth) &&
          accuracyByMonth.map((item, index) => {
            const correct = sanitize(item.correct || 0);
            const wrong = sanitize(item.wrong || 0);
            const total = correct + wrong;
            const acc = total > 0 ? (correct / total) * 100 : 0;
            const wr = total > 0 ? (wrong / total) * 100 : 0;

            return (
              <Text
                key={item.range || item.month || index}
                style={styles.commentText}
              >
                {item.range || item.month}: {t("correct")}: {correct}/{total} (
                {acc.toFixed(1)}%), {t("wrong")}: {wrong}/{total} (
                {wr.toFixed(1)}%)
              </Text>
            );
          })}

        {/* Nhận định cải thiện */}
        {Array.isArray(accuracyByMonth) &&
          accuracyByMonth.length > 1 &&
          (() => {
            const [prev, curr] = accuracyByMonth;
            const prevAcc = sanitize(
              (prev.correct / (prev.correct + prev.wrong)) * 100
            );
            const currAcc = sanitize(
              (curr.correct / (curr.correct + curr.wrong)) * 100
            );

            const comment =
              currAcc >= 80
                ? t("greatProgress")
                : currAcc >= prevAcc
                ? t("improving")
                : t("needImprovement");

            return (
              <Text style={styles.commentText}>
                {t("insight")}: {comment}
              </Text>
            );
          })()}

        {/* Kỹ năng yếu */}
        {weakSkills.length > 0 && (
          <Text style={styles.commentText}>
            {t("weakSkills")}: {weakSkills.map((s) => t(s)).join(", ")}
          </Text>
        )}

        {/* Cấp độ đúng/sai nhiều nhất */}
        {mostCorrectLevel && (
          <Text style={styles.commentText}>
            {t("mostCorrectLevel")}: {mostCorrectLevel.level} (
            {mostCorrectLevel.stats.correct} {t("times")})
          </Text>
        )}
        {mostWrongLevel && (
          <Text style={styles.commentText}>
            {t("mostWrongLevel")}: {mostWrongLevel.level} (
            {mostWrongLevel.stats.wrong} {t("times")})
          </Text>
        )}
      </View>

      {/* Danh sách cần luyện lại */}
      {enrichedRetryList.length > 0 && (
        <View style={styles.retryContainer}>
          <Text style={styles.retryTitle}>{t("shouldRetry")}</Text>
          {enrichedRetryList.map((r, i) => (
            <View key={i} style={styles.retryItem}>
              <Text style={styles.retryText}>
                {r.question?.[currentLang] || r.question?.en || t("noQuestion")}
              </Text>
              {r.image && (
                <Image source={{ uri: r.image }} style={styles.retryImage} />
              )}
              <Text style={styles.retryCount}>
                {t("wrongTimes")}: {r.wrongTimes}
              </Text>
              <Text style={styles.retryCount}>
                {t("level")}: {r.levelName}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
