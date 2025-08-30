import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk 1: Lấy thống kê điểm theo kỹ năng
export const getUserPointStatsComparison = createAsyncThunk(
  "statistic/getUserPointStatsComparison",
  async ({ pupilId, grade, ranges, lessonId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ grade });
      if (ranges?.length) params.append("ranges", ranges.join(","));
      if (lessonId) params.append("lessonId", lessonId);
      const res = await Api.get(
        `/test/getUserPointStatsComparison/${pupilId}?${params.toString()}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk 2: Lấy thống kê điểm toàn bộ bài học
export const getUserPointFullLesson = createAsyncThunk(
  "statistic/getUserPointFullLesson",
  async ({ pupilId, grade, ranges, type }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ grade });
      if (ranges?.length) params.append("ranges", ranges.join(","));
      if (type) params.append("type", type);
      const res = await Api.get(
        `/test/getUserPointFullLesson/${pupilId}?${params.toString()}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk 3: Lấy thống kê đúng/sai theo kỹ năng
export const getAnswerStats = createAsyncThunk(
  "statistic/getAnswerStats",
  async (
    { pupilId, lessonId, grade, ranges, rangeType },
    { rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams();

      if (grade) query.append("grade", grade);

      if (ranges) {
        const rangeStr = Array.isArray(ranges)
          ? ranges.join(",")
          : String(ranges);
        query.append("ranges", rangeStr);
      }

      if (rangeType) query.append("rangeType", rangeType);

      const lessonSegment = lessonId ? `/${lessonId}` : "";
      const url = `/test/getAnswerStats/${pupilId}${lessonSegment}?${query.toString()}`;

      const res = await Api.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const statisticSlice = createSlice({
  name: "statistic",
  initialState: {
    pointStats: null,
    fullLessonStats: null, // Thêm state cho fullLesson
    answerStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearStatistic: (state) => {
      state.pointStats = null;
      state.fullLessonStats = null; // Thêm reset cho fullLessonStats
      state.answerStats = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý getUserPointStatsComparison
      .addCase(getUserPointStatsComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPointStatsComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.pointStats = action.payload;
      })
      .addCase(getUserPointStatsComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý getUserPointFullLesson
      .addCase(getUserPointFullLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPointFullLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.fullLessonStats = action.payload;
      })
      .addCase(getUserPointFullLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý getAnswerStats
      .addCase(getAnswerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnswerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.answerStats = action.payload;
      })
      .addCase(getAnswerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatistic } = statisticSlice.actions;
export default statisticSlice.reducer;