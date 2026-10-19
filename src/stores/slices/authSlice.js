import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import userService from "../../services/userService";
// 🧩 Đăng nhập thường
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      return res.data; // backend trả { message, data: user }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Đăng nhập thất bại!" });
    }
  }
);

// 🧩 Đăng nhập qua Firebase (Google)
export const signInWithGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async (firebaseData, { rejectWithValue }) => {
    try {
      // firebaseData = { idToken: "..." }
      const res = await authService.loginWithGoogle(firebaseData);
      return res.data; // backend trả { data: { id, username, accessToken, refreshToken } }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Đăng nhập Google thất bại!" });
    }
  }
);

// 🧩 Lấy user hiện tại
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getCurrentUser();
      console.log("res",res.data.data.provider);
      
      return res.data.data; // dữ liệu user
    } catch (err) {
      return rejectWithValue(err.response?.data || "Unauthorized");
    }
  }
);


export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async ({data }, { rejectWithValue }) => {
        try {
            // GỌI HÀM CẬP NHẬT TỪ USER SERVICE
            const res = await userService.updateProfile(data);
            // Trả về dữ liệu user đã được cập nhật
            return res.data.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cập nhật hồ sơ thất bại!" });
        }
    }
);


// 🧩 Đăng xuất
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Logout failed");
  }
});

// ==================================================

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Đăng nhập thường =====
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== Đăng nhập Google =====
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== Lấy user hiện tại =====
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
      })

      // ===== Logout =====
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
