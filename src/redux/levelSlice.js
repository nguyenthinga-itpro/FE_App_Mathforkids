import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Lấy danh sách level được bật
export const getEnabledLevels = createAsyncThunk(
  "level/getEnabledLevels",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Api.get("/level/getEnabledLevels");
      // console.log("API Response:", res.data); // Debug the response
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy level theo ID
export const getLevelById = createAsyncThunk(
  "level/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/level/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const countLevelIdsInLesson = createAsyncThunk(
  "level/countLevelIdsInLesson",
  async ({ lessonId, levelIds }, { rejectWithValue }) => {
    try {
      const res = await Api.post(`/exercise/countLevelIdsInLesson/${lessonId}`, { levelIds });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const levelSlice = createSlice({
  name: "level",
  initialState: {
    levels: [],
    detail: null,
    levelIdCounts: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEnabledLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnabledLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload;
      })
      .addCase(getEnabledLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getLevelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLevelById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(getLevelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(countLevelIdsInLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(countLevelIdsInLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.levelIdCounts = action.payload.data; // Lưu kết quả từ API
      })
      .addCase(countLevelIdsInLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default levelSlice.reducer;