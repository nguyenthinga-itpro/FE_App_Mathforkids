// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import authReducer from "./authSlice";
import pupilReducer from "./pupilSlice";
import userNotificationReducer from "./userNotificationSlice";
import pupilNotificationReducer from "./pupilNotificationSlice";
import profileReducer from "./profileSlice";
import lessonReducer from "./lessonSlice";
import exerciseReducer from "./exerciseSlice";
import LessonDetailReducer from "./lessonDetailSlice";
import settingsReducer from "./settingsSlice";
import goalReducer from "./goalSlice";
import rewardReducer from "./rewardSlice";
import ownedRewardReducer from "./owned_rewardSlice";
import completedExerciseReducer from "./completedexerciseSlice";
import completedLessonReducer from "./completedLessonSlice";

import testReducer from "./testSlice";
import levelReducer from "./levelSlice";
import assessmentReducer from "./assessmentSlice";
import statisticReducer from "./statisticSlice";
const rootReducer = combineReducers({
  auth: authReducer,
  pupil: pupilReducer,
  notifications: userNotificationReducer,
  pupilnotifications: pupilNotificationReducer,
  profile: profileReducer,
  lesson: lessonReducer,
  exercise: exerciseReducer,
  lessonDetail: LessonDetailReducer,
  settings: settingsReducer,
  goal: goalReducer,
  reward: rewardReducer,
  owned_reward: ownedRewardReducer,
  level: levelReducer,
  completed_exercise: completedExerciseReducer,
  test: testReducer,
  assessment: assessmentReducer,
  completedLesson: completedLessonReducer,
  statistic: statisticReducer,
  // thêm các reducer khác nếu cần
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "pupil", "settings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat((store) => (next) => (action) => {
      if (action.type === "persist/REHYDRATE") {
        // console.log(" Redux rehydrated!");
      }
      return next(action);
    }),
  devTools: true,
});

export const persistor = persistStore(store);
