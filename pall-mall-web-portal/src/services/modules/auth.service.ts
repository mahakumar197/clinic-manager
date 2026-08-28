import axiosInstance from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
  VerifyOtpData,
  UserListItem,
  User,
} from "../types";

/**
 * Authentication service
 * Handles all auth-related API calls
 */

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<
      AuthResponse | ApiResponse<AuthResponse>
    >(ENDPOINTS.AUTH.LOGIN, credentials);

    // Handle both cases: wrapped in 'data' or direct response
    const responseData =
      (response.data as ApiResponse<AuthResponse>).data ||
      (response.data as AuthResponse);

    return responseData;
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile(accessToken?: string): Promise<User> {
    const config = accessToken
      ? { params: { accessToken } }
      : undefined;

    const response = await axiosInstance.get<User>(
      ENDPOINTS.USER.LOGIN_PROFILE,
      config
    );
    // The endpoint returns the User object directly, not wrapped in 'data'
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data.data;
  }

  /**
   * Logout user
   */
  async logout(refreshToken?: string): Promise<void> {
    await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await axiosInstance.post<
      ApiResponse<{ accessToken: string }>
    >(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
    return response.data.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data.data;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(
    data: VerifyOtpData
  ): Promise<{ token: string; message: string }> {
    // The API returns { valid: boolean, message: string } directly, not wrapped in our standard ApiResponse
    const response = await axiosInstance.post<{
      valid: boolean;
      message: string;
      data: {
        resetToken: string;
        message: string;
      };
    }>(ENDPOINTS.AUTH.VERIFY_OTP, data);

    if (response.data.valid === false) {
      throw new Error(response.data.message || "Invalid OTP");
    }

    // Attempt to return consistent structure, assuming token might be present if valid=true
    return {
      token: response.data.data.resetToken,
      message: response.data.data.message,
    };
  }

  /**
   * Reset password
   */
  async resetPassword(
    email: string,
    newPassword: string,
    resetToken: string
  ): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      { email, newPassword, resetToken }
    );
    return response.data.data;
  }

  /**
   * Get users by role
   */
  // async getUsersByRole(roleType: string) {
  //   const response = await axiosInstance.get<UserListItem[]>(
  //     ENDPOINTS.AUTH.USER_LIST,
  //     {
  //       params: {
  //         roleType: roleType,
  //       },
  //     }
  //   );

  //   return response.data;
  // }

  async getUsersByRole(params: {
    roleType?: string;
    exclude?: string;
    search?: string;
  }, signal?: AbortSignal) {
    const response = await axiosInstance.get(ENDPOINTS.AUTH.USER_LIST, {
      params,
      signal,
    });

    return response.data?.data ?? response.data;
  }
}

export default new AuthService();
