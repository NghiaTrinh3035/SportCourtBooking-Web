import type {
  ChangePasswordRequest,
  User,
  UserProfileUpdateRequest,
  UserRoleUpdateRequest,
} from '../../../entities/user/types';
import { apiClient } from '../../../core/api/apiClient';

export const userApiRepository = {
  async getMyProfile(): Promise<User> {
    return await apiClient.get<User>('/users/me');
  },

  async updateMyProfile(payload: UserProfileUpdateRequest): Promise<User> {
    return await apiClient.put<User>('/users/me', payload);
  },

  async changeMyPassword(payload: ChangePasswordRequest): Promise<string> {
    return await apiClient.put<string>('/users/me/password', payload);
  },

  async getOwnerUsers(): Promise<User[]> {
    return await apiClient.get<User[]>('/users/owner');
  },

  async searchOwnerUsers(name: string): Promise<User[]> {
    return await apiClient.get<User[]>('/users/owner/search', { params: { name } });
  },

  async updateUserRole(id: number, payload: UserRoleUpdateRequest): Promise<User> {
    return await apiClient.put<User>(`/users/${id}/role`, payload);
  },
};
