import type {
  ChangePasswordRequest,
  User,
  UserProfileUpdateRequest,
  UserRoleUpdateRequest,
} from '../entities/user/types';
// import httpClient from '../shared/lib/httpClient';
import { userApiRepository } from '../features/users/repositories/userApi.repository';

const userService = {
  async getMyProfile(): Promise<User> {
    return await userApiRepository.getMyProfile();
  },

  async updateMyProfile(payload: UserProfileUpdateRequest): Promise<User> {
    return await userApiRepository.updateMyProfile(payload);
  },

  async changeMyPassword(payload: ChangePasswordRequest): Promise<string> {
    return await userApiRepository.changeMyPassword(payload);
  },

  async getOwnerUsers(): Promise<User[]> {
    return await userApiRepository.getOwnerUsers();
  },

  async searchOwnerUsers(name: string): Promise<User[]> {
    return await userApiRepository.searchOwnerUsers(name);
  },

  async updateUserRole(id: number, payload: UserRoleUpdateRequest): Promise<User> {
    return await userApiRepository.updateUserRole(id, payload);
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async getMyProfileOld(): Promise<User> {
    const response = await httpClient.get<User>('/users/me');
    return response.data;
  },

  async updateMyProfileOld(payload: UserProfileUpdateRequest): Promise<User> {
    const response = await httpClient.put<User>('/users/me', payload);
    return response.data;
  },

  async changeMyPasswordOld(payload: ChangePasswordRequest): Promise<string> {
    const response = await httpClient.put<string>('/users/me/password', payload);
    return response.data;
  },

  async getOwnerUsersOld(): Promise<User[]> {
    const response = await httpClient.get<User[]>('/users/owner');
    return response.data;
  },

  async searchOwnerUsersOld(name: string): Promise<User[]> {
    const response = await httpClient.get<User[]>('/users/owner/search', { params: { name } });
    return response.data;
  },

  async updateUserRoleOld(id: number, payload: UserRoleUpdateRequest): Promise<User> {
    const response = await httpClient.put<User>(`/users/${id}/role`, payload);
    return response.data;
  },
  */
};

export default userService;
