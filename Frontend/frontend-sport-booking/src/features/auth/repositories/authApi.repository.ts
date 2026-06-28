import type {
  LoginResponse,
  RegisterRequest,
  User,
  VerifyOtpRequest,
} from '../../../entities/user/types';
import { apiClient } from '../../../core/api/apiClient';

export const authApiRepository = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
  },

  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>('/auth/google', {
      credential,
    });
  },

  async requestRegisterOtp(data: RegisterRequest): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>('/auth/register', data);
  },

  async verifyRegisterOtp(data: VerifyOtpRequest): Promise<User> {
    return await apiClient.post<User>('/auth/register/verify-otp', data);
  },

  async createWalkInGuest(fullName: string, phone: string): Promise<User> {
    return await apiClient.post<User>('/auth/walk-in', null, {
      params: { fullName, phone },
    });
  },
};
