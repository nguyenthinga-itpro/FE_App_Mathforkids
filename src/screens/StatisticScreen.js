// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions,
//   Modal,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useTheme } from "../themes/ThemeContext";
// import { Ionicons } from "@expo/vector-icons";
// import { Fonts } from "../../constants/Fonts";
// import FloatingMenu from "../components/FloatingMenu";
// import { BarChart, PieChart } from "react-native-chart-kit";
// import { useDispatch, useSelector } from "react-redux";
// import { getAllPupils } from "../redux/pupilSlice";
// // import { profileById } from "../redux/profileSlice";
// import { notificationsByUserId } from "../redux/userNotificationSlice";
// import { useIsFocused } from "@react-navigation/native";
// import { useTranslation } from "react-i18next";
// export default function StatisticScreen({ navigation }) {
//   const { theme } = useTheme();
//   const { t } = useTranslation("statistic");
//   const screenWidth = Dimensions.get("window").width - 32;
//   const users = useSelector((state) => state.auth.user);
//   const pupils = useSelector((state) => state.pupil.pupils || []);
//   // const profile = useSelector((state) => state.profile.info || {});
//   const userNotifications = useSelector(
//     (state) => state.notifications.list || []
//   );
//   // console.log("notification", userNotifications);
//   const isFocused = useIsFocused();
//   const dispatch = useDispatch();
//   useEffect(() => {
//     if (isFocused) {
//       // dispatch(profileById(users.id));
//       dispatch(getAllPupils());
//       dispatch(notificationsByUserId(users.id));
//     }
//   }, [isFocused, users?.id]);

//   const filteredPupils = pupils.filter(
//     (pupil) => String(pupil.userId) === String(users?.id)
//   );

//   const filteredNotifications = userNotifications.filter(
//     (notification) => notification.isRead === false
//   );

//   const skills = [
//     t("skill.add"),
//     t("skill.sub"),
//     t("skill.mul"),
//     t("skill.div"),
//   ];
//   const lastMonth = [70, 85, 40, 54];
//   const thisMonth = [85, 90, 50, 100];
//   const trueRatio = [95, 90, 55, 56];
//   const falseRatio = [5, 10, 45, 44];
//   const groupedBarChartData = {
//     labels: skills
//       .flatMap((skill) => [skill, ""])
//       .flatMap((label, index) => (index % 3 === 2 ? [label] : [label])),
//     datasets: [
//       {
//         data: skills
//           .flatMap((_, i) => [lastMonth[i], thisMonth[i], 0])
//           .concat(100),
//         colors: skills
//           .flatMap((_, i) => [
//             () => theme.colors.grayLight,
//             () => theme.colors.blueDark,
//             () => "rgb(255, 255, 255)",
//           ])
//           .concat(() => "rgb(255, 255, 255)"),
//       },
//     ],
//     legend: ["Last Month", "This Month"],
//   };

//   const chartConfig = {
//     backgroundGradientFrom: theme.colors.cardBackground,
//     backgroundGradientTo: theme.colors.cardBackground,
//     decimalPlaces: 0,
//     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     labelColor: () => theme.colors.black,
//     propsForBackgroundLines: {
//       stroke: "#e3e3e3",
//     },
//     barPercentage: 0.65,
//   };
//   const accuracyBarChartData = {
//     labels: skills
//       .flatMap((skill) => [skill, ""])
//       .flatMap((label, index) => (index % 3 === 2 ? [label] : [label])),
//     datasets: [
//       {
//         data: skills
//           .flatMap((_, i) => [trueRatio[i], falseRatio[i], 0])
//           .concat(100),
//         colors: skills
//           .flatMap((_, i) => [
//             () => theme.colors.green,
//             () => theme.colors.redTomato,
//             () => "rgba(0,0,0,0.01)",
//           ])
//           .concat(() => "rgb(255, 255, 255)"),
//       },
//     ],
//     legend: ["True", "False"],
//   };

//   const chartTFConfig = {
//     backgroundGradientFrom: theme.colors.cardBackground,
//     backgroundGradientTo: theme.colors.cardBackground,
//     decimalPlaces: 0,
//     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     labelColor: () => theme.colors.black,
//     propsForBackgroundLines: {
//       stroke: "#e3e3e3",
//     },
//     barPercentage: 0.65,
//   };

