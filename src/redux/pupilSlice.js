import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Tạo học sinh
export const createPupil = createAsyncThunk(
  "pupil/create",
  async (pupilData, { rejectWithValue }) => {
    try {
      const res = await Api.post("/pupil", pupilData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy danh sách tất cả học sinh
export const getAllPupils = createAsyncThunk(
  "pupil/getEnabledPupil",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/pupil/getEnabledPupil/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const pupilById = createAsyncThunk(
  "pupil/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/pupil/${id}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const pupilByUserId = createAsyncThunk(
  "pupil/fetchByUserId",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/pupil/getEnabledPupil/${id}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const updatePupilProfile = createAsyncThunk(
  "pupil/updateProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await Api.patch(`/pupil/updateProfile/${id}`, data); // Đúng route bạn mô tả
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const rankings = createAsyncThunk(
  "pupil/fetchRankings",
  async (grade, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/test/rankingByGrade/${grade}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const pupilSlice = createSlice({
  name: "pupil",
  initialState: {
    loading: false,
    error: null,
    pupils: [],
    rankings: [],
    nextPageToken: null,
    pupil: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // createPupil
      .addCase(createPupil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPupil.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPupil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAllPupils
      .addCase(getAllPupils.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPupils.fulfilled, (state, action) => {
        state.loading = false;
        state.pupils = action.payload || [];
        state.nextPageToken = action.payload.nextPageToken || null;
      })
      .addCase(getAllPupils.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getbyid
      .addCase(pupilById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pupilById.fulfilled, (state, action) => {
        state.loading = false;
        state.pupil = action.payload;
      })
      .addCase(pupilById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //get by userid
      .addCase(pupilByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pupilByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.pupils = action.payload || [];
      })
      .addCase(pupilByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //get rankings
      .addCase(rankings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rankings.fulfilled, (state, action) => {
        state.loading = false;
        state.rankings = action.payload || [];
      })
      .addCase(rankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updatePupilProfile
      .addCase(updatePupilProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePupilProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.pupil && state.pupil.id === action.payload.id) {
          state.pupil = { ...state.pupil, ...action.payload };
        }
        state.pupils = state.pupils.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        );
      })
      .addCase(updatePupilProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default pupilSlice.reducer;
