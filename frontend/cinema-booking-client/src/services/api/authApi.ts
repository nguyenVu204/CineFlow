import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../../types/auth';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
      return response.data;
    } catch (err: any) {
      // If server unreachable or error, throw to allow handling or fallback
      throw err;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/api/auth/me');
    return response.data;
  }
};

