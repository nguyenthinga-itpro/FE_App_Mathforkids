import React, { useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "../../themes/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { getLessonsByGradeAndType } from "../../redux/lessonSlice";

// Component hiển thị biểu đồ cột so sánh điểm số học tập
export default function AcademicChart({
  t,
  styles,
  skills,
  pointStats,
  fullLessonStats,
  screenWidth,
  thisRange,
  lastRange,
  language,
  grade,
  type,
  pupilId,
}) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const scoreCategories = ["<5", "≥5", "≥7", "≥9"];
  const lessons = useSelector((state) => state.lesson.lessons);

  // Lấy dữ liệu bài học dựa trên grade, type và pupilId
  useEffect(() => {
    if (grade && type && pupilId) {
      dispatch(getLessonsByGradeAndType({ grade, type, pupilId }));
    }
  }, [dispatch, grade, type, pupilId]);

  // Phân tích sự cải thiện dựa trên pointStats
  const improvementAnalysis = useMemo(() => {
    if (
      !pointStats?.compareByType ||
      !Object.keys(pointStats.compareByType).length
    ) {
      return t("noDataAvailable");
    }

    const calculateScores = (range) => {
      let highScores = 0;
      let lowScores = 0;
      skills.forEach((skill) => {
        const skillData = pointStats.compareByType[skill]?.[range];
        if (skillData) {
          highScores += (skillData["≥9"] || 0) + (skillData["≥7"] || 0);
          lowScores += skillData["<5"] || 0;
        }
      });
      return { highScores, lowScores };
    };

    const thisPeriod = calculateScores(thisRange);
    const lastPeriod = calculateScores(lastRange);

    let improvementMessage = "";
    if (
      thisPeriod.lowScores < lastPeriod.lowScores &&
      thisPeriod.highScores >= lastPeriod.highScores
    ) {
      improvementMessage = t("improvementNoticed", {
        range: thisRange,
        lowScoreReduction: lastPeriod.lowScores - thisPeriod.lowScores,
      });
    } else if (thisPeriod.lowScores > lastPeriod.lowScores) {
      improvementMessage = t("moreLowScores", {
        range: thisRange,
        lowScoreIncrease: thisPeriod.lowScores - lastPeriod.lowScores,
      });
    } else if (thisPeriod.highScores > lastPeriod.highScores) {
      improvementMessage = t("moreHighScores", {
        range: thisRange,
        highScoreIncrease: thisPeriod.highScores - lastPeriod.highScores,
      });
    } else {
      improvementMessage = t("noSignificantChange", { range: thisRange });
    }

    return improvementMessage;
  }, [pointStats, thisRange, lastRange, skills, t]);

  // Tạo thông báo về các bài học cần cải thiện
  const notificationMessage = useMemo(() => {
    if (!fullLessonStats?.compareByLesson) return [t("noDataAvailable")];

    const lessonNameMap = lessons.reduce((map, lesson) => {
      if (lesson.id && lesson.name?.[language]) {
        map[lesson.id] = lesson.name[language];
      }
      return map;
    }, {});

    const scoresByLesson = Object.entries(
      fullLessonStats.compareByLesson
    ).flatMap(([skill, lessons]) =>
      Object.entries(lessons).map(([lessonKey, data]) => ({
        lessonId: lessonKey.split(": ")[1],
        highScores:
          (data[thisRange]?.["≥9"] || 0) + (data[thisRange]?.["≥7"] || 0),
        lowScores: data[thisRange]?.["<5"] || 0,
      }))
    );

    const lessonsToImprove = scoresByLesson
      .filter(({ highScores, lowScores }) => lowScores > highScores)
      .map(
        ({ lessonId }) =>
          `${lessonNameMap[lessonId] || lessonId} ${t("needsImprovement")}`
      );

    return lessonsToImprove.length
      ? [...lessonsToImprove, improvementAnalysis]
      : [t("noLessonsNeedImprovement"), improvementAnalysis];
  }, [fullLessonStats, thisRange, language, t, lessons, improvementAnalysis]);

  // Kiểm tra nếu không có dữ liệu để hiển thị
  if (
    !pointStats?.compareByType ||
    !Object.keys(pointStats.compareByType).length
  ) {
    return (
      <View
        style={[
          styles.academicChartContainers,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text
          style={[
            styles.chartName,
            { textAlign: "center", fontSize: 20, fontWeight: "600" },
          ]}
        >
          {t("academicProgress")}
        </Text>
      </View>
    );
  }

  // Tổng hợp dữ liệu cho biểu đồ
  const aggregatedData = scoreCategories.map((category) => {
    const thisPeriodTotal = skills.reduce((sum, skill) => {
      const skillData = pointStats.compareByType[skill]?.[thisRange]?.[category] || 0;
      return sum + (skillData || 0);
    }, 0);

    const lastPeriodTotal = skills.reduce((sum, skill) => {
      const skillData = pointStats.compareByType[skill]?.[lastRange]?.[category] || 0;
      return sum + (skillData || 0);
    }, 0);

    return [lastPeriodTotal, thisPeriodTotal, 0]; // [lastPeriod, thisPeriod, padding]
  });

  // Kiểm tra nếu có dữ liệu để hiển thị biểu đồ
  const shouldShowChart = aggregatedData.some((data) => data.some((val) => val > 0));
  if (!shouldShowChart) {
    return (
      <View
        style={[
          styles.academicChartContainers,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text
          style={[
            styles.chartName,
            { textAlign: "center", fontSize: 20, fontWeight: "600" },
          ]}
        >
          {t("academicProgress")}
        </Text>
      </View>
    );
  }

  // Cấu hình dữ liệu cho biểu đồ
  const chartData = {
    labels: scoreCategories.flatMap((cat) => [cat, ""]),
    datasets: [
      {
        data: aggregatedData.flat(),
        colors: [
          ...scoreCategories.flatMap(() => [
            () => "#FF6F61", // Màu cho lastPeriod
            () => "#6BCB77", // Màu cho thisPeriod
            () => "rgba(0,0,0,0)", // Padding
          ]),
        ],
      },
    ],
    legend: [t(lastRange), t(thisRange)],
  };

  // Cấu hình giao diện cho biểu đồ
  const maxDataValue = Math.max(...aggregatedData.flat()) || 1;
  const chartConfig = {
    backgroundColor: "#F5F5F5",
    backgroundGradientFrom: "#F5F5F5",
    backgroundGradientTo: "#F5F5F5",
    decimalPlaces: 0,
    color: () => theme.colors.black || "#333",
    labelColor: () => "#333",
    barPercentage: 0.7,
    formatYLabel: (value) => `${Math.max(Math.round(value), 0)}`,
    minY: 0,
    maxY: maxDataValue === 1 ? 2 : maxDataValue + 1, // Ensure Y-axis goes to 2 if maxDataValue is 1
    yAxisLabel: "",
    withVerticalLines: true,
    withHorizontalLines: true,
    propsForBackgroundLines: {
      stroke: "#E0E0E0",
      strokeWidth: 1,
    },
    propsForVerticalLines: {
      stroke: "#666",
      strokeWidth: 2,
      strokeDashArray: "",
    },
    propsForLabels: {
      fontSize: 14,
      fontWeight: "500",
    },
    segments: maxDataValue === 1 ? 2 : Math.max(2, Math.ceil(maxDataValue)), // Show 0, 1, 2 for maxDataValue=1
  };

  return (
    <View
      style={[
        styles.academicChartContainers,
        { padding: 16, borderRadius: 12, alignItems: "center" },
      ]}
    >
      <Text
        style={[
          styles.chartName,
          { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 16 },
        ]}
      >
        {t("academicProgress")}
      </Text>
      <View style={[styles.back, { alignItems: "center" }]}>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={320}
          spacing={80}
          fromZero
          flatColor
          segments={Math.max(2, Math.ceil(maxDataValue))} // Đảm bảo ít nhất 2 đoạn
          chartConfig={chartConfig}
          withCustomBarColorFromData
          showTooltip={false}
          showBarTops={false}
          withVerticalLines={true}
          style={styles.academicChartContainer}
        />
        <View
          style={[
            styles.chartNoteContainer,
            { flexDirection: "row", justifyContent: "center", marginTop: 16 },
          ]}
        >
          <View
            style={[
              styles.chartNote,
              { flexDirection: "row", alignItems: "center", marginRight: 20 },
            ]}
          >
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#FF6F61",
                borderRadius: 4,
              }}
            />
            <Text
              style={{
                marginLeft: 8,
                color: "#333",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {t(lastRange)}
            </Text>
          </View>
          <View
            style={[styles.chartNote, { flexDirection: "row", alignItems: "center" }]}
          >
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#6BCB77",
                borderRadius: 4,
              }}
            />
            <Text
              style={{
                marginLeft: 8,
                color: "#333",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {t(thisRange)}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.summaryTFContainer, { width: 330 }]}>
        <Text style={styles.summaryTitle}>{t("summary")}</Text>
        {notificationMessage.map((line, index) => (
          <Text key={index} style={styles.summaryItem}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
};