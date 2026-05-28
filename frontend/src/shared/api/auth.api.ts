import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { LoginFormData, RegisterFormData } from '@/lib/zod/schemas';
import type { AuthUser } from '@/app/providers/AuthProvider';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface ProfileResponse {
  user: AuthUser;
}

/**
 * Auth API Service
 * Centralized authentication API calls
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (
    data: Omit<RegisterFormData, 'confirmPassword' | 'acceptTerms'>
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ProfileResponse>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    return response.data.user;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password }
    );
    return response.data;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    );
    return response.data;
  },
};
