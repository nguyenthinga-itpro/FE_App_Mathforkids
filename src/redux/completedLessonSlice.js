import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api"; // file Api config axios của bạn

// Thunk: Gọi API complete and unlock next
export const completeAndUnlockNextLesson = createAsyncThunk(
  "completedLesson/completeAndUnlockNextLesson",
  async ({ pupilId, lessonId }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(
        `/completedlesson/completeAndUnlockNext/${pupilId}/lesson/${lessonId}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const countCompletedLessonPupil = createAsyncThunk(
  "completedlesson/countCompletedPupil",
  async ({ pupilId, grade }, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/completedlesson/countCompletedPupil/${pupilId}?grade=${grade}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
)
const completedLessonSlice = createSlice({
  name: "completedLesson",
  initialState: {
    counts: {
      totalCount: 0,
      completedCount: 0
    },
    loading: false,
    message: null,
    error: null,
  },
  reducers: {
    resetCompletedLessonState: (state) => {
      state.loading = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(completeAndUnlockNextLesson.pending, (state) => {
        state.loading = true;
        state.message = null;
        state.error = null;
      })
      .addCase(completeAndUnlockNextLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(completeAndUnlockNextLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(countCompletedLessonPupil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(countCompletedLessonPupil.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(countCompletedLessonPupil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCompletedLessonState } = completedLessonSlice.actions;

export default completedLessonSlice.reducer;
