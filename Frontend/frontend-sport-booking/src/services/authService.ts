import type {
  RegisterRequest,
  User,
  VerifyOtpRequest,
} from '../entities/user/types';
import { STORAGE_KEYS } from '../shared/constants/storage';
// import httpClient from '../shared/lib/httpClient';
import { authApiRepository } from '../features/auth/repositories/authApi.repository';

const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await authApiRepository.login(email, password);
    const { token, ...user } = response;
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user as User;
  },

  async loginWithGoogle(credential: string): Promise<User> {
    const response = await authApiRepository.loginWithGoogle(credential);
    const { token, ...user } = response;
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user as User;
  },

  async requestRegisterOtp(data: RegisterRequest): Promise<{ message: string }> {
    return await authApiRepository.requestRegisterOtp(data);
  },

  async verifyRegisterOtp(data: VerifyOtpRequest): Promise<void> {
    await authApiRepository.verifyRegisterOtp(data);
  },

  async createWalkInGuest(fullName: string, phone: string): Promise<User> {
    return await authApiRepository.createWalkInGuest(fullName, phone);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.user);
    return user ? (JSON.parse(user) as User) : null;
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async loginOld(email: string, password: string): Promise<User> {
    const response = await httpClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    const { token, ...user } = response.data;
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

    return user;
  },

  async requestRegisterOtpOld(data: RegisterRequest): Promise<{ message: string }> {
    const response = await httpClient.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  async verifyRegisterOtpOld(data: VerifyOtpRequest): Promise<void> {
    await httpClient.post('/auth/register/verify-otp', data);
  },

  async createWalkInGuestOld(fullName: string, phone: string): Promise<User> {
    const response = await httpClient.post<User>('/auth/walk-in', null, {
      params: { fullName, phone },
    });

    return response.data;
  },
  */
};

export default authService;
