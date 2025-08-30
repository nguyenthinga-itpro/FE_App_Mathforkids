import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Lấy danh sách bài tập theo khối và loại
export const getRandomTests = createAsyncThunk(
  "exercise/randomTests",
  async ({ lessonId }, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/exercise/randomTests/${lessonId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Tạo bài test mới
export const createTest = createAsyncThunk(
  "test/create",
  async ({ pupilId, lessonId, point, duration }, { rejectWithValue }) => {
    try {
      const res = await Api.post("/test", {
        pupilId,
        lessonId,
        point,
        duration,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Tạo câu hỏi cho bài test
export const createMultipleTestQuestions = createAsyncThunk(
  "testQuestion/createMultiple",
  async (questions, { rejectWithValue }) => {
    try {
      const res = await Api.post("/testquestion/multiple", questions);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const countCompletedTestPupil = createAsyncThunk(
  "test/countCompletedTestPupil",
  async ({ pupilId, grade }, { rejectWithValue }) => {
    try {
      const res = await Api.get(
        `/test/countCompletedTestPupil/${pupilId}?grade=${grade}`
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const getTestsByPupilIdAndLessonId = createAsyncThunk(
  "test/getTestsByPupilIdAndLessonId",
  async ({ pupilId, lessonId }, { rejectWithValue }) => {
    try {
      const res = await Api.get(
        `/test/getTestsByPupilIdAndLessonId/${pupilId}/lesson/${lessonId}`
      );
      return res.data; // res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const testsSlice = createSlice({
  name: "test",
  initialState: {
    counts: {
      totalLessons: 0,
      completedLessons: 0,
      completedTest: 0,
    },
    tests: [],
    loading: false,
    error: null,
    createdTest: null,
    createdTestQuestion: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Random Tests
      .addCase(getRandomTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRandomTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(getRandomTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Test
      .addCase(createTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.loading = false;
        state.createdTest = action.payload;
        state.tests = [...state.tests, action.payload];
      })
      .addCase(createTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Test Question
      .addCase(createMultipleTestQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMultipleTestQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.createdTestQuestion = action.payload;
      })
      .addCase(createMultipleTestQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(countCompletedTestPupil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(countCompletedTestPupil.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(countCompletedTestPupil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTestsByPupilIdAndLessonId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestsByPupilIdAndLessonId.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload.data;
      })
      .addCase(getTestsByPupilIdAndLessonId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default testsSlice.reducer;
