import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// Thunk: Tạo hoặc cập nhật owned_reward
export const createOrUpdate = createAsyncThunk(
  "owned_reward/createOrUpdate",
  async ({ pupilId, rewardId, quantity }, { rejectWithValue }) => {
    try {
      const res = await Api.post(`/ownereward/create/${pupilId}/${rewardId}`, {
        quantity,
      });
      // console.log("Create/Update API Full Response:", res.data);
      // Không trả về res.data.data vì API không cung cấp dữ liệu bản ghi
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Error in createOrUpdate:", err);
      if (err.response?.status === 404) {
        // console.log("Endpoint or resource not found:", { pupilId, rewardId });
        return rejectWithValue(
          "Resource not found for creating or updating reward"
        );
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Lấy danh sách owned_reward theo pupilId
export const getByPupilId = createAsyncThunk(
  "owned_reward/getByPupilId",
  async (pupilId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/ownereward/getByPupilId/${pupilId}`);
      return res.data && Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error("Error in getByPupilId:", err);
      if (err.response?.status === 404) {
        // console.log("No owned_reward found for pupilId:", pupilId);
        return [];
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// Thunk: Đếm số lượng owned_reward theo pupilId
export const countByPupilId = createAsyncThunk(
  "exchangereward/countRewardByPupilId",
  async (pupilId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/exchangereward/countRewardByPupilId/${pupilId}`);
      // Kiểm tra xem res.data có tồn tại và có thuộc tính count không
      return typeof res.data?.count === "number" ? res.data.count : 0;
    } catch (err) {
      console.error("Error in countByPupilId:", err);
      if (err.response?.status === 404) {
        // console.log("No owned_reward found for pupilId:", pupilId);
        return 0;
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// Thunk: Tạo exchange reward mới
export const createExchangeReward = createAsyncThunk(
  "exchangereward/create",
  async ({ pupilId, rewardId }, { rejectWithValue }) => {
    try {
      const res = await Api.post("/exchangereward", {
        pupilId,
        rewardId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const ownedRewardSlice = createSlice({
  name: "owned_reward",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Không cập nhật state.list vì API không trả về dữ liệu bản ghi
        // console.log("createOrUpdate succeeded:", action.payload.message);
      })
      .addCase(createOrUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create or update reward";
      })
      .addCase(getByPupilId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getByPupilId.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.list = action.payload.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            item.id &&
            item.rewardId &&
            item.quantity != null
        );
      })
      .addCase(getByPupilId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch owned rewards";
      })
      .addCase(countByPupilId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(countByPupilId.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.count = action.payload; // Update count in state
      })
      .addCase(countByPupilId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch owned rewards count";
      })
      .addCase(createExchangeReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExchangeReward.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createExchangeReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ownedRewardSlice.reducer;
