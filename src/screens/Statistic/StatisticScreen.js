import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../themes/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { getAllPupils } from "../../redux/pupilSlice";
import {
  getUserPointStatsComparison,
  getUserPointFullLesson,
  getAnswerStats,
} from "../../redux/statisticSlice";
import { getLessonsByGradeAndType } from "../../redux/lessonSlice";
import { notificationsByUserId } from "../../redux/userNotificationSlice";
import { getEnabledLevels } from "../../redux/levelSlice";
import { getTestsByPupilIdAndLessonId } from "../../redux/testSlice";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import FloatingMenu from "../../components/FloatingMenu";
import AcademicChart from "./AcademicChart";
import TrueFalseChart from "./TrueFalseChart";
import GoalChart from "./GoalChart";
import createStyles from "./styles";
import StatisticDropdowns from "./StatisticDropdowns";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

export default function StatisticScreen({ navigation }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation("statistic");
  const screenWidth = Dimensions.get("window").width - 32;
  const styles = createStyles(theme);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const users = useSelector((state) => state.auth.user);
  const pupils = useSelector((state) => state.pupil.pupils || []);
  const lessons = useSelector((state) => state.lesson.lessons || []);
  const testList = useSelector((state) => state.test.tests || []);
  const { pointStats, fullLessonStats, answerStats, error } = useSelector(
    (state) => state.statistic || {}
  );
  //   console.log("answerStats", answerStats);
  const notifications = useSelector((state) => state.notifications.list || []);
  const newNotificationCount = notifications.filter((n) => !n.isRead).length;

  const [selectedPupil, setSelectedPupil] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  //   console.log("selectedTest", selectedTest);
  const [selectedRangeType, setSelectedRangeType] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [showPupilDropdown, setShowPupilDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showLessonDropdown, setShowLessonDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  const [showRangeTypeDropdown, setShowRangeTypeDropdown] = useState(false);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [selectedChart, setSelectedChart] = useState("progress");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    skillSummary: [],
    weakSkills: [],
    accuracyByMonth: [],
    accuracyByWeek: [],
    retryList: [],
  });

  const {
    skillSummary,
    weakSkills,
    accuracyByMonth,
    accuracyByWeek,
    retryList,
  } = chartData;

  const filteredPupils = pupils.filter(
    (p) => String(p.userId) === String(users?.id)
  );

  const periods = ["thisWeek", "thisMonth", "thisQuarter"];
  const periodRanges = {
    thisWeek: ["thisWeek", "lastWeek"],
    thisMonth: ["thisMonth", "lastMonth"],
    thisQuarter: ["thisQuarter", "lastQuarter"],
  };

  const today = dayjs();
  const formatMonth = (date) => date.format("YYYY-MM");
  const formatWeek = (date) => `${date.format("YYYY")}-W${date.isoWeek()}`;
  const formatQuarter = (date) => `${date.year()}-Q${date.quarter()}`;

  const rangeTypeOptions = [
    {
      label: `${formatWeek(today.subtract(1, "week"))} - ${formatWeek(
        today
      )} (${t("lastWeek")} - ${t("thisWeek")})`,
      rangeType: "week",
      ranges: [formatWeek(today.subtract(1, "week")), formatWeek(today)],
    },
    {
      label: `${formatMonth(today.subtract(1, "month"))} - ${formatMonth(
        today
      )} (${t("lastMonth")} - ${t("thisMonth")})`,
      rangeType: "month",
      ranges: [formatMonth(today.subtract(1, "month")), formatMonth(today)],
    },
    {
      label: `${formatQuarter(today.subtract(1, "quarter"))} - ${formatQuarter(
        today
      )} (${t("lastQuarter")} - ${t("thisQuarter")})`,
      rangeType: "quarter",
      ranges: [
        formatQuarter(today.subtract(1, "quarter")),
        formatQuarter(today),
      ],
    },
  ];

  const testDetail = (answerStats?.data || []).filter(
    (detail) => String(detail.testId) === String(selectedTest?.id)
  );
  const isReadyForTrueFalseChart =
    selectedChart === "trueFalse" &&
    selectedPupil &&
    selectedRangeType &&
    answerStats;

  //   console.log(
  //     "answerStats.data.map testIds:",
  //     answerStats?.data?.map((d) => d.testId)
  //   );

  console.log("testDetail", testDetail);
  const skillTypes = useMemo(() => {
    if (selectedPupil?.grade === 1) {
      return ["addition", "subtraction"];
    }
    return ["addition", "subtraction", "multiplication", "division"];
  }, [selectedPupil]);

  const skillLabels = {
    addition: t("skill.add"),
    subtraction: t("skill.sub"),
    multiplication: t("skill.mul"),
    division: t("skill.div"),
  };
  useEffect(() => {
    if (isFocused) {
      dispatch(getAllPupils());
      if (users?.id) dispatch(notificationsByUserId(users.id));
      if (selectedPupil && selectedPupil.grade) {
        dispatch(
          getLessonsByGradeAndType({
            pupilId: selectedPupil.id,
            grade: selectedPupil.grade,
            type: selectedSkill || null, // Raw skill key
          })
        );
        console.log("Fetching lessons for:", {
          pupilId: selectedPupil.id,
          grade: selectedPupil.grade,
          type: selectedSkill, // Should be "addition", etc.
        });
      }
    }
  }, [isFocused, users?.id, selectedPupil, selectedSkill]);

  useEffect(() => {
    console.log("Lessons in store:", lessons);
  }, [lessons]);
  useEffect(() => {
    if (selectedPupil && selectedLesson?.id) {
      dispatch(
        getTestsByPupilIdAndLessonId({
          pupilId: selectedPupil.id,
          lessonId: selectedLesson.id,
        })
      );
    }
  }, [selectedPupil, selectedLesson]);
  useEffect(() => {
    if (selectedPupil && selectedPupil.grade && selectedPeriod) {
      const ranges = periodRanges[selectedPeriod] || ["thisMonth", "lastMonth"];
      dispatch(
        getUserPointStatsComparison({
          pupilId: selectedPupil.id,
          grade: selectedPupil.grade,
          ranges,
          lessonId: selectedLesson?.id || null,
          skill: selectedSkill || null, // Raw skill key
        })
      );
      dispatch(
        getUserPointFullLesson({
          pupilId: selectedPupil.id,
          grade: selectedPupil.grade,
          ranges,
          type: selectedSkill,
          skill: selectedSkill || null, // Raw skill key
        })
      );
      if (
        selectedPupil &&
        selectedLesson?.id &&
        selectedRangeType &&
        selectedRange
      ) {
        dispatch(
          getAnswerStats({
            pupilId: selectedPupil?.id,
            grade: selectedPupil?.grade,
            skill: selectedSkill,
            lessonId: selectedLesson.id,
            rangeType: selectedRangeType,
            ranges: selectedRange,
          })
        );
      }
    }
  }, [selectedPupil, selectedPeriod, selectedLesson, selectedSkill]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedPupil || !selectedRangeType) {
        console.log("Thiếu selectedPupil hoặc selectedRangeType");
        return;
      }

      setLoading(true);

      const ranges = selectedRange;

      const payload = {
        pupilId: selectedPupil.id,
        grade: selectedPupil.grade,
        ranges,
        rangeType: selectedRangeType,
        lessonId: selectedLesson?.id || null,
        skill: selectedSkill || null,
        // testId: selectedTest?.id || null,
      };

      console.log("Params getAnswerStats:", payload);

      const resultAction = await dispatch(getAnswerStats(payload));

      if (getAnswerStats?.fulfilled.match(resultAction)) {
        const raw = resultAction.payload;

        console.log("getAnswerStats result:", raw);

        const transformed = {
          ...raw,
          accuracyByMonth: (raw.accuracyByRange || []).map((item) => ({
            month: item.range,
            accuracy: item.accuracy,
            correct: item.correct,
            wrong: item.wrong,
          })),
        };

        setChartData(transformed);
      } else {
        console.log("getAnswerStats failed:", resultAction);
      }

      setLoading(false);
    };

    fetchStats();
  }, [
    selectedPupil,
    selectedSkill,
    selectedLesson,
    // selectedTest,
    selectedRangeType,
    selectedRange,
  ]);
  const testLists = answerStats?.tests.map((d) => d.testId);
  //   console.log("testLists", testLists);
  const chartSkills = selectedSkill
    ? [skillLabels[selectedSkill]]
    : skillTypes.map((type) => skillLabels[type]);

  const getWeightedScore = (type, rangeName) => {
    if (!pointStats || !Array.isArray(pointStats.compareByType)) {
      // console.warn("pointStats.compareByType is not an array or is undefined");
      return 0;
    }

    const found = pointStats.compareByType.find((s) => s.type === type);
    const rangeData = found?.ranges?.[rangeName];
    if (!rangeData) return 0;

    const weights = { "≥9": 10, "≥7": 8, "≥5": 6, "<5": 4 };
    return Object.entries(rangeData).reduce(
      (sum, [key, count]) => sum + (weights[key] || 0) * count,
      0
    );
  };

  const thisRange = periodRanges[selectedPeriod]?.[0];
  const lastRange = periodRanges[selectedPeriod]?.[1];
  const filteredLessons = useMemo(() => {
    return lessons.filter(
      (lesson) => !selectedSkill || lesson.type === selectedSkill // Uses raw key
    );
  }, [lessons, selectedSkill]);

  return (
    <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradientBluePrimary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userRow}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => navigation.navigate("DetailScreen")}
            >
              <Image
                source={
                  users?.image ? { uri: users?.image } : theme.icons.avatarAdd
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>{t("hello")}</Text>
              <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                {users?.fullName}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("NotificationScreen", { userId: users.id })
            }
          >
            <View style={styles.notificationContainer}>
              {newNotificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{newNotificationCount}</Text>
                </View>
              )}
              <Image
                source={theme.icons.notification}
                style={styles.notificationIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView>
        <View style={styles.chartTypeWrapper}>
          {/* , "goal" */}
          {["progress", "trueFalse"].map((chart) => (
            <TouchableOpacity
              key={chart}
              style={[
                styles.chartTypeButton,
                selectedChart === chart && styles.chartTypeButtonSelected,
              ]}
              onPress={() => setSelectedChart(chart)}
            >
              <Text
                style={[
                  styles.chartTypeText,
                  selectedChart === chart && styles.chartTypeTextSelected,
                ]}
              >
                {t(chart)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <StatisticDropdowns
          t={t}
          i18n={i18n}
          theme={theme}
          styles={styles}
          selectedChart={selectedChart}
          selectedPupil={selectedPupil}
          setSelectedPupil={setSelectedPupil}
          filteredPupils={filteredPupils}
          showPupilDropdown={showPupilDropdown}
          setShowPupilDropdown={setShowPupilDropdown}
          selectedSkill={selectedSkill}
          setSelectedSkill={setSelectedSkill}
          skillLabels={skillLabels}
          skillTypes={skillTypes}
          showSkillDropdown={showSkillDropdown}
          setShowSkillDropdown={setShowSkillDropdown}
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
          filteredLessons={filteredLessons}
          showLessonDropdown={showLessonDropdown}
          setShowLessonDropdown={setShowLessonDropdown}
          selectedTest={selectedTest}
          setSelectedTest={setSelectedTest}
          testList={testLists}
          showTestDropdown={showTestDropdown}
          setShowTestDropdown={setShowTestDropdown}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          showPeriodDropdown={showPeriodDropdown}
          setShowPeriodDropdown={setShowPeriodDropdown}
          periods={periods}
          periodRanges={periodRanges}
          selectedRangeType={selectedRangeType}
          setSelectedRange={setSelectedRange}
          setSelectedRangeType={setSelectedRangeType}
          showRangeTypeDropdown={showRangeTypeDropdown}
          setShowRangeTypeDropdown={setShowRangeTypeDropdown}
          rangeType={rangeTypeOptions}
          selectedRange={selectedRange}
          showRangeDropdown={showRangeDropdown}
          setShowRangeDropdown={setShowRangeDropdown}
          data={answerStats}
          testDetail={testDetail}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>{t("loadingStats")}</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}> {t("error")}</Text>
        ) : (
          <>
            {!loading && selectedChart === "progress" && (
              <AcademicChart
                t={t}
                styles={styles}
                screenWidth={screenWidth}
                skills={selectedSkill ? [selectedSkill] : skillTypes} // Pass raw keys instead of chartSkills
                pointStats={pointStats}
                fullLessonStats={fullLessonStats}
                selectedPeriod={selectedPeriod}
                language={i18n.language}
                filteredLessons={filteredLessons}
                thisRange={thisRange}
                lastRange={lastRange}
                grade={selectedPupil?.grade || null} // Pass grade from selectedPupil
                type={selectedSkill || null} // Pass type (skill) from selectedSkill
                pupilId={selectedPupil?.id || null} // Pass pupilId from selectedPupil
              />
            )}
            {selectedChart === "trueFalse" && (
              <>
                {!isReadyForTrueFalseChart ? (
                  <Text style={styles.loadingText}>
                    {t("pleaseSelectPupilAndRangeType")}
                  </Text>
                ) : (
                  <TrueFalseChart
                    t={t}
                    styles={styles}
                    theme={theme}
                    skillSummary={skillSummary}
                    weakSkills={weakSkills}
                    accuracyByMonth={answerStats?.accuracyByRange || []}
                    retryList={retryList}
                    correct={answerStats?.correct || 0}
                    wrong={answerStats?.wrong || 0}
                    total={answerStats?.total || 0}
                    data={answerStats?.data || []}
                    rangeType={selectedRangeType}
                    selectedRange={selectedRange}
                  />
                )}
              </>
            )}

            {selectedChart === "goal" && (
              <GoalChart
                t={t}
                styles={styles}
                skills={chartSkills}
                screenWidth={screenWidth}
              />
            )}
          </>
        )}
      </ScrollView>

      <FloatingMenu />
    </LinearGradient>
  );
};