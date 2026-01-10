import apiClient from './client';
import type { LoginCredentials, LoginResponse, User, ChangePasswordData } from '@/types/user';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current user
   */
  me: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};
