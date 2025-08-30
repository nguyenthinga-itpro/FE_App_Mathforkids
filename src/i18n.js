// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import tất cả các file ngôn ngữ
import en from "./locales/en/setting.json";
import vi from "./locales/vi/setting.json";
import enHome from "./locales/en/home.json";
import viHome from "./locales/vi/home.json";
import enLesson from "./locales/en/lesson.json";
import viLesson from "./locales/vi/lesson.json";
import enCommon from "./locales/en/common.json";
import viCommon from "./locales/vi/common.json";
import enProfile from "./locales/en/profile.json";
import viProfile from "./locales/vi/profile.json";
import enExercise from "./locales/en/exercise.json";
import viExercise from "./locales/vi/exercise.json";
import enStatistic from "./locales/en/statistic.json";
import viStatistic from "./locales/vi/statistic.json";
import enPrivacy from "./locales/en/privacy.json";
import viPrivacy from "./locales/vi/privacy.json";
import enVerify from "./locales/en/verify.json";
import viVerify from "./locales/vi/verify.json";
import enLogin from "./locales/en/login.json";
import viLogin from "./locales/vi/login.json";
import enAccount from "./locales/en/account.json";
import viAccount from "./locales/vi/account.json";
import enRegister from "./locales/en/register.json";
import viRegister from "./locales/vi/register.json";
import enStepByStep from "./locales/en/stepbystep.json";
import viStepByStep from "./locales/vi/stepbystep.json";
import enGoal from "./locales/en/goal.json";
import viGoal from "./locales/vi/goal.json";
import enNotification from "./locales/en/notification.json";
import viNotification from "./locales/vi/notification.json";
import enSideBar from "./locales/en/sidebar.json";
import viSideBar from "./locales/vi/sidebar.json";
import enSkill from "./locales/en/skill.json";
import viSkill from "./locales/vi/skill.json";
import enTest from "./locales/en/test.json";
import viTest from "./locales/vi/test.json";
import enMultiplicationTable from "./locales/en/multiplicationtable.json";
import viMultiplicationTable from "./locales/vi/multiplicationtable.json";
import enLoading from "./locales/en/loading.json";
import viLoading from "./locales/vi/loading.json";
import enAssessment from "./locales/en/assessment.json";
import viAssessment from "./locales/vi/assessment.json";
import enReward from "./locales/en/reward.json";
import viReward from "./locales/vi/reward.json";
import enTarget from "./locales/en/target.json";
import viTarget from "./locales/vi/target.json";
import enForgotPin from "./locales/en/forgotPin.json";
import viForgotPin from "./locales/vi/forgotPin.json";
import enCreatePupilAccount from "./locales/en/createpupilaccount.json";
import viCreatePupilAccount from "./locales/vi/createpupilaccount.json";
import enContact from "./locales/en/contact.json";
import viContact from "./locales/vi/contact.json";
import enRank from "./locales/en/ranking.json";
import viRank from "./locales/vi/ranking.json";
i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en", // Ngôn ngữ mặc định
  fallbackLng: "en", // Nếu không có bản dịch sẽ fallback
  ns: [
    "setting",
    "home",
    "lesson",
    "common",
    "profile",
    "exercise",
    "statistic",
    "privacy",
    "verify",
    "login",
    "account",
    "register",
    "stepbystep",
    "goal",
    "notification",
    "sidebar",
    "skill",
    "test",
    "multiplicationtable",
    "loading",
    "assessment",
    "reward",
    "target",
    "forgotPin",
    "createpupilaccount",
    "contact",
    "ranking",
  ],
  defaultNS: ["goal", "reward"],
  resources: {
    en: {
      setting: en,
      home: enHome,
      lesson: enLesson,
      common: enCommon,
      profile: enProfile,
      exercise: enExercise,
      statistic: enStatistic,
      privacy: enPrivacy,
      verify: enVerify,
      login: enLogin,
      account: enAccount,
      register: enRegister,
      stepbystep: enStepByStep,
      goal: enGoal,
      notification: enNotification,
      sidebar: enSideBar,
      skill: enSkill,
      test: enTest,
      multiplicationtable: enMultiplicationTable,
      loading: enLoading,
      assessment: enAssessment,
      reward: enReward,
      target: enTarget,
      forgotPin: enForgotPin,
      createpupilaccount: enCreatePupilAccount,
      contact: enContact,
      ranking: enRank,
    },
    vi: {
      setting: vi,
      home: viHome,
      lesson: viLesson,
      common: viCommon,
      profile: viProfile,
      exercise: viExercise,
      statistic: viStatistic,
      privacy: viPrivacy,
      verify: viVerify,
      login: viLogin,
      account: viAccount,
      register: viRegister,
      stepbystep: viStepByStep,
      goal: viGoal,
      notification: viNotification,
      sidebar: viSideBar,
      skill: viSkill,
      test: viTest,
      multiplicationtable: viMultiplicationTable,
      loading: viLoading,
      assessment: viAssessment,
      reward: viReward,
      target: viTarget,
      forgotPin: viForgotPin,
      createpupilaccount: viCreatePupilAccount,
      contact: viContact,
      ranking: viRank,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
