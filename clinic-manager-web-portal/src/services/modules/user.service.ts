import axiosInstance from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';
import type { 
  User, 
  ApiResponse, 
  UserManagementStats,
  RolePermissionsResponse,
  UpdatePermissionPayload,
  UserListResponse,
  Pagination,
  SuspendUserPayload,
  CreateUserPayload,
  UserDetails,
  UpdateUserPayload,
  UserProfileData
} from '../types';

/**
 * User service
 * Handles all user-related API calls
 */

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(ENDPOINTS.USER.PROFILE);
    return response.data.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.put<ApiResponse<User>>(
      ENDPOINTS.USER.UPDATE_PROFILE,
      data
    );
    return response.data.data;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      ENDPOINTS.USER.CHANGE_PASSWORD,
      { currentPassword, newPassword }
    );
    return response.data.data;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post<ApiResponse<{ avatarUrl: string }>>(
      ENDPOINTS.USER.UPLOAD_AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get user management dashboard statistics
   */
  async getUserManagementStats(): Promise<UserManagementStats> {
    const response = await axiosInstance.get<ApiResponse<{ cardsCounts: UserManagementStats }>>(
      ENDPOINTS.USER_MANAGEMENT.CARDS
    );
    return response.data.data.cardsCounts;
  }

  /**
   * Get role permissions list
   */
  async getRolePermissions(): Promise<RolePermissionsResponse> {
    const response = await axiosInstance.get<ApiResponse<RolePermissionsResponse>>(
      ENDPOINTS.USER_MANAGEMENT.ROLE_PERMISSIONS_LIST
    );
    return response.data.data;
  }

  /**
   * Update role permission
   */
  async updatePermission(payload: UpdatePermissionPayload): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>(
      ENDPOINTS.USER_MANAGEMENT.ROLE_PERMISSIONS_UPDATE,
      payload
    );
  }

  /**
   * Get user list with filters and pagination
   */
  async getUserList(params: Record<string, string | number>, signal?: AbortSignal): Promise<UserListResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      meta: {
        pagination: Pagination;
      };
      data: Array<{ items: any[] }>;
    }>(ENDPOINTS.USER_MANAGEMENT.USER_LIST, {
      params,
      signal,
    });

    const users = response.data.data[0]?.items || [];
    const pagination = response.data.meta.pagination;

    return {
      users,
      pagination,
    };
  }

  /**
   * Suspend user
   */
  async suspendUser(payload: SuspendUserPayload): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>(
      ENDPOINTS.USER_MANAGEMENT.SUSPEND_USER,
      payload
    );
  }

  /**
   * Create new user
   */
  async createUser(payload: CreateUserPayload): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post<ApiResponse<any>>(
      ENDPOINTS.USER_MANAGEMENT.CREATE_USER,
      payload
    );
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDetails> {
    const response = await axiosInstance.get<ApiResponse<UserDetails>>(
      `${ENDPOINTS.USER_MANAGEMENT.VIEW_USER}/${userId}`
    );
    return response.data.data;
  }

  /**
   * Update user
   */
  async updateUser(payload: UpdateUserPayload): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>(
      ENDPOINTS.USER_MANAGEMENT.UPDATE_USER,
      payload
    );
  }

  /**
   * Get user profile with permissions
   */
  async getUserProfile(): Promise<UserProfileData> {
    const response = await axiosInstance.get<ApiResponse<UserProfileData>>(
      ENDPOINTS.USER_MANAGEMENT.PROFILE
    );
    return response.data.data;
  }
}

export default new UserService();
