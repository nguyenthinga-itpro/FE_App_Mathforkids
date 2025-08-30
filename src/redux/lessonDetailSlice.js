import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Lấy danh sách lesson detail được bật theo lessonId
export const getEnabledByLesson = createAsyncThunk(
  "lessonDetail/getEnabledByLesson",
  async (lessonId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/lessondetail/getEnabledByLesson/${lessonId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy lesson detail theo ID
export const getLessonDetailById = createAsyncThunk(
  "lessonDetail/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/lessondetail/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const lessonDetailSlice = createSlice({
  name: "lessonDetail",
  initialState: {
    detail: null,
    enabledList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEnabledByLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnabledByLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.enabledList = action.payload;
      })
      .addCase(getEnabledByLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getLessonDetailById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLessonDetailById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(getLessonDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default lessonDetailSlice.reducer;
