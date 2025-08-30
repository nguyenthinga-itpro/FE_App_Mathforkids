import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../api/api";

// ==================== USER ====================

// Lấy thông tin người dùng theo ID
export const profileById = createAsyncThunk(
  "profile/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/user/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Cập nhật thông tin người dùng
export const updateProfile = createAsyncThunk(
  "profile/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(`/user/updateProfile/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
//Gửi OTP khi cập nhật số điện thoại
export const sendOtpToUpdatePhone = createAsyncThunk(
  "profile/sendOtpToUpdatePhone",
  async ({ id, phoneNumber, newPhoneNumber }, { rejectWithValue }) => {
    try {
      const res = await Api.post(
        `/auth/sendOtpToUpdatePhone/${id}/${phoneNumber}`,
        {
          newPhoneNumber,
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
//Gửi OTP khi cập nhật email
export const sendOtpToUpdateEmail = createAsyncThunk(
  "profile/sendOtpToUpdateEmail",
  async ({ id, email, newEmail }, { rejectWithValue }) => {
    try {
      const res = await Api.post(`/auth/sendOtpToUpdateEmail/${id}/${email}`, {
        newEmail,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Cập nhật pin
export const updatePin = createAsyncThunk(
  "profile/updatepin",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(`/user/updatePin/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
// Upload avatar người dùng lên S3 và lưu URL vào Firestore
export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async ({ id, uri }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      const fileName = uri.split("/").pop();
      const fileType = fileName.split(".").pop();

      formData.append("image", {
        uri,
        name: fileName,
        type: `image/${fileType}`,
      });

      const res = await Api.patch(`/user/updateImageProfile/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.image;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Upload failed"
      );
    }
  }
);

// ==================== PUPIL ====================

// Lấy thông tin học sinh theo ID
export const pupilById = createAsyncThunk(
  "profile/fetchPupilById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/pupil/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Cập nhật thông tin học sinh
export const updatePupilProfile = createAsyncThunk(
  "profile/updatePupil",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await Api.patch(`/pupil/updateProfile/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Upload avatar học sinh
export const uploadPupilAvatar = createAsyncThunk(
  "profile/uploadPupilAvatar",
  async ({ id, uri }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      const fileName = uri.split("/").pop();
      const fileType = fileName.split(".").pop();

      formData.append("image", {
        uri,
        name: fileName,
        type: `image/${fileType}`,
      });

      const res = await Api.patch(`/pupil/updateImageProfile/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.avatar;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Upload failed"
      );
    }
  }
);

// ==================== SLICE ====================

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    info: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.info = null;
      state.error = null;
    },
    setAvatar: (state, action) => {
      if (state.info) {
        state.info.avatar = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- USER ---
      .addCase(profileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(profileById.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload;
      })
      .addCase(profileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.info && action.payload.pin) {
          state.info.pin = action.payload.pin;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Gửi OTP cập nhật email
      .addCase(sendOtpToUpdateEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpToUpdateEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtpToUpdateEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cập nhật Pin
      .addCase(updatePin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePin.fulfilled, (state, action) => {
        state.loading = false;
        if (state.info && action.payload.pin) {
          state.info.pin = action.payload.pin;
        }
      })
      .addCase(updatePin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.info) state.info.image = action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- PUPIL ---
      .addCase(pupilById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pupilById.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload;
      })
      .addCase(pupilById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updatePupilProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePupilProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.info && action.payload.pin) {
          state.info.pin = action.payload.pin;
        }
      })
      .addCase(updatePupilProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(uploadPupilAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPupilAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.info) state.info.avatar = action.payload;
      })
      .addCase(uploadPupilAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile, setAvatar } = profileSlice.actions;

export default profileSlice.reducer;
