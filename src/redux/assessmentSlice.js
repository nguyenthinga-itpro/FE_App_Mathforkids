import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Lấy danh sách bài tập theo khối và loại
export const getRandomAssessments = createAsyncThunk(
  "exercise/randomAssessments",
  async ({ grade }, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/exercise/randomAssessments/${grade}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const updateIsBlock = createAsyncThunk(
  "completedLesson/updateIsblock",
  async ({ pupilId, lessonId }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(
        `/completedlesson/updateIsblock/${pupilId}/lesson/${lessonId}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const unlockPreviousGradeLesson = createAsyncThunk(
  "completedLesson/unBlockByGrade",
  async ({ pupilId }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(`/completedlesson/unBlockByGrade/${pupilId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const assessmentsSlice = createSlice({
  name: "assessment",
  initialState: {
    assessments: [],
    lessonByType: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Random Tests
      .addCase(getRandomAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRandomAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload.exercises || [];
        state.lessonByType = action.payload.lessonsByType || {};
      })
      .addCase(getRandomAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIsBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIsBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateIsBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(unlockPreviousGradeLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlockPreviousGradeLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(unlockPreviousGradeLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assessmentsSlice.reducer;