//   const [selectedPupil, setSelectedPupil] = useState();
//   const [showDropdown, setShowDropdown] = useState(false);
//   const newNotificationCount = filteredNotifications.length;
//   const [selectedPeriod, setSelectedPeriod] = useState("Last month");
//   const periods = ["This week", "Last week", "This month", "Last month", ""];
//   const [showpPeriod, setShowpPeriod] = useState(false);
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       paddingTop: 20,
//     },
//     header: {
//       borderBottomLeftRadius: 50,
//       borderBottomRightRadius: 50,
//       padding: 20,
//       elevation: 3,
//     },
//     headerContent: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//     },
//     userRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//     },
//     avatarContainer: {
//       marginVertical: 10,
//       borderRadius: 50,
//       borderWidth: 1,
//       borderColor: theme.colors.white,
//       backgroundColor: theme.colors.avatartBackground,
//       elevation: 3,
//     },
//     avatar: {
//       width: 60,
//       height: 60,
//       resizeMode: "cover",
//       borderRadius: 50,
//     },
//     greeting: {
//       color: theme.colors.white,
//       fontSize: 16,
//       fontFamily: Fonts.NUNITO_REGULAR,
//     },
//     name: {
//       color: theme.colors.white,
//       fontSize: 24,
//       fontFamily: Fonts.NUNITO_BOLD,
//       width: "80%",
//     },
//     notificationContainer: {
//       position: "relative",
//       backgroundColor: theme.colors.cardBackground,
//       borderRadius: 50,
//       padding: 10,
//       elevation: 3,
//       borderWidth: 1,
//       borderColor: theme.colors.white,
//     },
//     badge: {
//       position: "absolute",
//       top: -2,
//       right: -2,
//       backgroundColor: theme.colors.red,
//       width: 18,
//       height: 18,
//       borderRadius: 9,
//       justifyContent: "center",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: theme.colors.white,
//     },
//     badgeText: {
//       color: theme.colors.white,
//       fontSize: 10,
//       fontFamily: Fonts.NUNITO_MEDIUM,
//     },
//     notificationIcon: {
//       width: 30,
//       height: 30,
//     },
//     gradeWrapper: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       paddingHorizontal: 10,
//       paddingVertical: 6,
//       marginTop: 20,
//       marginHorizontal: 20,
//       backgroundColor: theme.colors.cardBackground,
//       borderRadius: 10,
//       elevation: 5,
//     },

//     dropdown: {
//       position: "absolute",
//       top: 175,
//       left: 20,
//       width: "89%",
//       backgroundColor: theme.colors.cardBackground,
//       borderRadius: 10,
//       elevation: 3,
//       paddingVertical: 5,
//     },

//     grade: {
//       fontSize: 14,
//       color: theme.colors.blueDark,
//       fontFamily: Fonts.NUNITO_MEDIUM,
//     },
//     gradeRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 5,
//     },
//     periodWrapper: {
//       position: "absolute",
//       right: 0,
//       width: "40%",
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       paddingHorizontal: 20,
//       paddingVertical: 6,
//       marginTop: 20,
//       marginHorizontal: 20,
//       backgroundColor: theme.colors.cardBackground,
//       borderRadius: 10,
//       // elevation: 3,
//     },

//     dropdownButtonText: {
//       fontFamily: Fonts.NUNITO_MEDIUM,
//       fontSize: 13,
//       color: theme.colors.black,
//     },

//     dropdownDay: {
//       position: "absolute",
//       top: 230,
//       right: 20,
//       width: "40%",
//       backgroundColor: theme.colors.cardBackground,
//       borderRadius: 5,
//       elevation: 3,
//       overflow: "hidden",
//     },

//     dropdownItem: {
//       paddingHorizontal: 15,
//       paddingVertical: 3,
//       borderBottomColor: theme.colors.grayLight,
//       borderBottomWidth: 1,
//     },

