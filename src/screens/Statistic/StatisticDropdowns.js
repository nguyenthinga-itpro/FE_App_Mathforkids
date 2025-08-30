import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
export default function StatisticDropdowns({
  t,
  i18n,
  theme,
  styles,
  selectedChart,
  selectedPupil,
  setSelectedPupil,
  filteredPupils,
  showPupilDropdown,
  setShowPupilDropdown,
  selectedSkill,
  setSelectedSkill,
  skillLabels,
  skillTypes,
  showSkillDropdown,
  setShowSkillDropdown,
  selectedLesson,
  setSelectedLesson,
  filteredLessons,
  showLessonDropdown,
  setShowLessonDropdown,
  selectedTest,
  setSelectedTest,
  testList,
  showTestDropdown,
  setShowTestDropdown,
  selectedPeriod,
  setSelectedPeriod,
  showPeriodDropdown,
  setShowPeriodDropdown,
  periods,
  periodRanges,
  selectedRangeType,
  setShowRangeTypeDropdown,
  rangeType,
  setSelectedRange,
  showRangeTypeDropdown,
  setSelectedRangeType,
  data,
}) {
  const navigation = useNavigation();
  const isTestDropdownEnabled =
    selectedChart === "trueFalse" &&
    selectedPupil &&
    selectedSkill &&
    selectedLesson &&
    selectedRangeType;

  const handleSelectTest = (test) => {
    const testId = typeof test === "string" ? test : test.testId;
    const filteredQuestions = data?.data?.filter((q) => q.testId === testId);
    navigation.navigate("TestListScreen", {
      testId,
      questions: filteredQuestions,
      testName:
        typeof test === "object"
          ? test.lessonName?.[i18n.language] || test.lessonName?.en || testId
          : testId,
    });
    setSelectedTest(test);
    setShowTestDropdown(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      {/* Pupil Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownRow}
          onPress={() => setShowPupilDropdown(true)}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {selectedPupil?.fullName || t("selectPupil")}
          </Text>
          <Ionicons
            name="caret-down-outline"
            size={20}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        <Modal
          transparent
          visible={showPupilDropdown}
          animationType="fade"
          onRequestClose={() => setShowPupilDropdown(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModal}
            activeOpacity={1}
            onPressOut={() => setShowPupilDropdown(false)}
          >
            <View style={styles.dropdownContent}>
              {filteredPupils.map((pupil, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedPupil(pupil);
                    setShowPupilDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{pupil.fullName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Skill Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownRow}
          onPress={() => setShowSkillDropdown(true)}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {selectedSkill ? skillLabels[selectedSkill] : t("selectSkill")}
          </Text>
          <Ionicons
            name="caret-down-outline"
            size={20}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        <Modal
          transparent
          visible={showSkillDropdown}
          animationType="fade"
          onRequestClose={() => setShowSkillDropdown(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModal}
            activeOpacity={1}
            onPressOut={() => setShowSkillDropdown(false)}
          >
            <View style={styles.dropdownContent}>
              {skillTypes.map((skill, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSkill(skill);
                    if (selectedLesson?.type !== skill) setSelectedLesson(null);
                    setShowSkillDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {skillLabels[skill]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Lesson Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownRow}
          onPress={() => setShowLessonDropdown(true)}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {selectedLesson?.name?.[i18n.language] ||
              selectedLesson?.name?.en ||
              t("selectLesson")}
          </Text>
          <Ionicons
            name="caret-down-outline"
            size={20}
            color={theme.colors.blueDark}
          />
        </TouchableOpacity>
        <Modal
          transparent
          visible={showLessonDropdown}
          animationType="fade"
          onRequestClose={() => setShowLessonDropdown(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModal}
            activeOpacity={1}
            onPressOut={() => setShowLessonDropdown(false)}
          >
            <View style={styles.dropdownContent}>
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedLesson(lesson);
                      setShowLessonDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {lesson.name?.[i18n.language] ||
                        lesson.name?.en ||
                        t("noLessonName")}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.dropdownItemText}>
                  {t("noLessonsAvailable")}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      {/* rangeType Dropdown (only if trueFalse selected) */}
      {selectedChart === "trueFalse" && (
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => setShowRangeTypeDropdown(true)}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {selectedRangeType ? t(selectedRangeType) : t("selectRangeType")}
            </Text>
            <Ionicons
              name="caret-down-outline"
              size={20}
              color={theme.colors.blueDark}
            />
          </TouchableOpacity>
          <Modal
            transparent
            visible={showRangeTypeDropdown}
            animationType="fade"
            onRequestClose={() => setShowRangeTypeDropdown(false)}
          >
            <TouchableOpacity
              style={styles.dropdownModal}
              activeOpacity={1}
              onPressOut={() => setShowRangeTypeDropdown(false)}
            >
              <View style={styles.dropdownContent}>
                <ScrollView style={{ maxHeight: 300 }}>
                  {rangeType.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedRangeType(type.rangeType);
                        setSelectedRange(type.ranges);
                        setShowRangeTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}

      {/* Test Dropdown (only if trueFalse selected) */}
      {selectedChart === "trueFalse" && (
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[
              styles.dropdownRow,
              !isTestDropdownEnabled && { backgroundColor: "#eee" }, // màu xám khi disabled
            ]}
            disabled={!isTestDropdownEnabled}
            onPress={() => {
              if (isTestDropdownEnabled) {
                setShowTestDropdown(true);
              } else {
                Alert.alert(
                  t("incompleteSelection"),
                  t("pleaseSelectAllBeforeViewingTests")
                );
              }
            }}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {selectedTest
                ? `${t("test")} ${testList.indexOf(selectedTest) + 1}`
                : t("selectTest")}
            </Text>

            <Ionicons
              name="caret-down-outline"
              size={20}
              color={theme.colors.blueDark}
            />
          </TouchableOpacity>

          <Modal
            transparent
            visible={showTestDropdown}
            animationType="fade"
            onRequestClose={() => setShowTestDropdown(false)}
          >
            <TouchableOpacity
              style={styles.dropdownModal}
              activeOpacity={1}
              onPressOut={() => setShowTestDropdown(false)}
            >
              <View style={styles.dropdownContent}>
                <ScrollView style={{ maxHeight: 300 }}>
                  {testList?.length > 0 ? (
                    testList.map((test, index) => (
                      <TouchableOpacity
                        key={test.testId || index}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectTest(test)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {typeof test.lessonName === "object"
                            ? test.lessonName[i18n.language] ||
                              test.lessonName.en ||
                              `${t("test")} ${index + 1}`
                            : test.lessonName || `${t("test")} ${index + 1}`}
                          {/* {` (ID: ${test})`} */}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.dropdownItemText}>
                      {t("noTestAvailable")}
                    </Text>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}

      {/* Period Dropdown */}
      {selectedChart === "progress" && (
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => setShowPeriodDropdown(true)}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {t(periodRanges[selectedPeriod][0])}
            </Text>
            <Ionicons
              name="caret-down-outline"
              size={20}
              color={theme.colors.blueDark}
            />
          </TouchableOpacity>
          <Modal
            transparent
            visible={showPeriodDropdown}
            animationType="fade"
            onRequestClose={() => setShowPeriodDropdown(false)}
          >
            <TouchableOpacity
              style={styles.dropdownModal}
              activeOpacity={1}
              onPressOut={() => setShowPeriodDropdown(false)}
            >
              <View style={styles.dropdownContent}>
                {periods.map((period, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedPeriod(period);
                      setShowPeriodDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {t(periodRanges[period][1])}, {t(periodRanges[period][0])}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </View>
  );
}
