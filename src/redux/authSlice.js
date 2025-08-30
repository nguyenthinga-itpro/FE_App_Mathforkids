import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import Api from "../api/api";

//check token expiration
export const checkTokenExpiration = createAsyncThunk(
  "auth/checkTokenExpiration",
  async (_, { dispatch }) => {
    try {
      const persistedState = await AsyncStorage.getItem("persist:root");
      if (!persistedState) return false;

      const parsed = JSON.parse(persistedState);
      const auth = parsed.auth ? JSON.parse(parsed.auth) : null;
      const token = auth?.user?.token;

      if (token) {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          dispatch(logout());
          await AsyncStorage.clear();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Token check error:", err);
      return false;
    }
  }
);

// Get all users
export const getAllUser = createAsyncThunk(
  "profile/fetchAllUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Api.get("/user");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get user by userId
export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await Api.get(`/user/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await Api.post("/user", userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Send OTP by phone
export const sendOTPByPhone = createAsyncThunk(
  "auth/sendOTPByPhone",
  async ({ userId, phoneNumber }, { rejectWithValue }) => {
    try {
      const res = await Api.post(
        `/auth/sendOtpByPhone/${phoneNumber}`,
        {},
        {
          headers: { Authorization: userId },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Send OTP by email
export const sendOTPByEmail = createAsyncThunk(
  "auth/sendOTPByEmail",
  async ({ userId, email }, { rejectWithValue }) => {
    try {
      const res = await Api.post(
        `/auth/sendOtpByEmail/${email}`,
        {},
        {
          headers: { Authorization: userId },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ userId, otpCode }, { rejectWithValue }) => {
    try {
      const res = await Api.post(`/auth/verifyAndAuthentication/${userId}`, {
        otpCode,
      });

      const {
        token,
        id,
        fullName,
        role,
        image,
        volume,
        language,
        mode,
        pin,
        pupilId,
      } = res.data;

      return {
        token,
        id,
        fullName,
        role,
        image,
        volume,
        language,
        mode,
        pin,
        ...(role !== "user" && { pupilId }),
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Verify OTP without authentication
export const verifyOnlyOTP = createAsyncThunk(
  "auth/verifyOnlyOTP",
  async ({ userId, otpCode }, { rejectWithValue }) => {
    try {
      const res = await Api.post(`/auth/verifyOTP/${userId}`, { otpCode });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await Api.patch(`/user/updateProfile/${id}`, data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await Api.post("/auth/logout", {}, { withCredentials: true });
      return;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    pupilId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setPupilId: (state, action) => {
      if (state.user) {
        state.user.pupilId = action.payload;
      }
    },
    clearPupilId: (state) => {
      if (state.user) {
        delete state.user.pupilId;
      }
      state.pupilId = null;
    },

    logout: (state) => {
      state.user = null;
      state.pupilId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
        if (action.payload.pupilId) {
          state.pupilId = action.payload.pupilId;
        }
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          id: action.payload.id,
          phoneNumber: action.payload.phoneNumber,
          role: action.payload.role,
        };
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendOTPByPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTPByPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          id: action.payload.userId,
        };
      })
      .addCase(sendOTPByPhone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendOTPByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTPByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          id: action.payload.userId,
        };
      })
      .addCase(sendOTPByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          id: action.payload.id,
          role: action.payload.role,
          token: action.payload.token,
          fullName: action.payload.fullName,
          image: action.payload.image || "",
          volume: action.payload.volume,
          language: action.payload.language,
          mode: action.payload.mode,
          pin: action.payload.pin,
          pupilId: action.payload.pupilId,
          email: action.payload.email,
        };
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyOnlyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOnlyOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyOnlyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && state.user.id === action.payload.id) {
          state.user = {
            ...state.user,
            ...action.payload,
          };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.pupilId = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, setPupilId, clearPupilId } = authSlice.actions;
export default authSlice.reducer;