//     dropdownItemText: {
//       fontFamily: Fonts.NUNITO_MEDIUM,
//       fontSize: 13,
//       color: theme.colors.black,
//       textAlign: "center",
//       // elevation: 20,
//     },
//     academicChartContainer: {
//       marginTop: 80,
//       alignItems: "center",
//     },
//     chartName: {
//       color: theme.colors.white,
//       fontSize: 22,
//       fontFamily: Fonts.NUNITO_MEDIUM,
//       marginBottom: 10,
//     },
//     chartNoteContainer: {
//       marginTop: 10,
//       flexDirection: "row",
//       justifyContent: "center",
//       gap: 20,
//     },
//     chartNote: { flexDirection: "row", alignItems: "center" },
//     noteLast: {
//       width: 12,
//       height: 12,
//       backgroundColor: theme.colors.grayLight,
//       marginRight: 6,
//       borderRadius: 2,
//     },
//     noteText: { color: theme.colors.white, fontFamily: Fonts.NUNITO_MEDIUM },
//     noteThis: {
//       width: 12,
//       height: 12,
//       backgroundColor: theme.colors.blueDark,
//       marginRight: 6,
//       borderRadius: 2,
//     },
//     tfChartContainer: { marginTop: 30, alignItems: "center" },
//     noteTrue: {
//       width: 12,
//       height: 12,
//       backgroundColor: theme.colors.green,
//       marginRight: 6,
//       borderRadius: 2,
//     },
//     noteFalse: {
//       width: 12,
//       height: 12,
//       backgroundColor: theme.colors.redTomato,
//       marginRight: 6,
//       borderRadius: 2,
//     },
//     commentContainer: {
//       width: "90%",
//       backgroundColor: theme.colors.cardBackground,
//       marginHorizontal: 20,
//       marginVertical: 20,
//       padding: 10,
//       borderTopLeftRadius: 20,
//       borderBottomRightRadius: 20,
//       elevation: 3,
//     },
//     commentTitle: {
//       fontSize: 16,
//       fontFamily: Fonts.NUNITO_MEDIUM,
//       color: theme.colors.comment,
//     },
//     summaryContainer: {
//       width: "90%",
//       backgroundColor: theme.colors.cardBackground,
//       padding: 10,
//       borderTopLeftRadius: 20,
//       borderBottomRightRadius: 20,
//       elevation: 3,
//       marginBottom: 10,
//     },
//     summaryTitle: {
//       fontSize: 16,
//       fontFamily: Fonts.NUNITO_MEDIUM,
//       color: theme.colors.green,
//     },
//     commentText: {
//       fontSize: 14,
//       fontFamily: Fonts.NUNITO_MEDIUM,
//       color: theme.colors.black,
//     },
//     skillName: {
//       fontWeight: "bold",
//       fontFamily: Fonts.NUNITO_BOLD,
//       color: theme.colors.black,
//     },
//   });
//   return (
//     <LinearGradient colors={theme.colors.gradientBlue} style={styles.container}>
//       <LinearGradient
//         colors={theme.colors.gradientBluePrimary}
//         style={styles.header}
//       >
//         <View style={styles.headerContent}>
//           <View style={styles.userRow}>
//             <TouchableOpacity
//               style={styles.avatarContainer}
//               onPress={() => navigation.navigate("DetailScreen")}
//             >
//               <Image
//                 source={
//                   users?.image ? { uri: users?.image } : theme.icons.avatarAdd
//                 }
//                 style={styles.avatar}
//               />
//             </TouchableOpacity>
//             <View>
//               <Text style={styles.greeting}>{t("hello")}</Text>
//               <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
//                 {users?.fullName}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate("NotificationScreen", { userId: users.id })
//             }
//           >
//             <View style={styles.notificationContainer}>
//               {newNotificationCount > 0 && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>{newNotificationCount}</Text>
//                 </View>
//               )}
//               <Image
//                 source={theme.icons.notification}
//                 style={styles.notificationIcon}
//               />
//             </View>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//       <ScrollView>
//         <View>
//           <View style={styles.gradeWrapper}>
//             <TouchableOpacity
//               onPress={() => setShowDropdown((prev) => !prev)}
//               style={styles.gradeRow}
//             >
//               <Text style={styles.grade}>
//                 {selectedPupil?.fullName || t("selectPupil")}
//               </Text>
//               <Ionicons
//                 name={showDropdown ? "caret-up-outline" : "caret-down-outline"}
//                 size={20}
//                 color={theme.colors.blueDark}
//               />
//             </TouchableOpacity>
//           </View>

//           <Modal
//             transparent
//             visible={showDropdown}
//             animationType="fade"
//             onRequestClose={() => setShowDropdown(false)}
//           >
//             <TouchableOpacity
//               style={styles.dropdown}
//               activeOpacity={1}
//               onPressOut={() => setShowDropdown(false)}
//             >
//               <View>
//                 {filteredPupils.map((pupil, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     style={styles.dropdownItem}
//                     onPress={() => {
//                       setSelectedPupil(pupil);
//                       setShowDropdown(false);
//                     }}
//                   >
//                     <Text style={styles.dropdownItemText}>
//                       {pupil.fullName}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </TouchableOpacity>
//           </Modal>
//         </View>
//         <View style={{ position: "relative" }}>
//           <TouchableOpacity
//             style={styles.periodWrapper}
//             onPress={() => setShowpPeriod(!showpPeriod)}
//           >
//             <Text style={styles.dropdownButtonText}>{t(selectedPeriod)}</Text>

//             <Ionicons
//               name={showpPeriod ? "caret-up-outline" : "caret-down-outline"}
//               size={20}
//               color={theme.colors.blueDark}
//             />
//           </TouchableOpacity>

