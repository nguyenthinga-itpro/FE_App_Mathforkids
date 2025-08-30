import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Tạo goal mới
export const createGoal = createAsyncThunk(
  "goal/create",
  async (goalData, { rejectWithValue }) => {
    try {
      const res = await Api.post("/goal", goalData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy tất cả goal của học sinh trong vòng 30 ngày
export const getGoalsWithin30Days = createAsyncThunk(
  "goal/getWithin30Days",
  async (pupilId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/goal/getWithin30Days/${pupilId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy goal theo ID
export const getGoalById = createAsyncThunk(
  "goal/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/goal/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Cập nhật goal
export const updateGoal = createAsyncThunk(
  "goal/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await Api.patch(`/goal/${id}`, data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy danh sách bài học theo grade, type, pupilId
export const getLessonsByGradeAndTypeFiltered = createAsyncThunk(
  "goal/getLessonsByGradeAndTypeFiltered",
  async ({ grade, type, pupilId }, { rejectWithValue }) => {
    try {
      const res = await Api.get("/lesson/getLessonsByGradeAndTypeFiltered", {
        params: { grade, type, pupilId },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Tự động đánh dấu goal đã hoàn thành
export const autoMarkCompletedGoals = createAsyncThunk(
  "goal/autoMarkCompletedGoals",
  async ({ pupilId, lessonId, exercise }, { rejectWithValue }) => {
    try {
      const query = exercise ? `?exercise=${exercise}` : "";
      const res = await Api.get(
        `/goal/completedgoal/${pupilId}/${lessonId}${query}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy danh sách bài học khả dụng
export const getAvailableLessons = createAsyncThunk(
  "goal/getAvailableLessons",
  async ({ pupilId, skillType, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await Api.get(
        `/goal/availablelessons/${pupilId}/${skillType}/${startDate}/${endDate}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// Thunk: Lấy danh sách level chưa bị vô hiệu hóa từ collection "levels"
export const getEnabledLevels = createAsyncThunk(
  "goal/getEnabledLevels",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Api.get("/level/getEnabledLevels");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const goalSlice = createSlice({
  name: "goal",
  initialState: {
    loading: false,
    error: null,
    goals: [],
    goal: null,
    filteredLessons: [],
    availableLessons: null,
    enabledLevels: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get goals within 30 days
      .addCase(getGoalsWithin30Days.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoalsWithin30Days.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload || [];
      })
      .addCase(getGoalsWithin30Days.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get goal by ID
      .addCase(getGoalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoalById.fulfilled, (state, action) => {
        state.loading = false;
        state.goal = action.payload;
      })
      .addCase(getGoalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goal = { ...state.goal, ...action.payload };
        state.goals = state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        );
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get lessons by grade and type
      .addCase(getLessonsByGradeAndTypeFiltered.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLessonsByGradeAndTypeFiltered.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredLessons = action.payload || [];
      })
      .addCase(getLessonsByGradeAndTypeFiltered.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Auto mark completed goals
      .addCase(autoMarkCompletedGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoMarkCompletedGoals.fulfilled, (state) => {
        state.loading = false;
        // Có thể cập nhật danh sách goals nếu cần
      })
      .addCase(autoMarkCompletedGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get available lessons
      .addCase(getAvailableLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.availableLessons = action.payload;
      })
      .addCase(getAvailableLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) // Get enabled levels
      .addCase(getEnabledLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnabledLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.enabledLevels = action.payload || [];
      })
      .addCase(getEnabledLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default goalSlice.reducer;
