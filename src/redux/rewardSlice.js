import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

export const getRewardByDisabledStatus = createAsyncThunk(
  "reward/filterByDisabledStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/reward/filterByDisabledStatus?isDisabled=false`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getExchangeRewardByPupil = createAsyncThunk(
  "exchangereward/getByPupilId",
  async (pupilId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/exchangereward/getByPupilId/${pupilId}`);
      return res.data.data; // Chỉ lấy phần data từ res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getRewardById = createAsyncThunk(
  "reward/getRewardById",
  async (rewardId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/reward/${rewardId}`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return rejectWithValue("Reward not found");
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getExchangeReward = createAsyncThunk(
  "exchangereward/getById",
  async (exchangedRewardId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/exchangereward/${exchangedRewardId}`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return rejectWithValue("Reward not found");
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateExchangeReward = createAsyncThunk(
  "exchangereward/update",
  async ({ exchangedRewardId, isAccept }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(`/exchangereward/${exchangedRewardId}`, { isAccept });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return rejectWithValue("Reward not found");
      } else if (err.response?.status === 400) {
        return rejectWithValue("Invalid request");
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const rewardSlice = createSlice({
  name: "reward",
  initialState: {
    rewards: [], // Lưu danh sách phần thưởng
    exchangeRewards: { rewardIds: []}, // Cập nhật initialState để phù hợp với response
    selectedReward: null, // Lưu phần thưởng được lấy theo ID
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRewardByDisabledStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRewardByDisabledStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload || [];
      })
      .addCase(getRewardByDisabledStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRewardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRewardById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReward = action.payload;
        state.error = null;
      })
      .addCase(getRewardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExchangeReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExchangeReward.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReward = action.payload; // Cập nhật state nếu cần
      })
      .addCase(updateExchangeReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getExchangeReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExchangeReward.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRewards = action.payload;
      })
      .addCase(getExchangeReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getExchangeRewardByPupil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExchangeRewardByPupil.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRewards = {
          rewardIds: action.payload.rewardIds || [], // Danh sách rewardId không trùng lặp
          rewardCount: action.payload.rewardCount || [], // Danh sách { rewardId, count }
        };
      })
      .addCase(getExchangeRewardByPupil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default rewardSlice.reducer;