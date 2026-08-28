import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authService from "../../services/modules/auth.service";
import { AuthResponse, LoginCredentials, User } from "../../services/types";
import { DEV_ROLE_OVERRIDE } from "@/config/devRoleOverride";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Async Thunks

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken || undefined;
      await authService.logout(refreshToken);
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (accessToken: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentProfile(accessToken);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Used by axios interceptor to update token without circular dependency import
    updateTokens: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    // Used for OAuth login
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;

          const backendRole = action.payload.user.role.toLowerCase(); // normalize

          state.user = {
            ...action.payload.user,
            role: DEV_ROLE_OVERRIDE.enabled
              ? DEV_ROLE_OVERRIDE.role
              : backendRole,
          };
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logout.rejected, (state) => {
        // Even if server side logout fails, we clear local state
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true; // Confirm auth if profile fetch succeeds
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, updateTokens, setCredentials } =
  authSlice.actions;
export default authSlice.reducer;
