import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api"; // đường dẫn file axios bạn đang dùng

// Lấy tất cả thông báo theo userId
export const notificationsByUserId = createAsyncThunk(
  "notifications/fetchByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/usernotification/getWithin30Days/${userId}`);
      // console.log("noti", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Lấy thông báo theo id
export const notificationById = createAsyncThunk(
  "notifications/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/usernotification/${id}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// Tao thông báo
export const createUserNotification = createAsyncThunk(
  "notifications/create",
  async (notificationData, { rejectWithValue }) => {
    try {
      const res = await Api.post("/usernotification", notificationData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// Cập nhật thông báo
export const updateNotification = createAsyncThunk(
  "notifications/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(`/usernotification/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentNotification: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch by userId
      .addCase(notificationsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(notificationsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(notificationsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(notificationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(notificationById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(notificationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createUserNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserNotification.fulfilled, (state, action) => {
        state.loading = false;
        // Optional: nếu API trả về notification object
        state.list.unshift(action.payload);
      })
      .addCase(createUserNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update notification
      .addCase(updateNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
