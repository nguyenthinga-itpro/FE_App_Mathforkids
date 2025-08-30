import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Tạo completed_exercise
export const createCompletedExercise = createAsyncThunk(
  "completed_exercise/createCompletedExercise",
  async ({ pupilId, lessonId, levelId, point }, { rejectWithValue }) => {
    try {
      const res = await Api.post("/completedexercise", {
        pupilId,
        lessonId,
        levelId,
        point,
      });
      // console.log("Completed exercise API response:", res.data);
      return res.data;
    } catch (err) {
      console.error("Error in createCompletedExercise:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const countCompletedExercisePupil = createAsyncThunk(
  "completed_exercise/countCompletedExercisePupil",
  async ({ pupilId, grade }, { rejectWithValue }) => {
    try {
      const res = await Api.get(
        `/completedexercise/countCompletedExercisePupil/${pupilId}?grade=${grade}`
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const completedExerciseSlice = createSlice({
  name: "completed_exercise",
  initialState: {
    counts: {
      totalLessons: 0,
      completedLessons: 0,
      completedExercises: 0,
    },
    completedExercise: null, // Changed to null to match single-object expectation
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCompletedExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompletedExercise.fulfilled, (state, action) => {
        state.loading = false;
        state.completedExercise = action.payload;
      })
      .addCase(createCompletedExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(countCompletedExercisePupil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(countCompletedExercisePupil.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(countCompletedExercisePupil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = completedExerciseSlice.actions;
export default completedExerciseSlice.reducer;