//           <Modal
//             transparent
//             visible={showpPeriod}
//             animationType="fade"
//             onRequestClose={() => setShowpPeriod(false)}
//           >
//             <TouchableOpacity
//               style={{ flex: 1 }}
//               onPress={() => setShowpPeriod(false)}
//             >
//               <View style={styles.dropdownDay}>
//                 {periods.map((item, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     style={styles.dropdownItem}
//                     onPress={() => {
//                       setSelectedPeriod(item);
//                       setShowpPeriod(false);
//                     }}
//                   >
//                     <Text style={styles.dropdownItemText}>{t(item)}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </TouchableOpacity>
//           </Modal>
//         </View>
//         {/* {selectedTab === "Skill statistics" && ( */}
//         <>
//           <View style={styles.academicChartContainer}>
//             <Text style={styles.chartName}>{t("academicProgress")}</Text>
//             <BarChart
//               data={groupedBarChartData}
//               width={screenWidth}
//               height={250}
//               fromZero={true}
//               segments={4}
//               chartConfig={chartConfig}
//               showBarTops={false}
//               withInnerLines={true}
//               withHorizontalLabels={true}
//               withCustomBarColorFromData={true}
//               flatColor={true}
//             />

//             <View style={styles.chartNoteContainer}>
//               <View style={styles.chartNote}>
//                 <View style={styles.noteLast} />
//                 <Text style={styles.noteText}>{t("lastMonth")}</Text>
//               </View>
//               <View style={styles.chartNote}>
//                 <View style={styles.noteThis} />
//                 <Text style={styles.noteText}>{t("thisMonth")}</Text>
//               </View>
//             </View>
//             <View style={styles.commentContainer}>
//               <Text style={styles.commentTitle}>{t("comment")}</Text>

//               {skills.map((skill, i) => {
//                 const change = thisMonth[i] - lastMonth[i];
//                 let comment = "";

//                 if (change > 0) {
//                   comment = t("improvedBy", { value: change });
//                 } else if (change < 0) {
//                   comment = t("droppedBy", { value: Math.abs(change) });
//                 } else {
//                   comment = t("noChange");
//                 }

//                 return (
//                   <Text style={styles.commentText} key={i}>
//                     <Text style={styles.skillName}>{skill}:</Text> {comment}
//                     {"\n"}
//                   </Text>
//                 );
//               })}
//             </View>

//             <View style={styles.summaryContainer}>
//               <Text style={styles.summaryTitle}>{t("summary")}</Text>

//               {skills.map((skill, i) => (
//                 <Text style={styles.commentText} key={i}>
//                   <Text style={styles.skillName}>{skill}:</Text>{" "}
//                   {t("summaryChange", {
//                     from: lastMonth[i],
//                     to: thisMonth[i],
//                   })}
//                   {"\n"}
//                 </Text>
//               ))}
//             </View>

//             <View style={styles.tfChartContainer}>
//               <Text style={styles.chartName}>{t("trueFalseRatio")}</Text>

//               <BarChart
//                 data={accuracyBarChartData}
//                 width={screenWidth}
//                 height={250}
//                 chartConfig={chartTFConfig}
//                 fromZero
//                 showBarTops={false}
//                 withInnerLines={true}
//                 withHorizontalLabels={true}
//                 withCustomBarColorFromData={true}
//                 flatColor={true}
//                 segments={4}
//               />
//             </View>
//             <View style={styles.chartNoteContainer}>
//               <View style={styles.chartNote}>
//                 <View style={styles.noteTrue} />
//                 <Text style={styles.noteText}>{t("true")}</Text>
//               </View>
//               <View style={styles.chartNote}>
//                 <View style={styles.noteFalse} />
//                 <Text style={styles.noteText}>{t("false")}</Text>
//               </View>
//             </View>

//             <View style={styles.commentContainer}>
//               <Text style={styles.commentTitle}>{t("comment")}</Text>

//               {skills.map((skill, i) => {
//                 const correct = trueRatio[i];
//                 const incorrect = falseRatio[i];
//                 let comment = "";

//                 if (correct >= 90) {
//                   comment = t("excellentAccuracy", { correct });
//                 } else if (correct >= 70) {
//                   comment = t("goodAccuracy", { correct, incorrect });
//                 } else {
//                   comment = t("lowAccuracy", { correct });
//                 }

//                 return (
//                   <Text style={styles.commentText} key={i}>
//                     <Text style={styles.skillName}>{skill}:</Text> {comment}
//                     {"\n"}
//                   </Text>
//                 );
//               })}
//             </View>

