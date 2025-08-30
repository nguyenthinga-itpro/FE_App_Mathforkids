import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Lấy danh sách bài tập theo khối và loại
export const getRandomExercises = createAsyncThunk(
  "exercise/randomExercises",
  async ({ lessonId, levelIds }, { rejectWithValue }) => {
    try {
      const res = await Api.post(`/exercise/randomExercises/${lessonId}`, { levelIds });
      // console.log("API response:", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


const exerciseSlice = createSlice({
  name: "exercise",
  initialState: {
    exercises: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRandomExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRandomExercises.fulfilled, (state, action) => {
        state.loading = false;
        state.exercises = action.payload;
      })
      .addCase(getRandomExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default exerciseSlice.reducer;