//             <View style={styles.summaryContainer}>
//               <Text style={styles.summaryTitle}>{t("summary")}</Text>

//               {skills.map((skill, i) => (
//                 <Text style={styles.commentText} key={i}>
//                   <Text style={styles.skillName}>{skill}:</Text>{" "}
//                   {t("summaryTF", {
//                     true: trueRatio[i],
//                     false: falseRatio[i],
//                   })}
//                   {"\n"}
//                 </Text>
//               ))}
//             </View>
//           </View>
//         </>
//       </ScrollView>
//       <FloatingMenu />
//     </LinearGradient>
//   );
// }
// import React, { useEffect, useState } from "react";
// import { View, ScrollView, Dimensions } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useTheme } from "../themes/ThemeContext";
// import { useDispatch, useSelector } from "react-redux";
// import { useIsFocused } from "@react-navigation/native";
// import { useTranslation } from "react-i18next";

// import HeaderSection from "../components/statistic/HeaderSection";
// import PupilSelector from "../components/statistic/PupilSelector";
// import RangeSelector from "../components/statistic/RangeSelector";
// import ChartSection from "../components/statistic/ChartSection";
// import FloatingMenu from "../components/FloatingMenu";

// import { getAllPupils } from "../redux/pupilSlice";
// import { notificationsByUserId } from "../redux/userNotificationSlice";
// import {
//   getUserPointStatsComparison,
//   getAnswerStats,
// } from "../redux/statisticSlice";

// export default function StatisticScreen({ navigation }) {
//   const { theme } = useTheme();
//   const { t } = useTranslation("statistic");
//   const screenWidth = Dimensions.get("window").width - 32;

//   const dispatch = useDispatch();
//   const isFocused = useIsFocused();

//   const users = useSelector((state) => state.auth.user);
//   const pupils = useSelector((state) => state.pupil.pupils || []);
//   const { pointStats, answerStats } = useSelector((state) => state.statistic);
//   const userNotifications = useSelector(
//     (state) => state.notifications.list || []
//   );

//   const filteredNotifications = userNotifications.filter((n) => !n.isRead);
//   const newNotificationCount = filteredNotifications.length;

//   const filteredPupils = pupils.filter(
//     (pupil) => String(pupil.userId) === String(users?.id)
//   );

//   const [selectedPupil, setSelectedPupil] = useState();
//   const [selectedRangePair, setSelectedRangePair] = useState(
//     "thisMonth,lastMonth"
//   );

//   const rangeOptions = [
//     { label: t("thisWeekVsLastWeek"), value: "thisWeek,lastWeek" },
//     { label: t("thisMonthVsLastMonth"), value: "thisMonth,lastMonth" },
//     { label: t("thisQuarterVsLastQuarter"), value: "thisQuarter,lastQuarter" },
//   ];

//   useEffect(() => {
//     if (isFocused && users?.id) {
//       dispatch(getAllPupils());
//       dispatch(notificationsByUserId(users.id));
//     }
//   }, [isFocused, users?.id]);

//   useEffect(() => {
//     if (selectedPupil?.id && selectedPupil?.grade && selectedRangePair) {
//       const [thisRange, lastRange] = selectedRangePair.split(",");
//       dispatch(
//         getUserPointStatsComparison({
//           pupilId: selectedPupil.id,
//           grade: selectedPupil.grade,
//           ranges: [thisRange, lastRange],
//         })
//       );
//       dispatch(
//         getAnswerStats({
//           pupilId: selectedPupil.id,
//           grade: selectedPupil.grade,
//           ranges: [thisRange, lastRange],
//         })
//       );
//     }
//   }, [selectedPupil, selectedRangePair]);

//   return (
//     <LinearGradient colors={theme.colors.gradientBlue} style={{ flex: 1 }}>
//       <HeaderSection
//         user={users}
//         t={t}
//         theme={theme}
//         newNotificationCount={newNotificationCount}
//         navigation={navigation}
//       />

//       <ScrollView>
//         <PupilSelector
//           selectedPupil={selectedPupil}
//           setSelectedPupil={setSelectedPupil}
//           pupils={filteredPupils}
//           theme={theme}
//           t={t}
//         />

//         <RangeSelector
//           selectedRangePair={selectedRangePair}
//           setSelectedRangePair={setSelectedRangePair}
//           options={rangeOptions}
//           theme={theme}
//           t={t}
//         />

//         <ChartSection
//           pointStats={pointStats}
//           answerStats={answerStats}
//           theme={theme}
//           t={t}
//           screenWidth={screenWidth}
//         />
//       </ScrollView>

//       <FloatingMenu />
//     </LinearGradient>
//   );
// }
