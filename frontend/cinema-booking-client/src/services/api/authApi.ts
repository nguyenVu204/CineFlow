import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../../types/auth';
import { AdminUser } from '../../types/admin';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/api/auth/me');
    return response.data;
  },

  async addPoints(points: number): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/api/auth/me/points', { points });
    return response.data;
  },

  async getUsers(): Promise<AdminUser[]> {
    try {
      const response = await apiClient.get<UserResponse[]>('/api/auth/users');
      return response.data.map((u) => {
        let roleName: 'Quản trị viên' | 'Nhân viên soát vé' | 'Khách hàng VIP' | 'Thành viên' = 'Thành viên';
        if (u.roles.includes('Admin')) roleName = 'Quản trị viên';
        else if (u.roles.includes('Staff')) roleName = 'Nhân viên soát vé';
        else if (u.roles.includes('VIP')) roleName = 'Khách hàng VIP';

        const joinedDate = u.joinedAt ? new Date(u.joinedAt).toLocaleDateString('vi-VN') : '2025-01-01';

        return {
          id: u.id,
          name: u.displayName,
          email: u.email,
          phone: u.phoneNumber || '0988123456',
          role: roleName,
          points: u.points || 0,
          joined: joinedDate,
          status: u.status || 'active'
        };
      });
    } catch {
      return [];
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'locked'): Promise<void> {
    await apiClient.put(`/api/auth/users/${userId}/status`, { status });
  },

  async createUser(data: {
    email: string;
    password: string;
    displayName: string;
    phoneNumber?: string;
    role?: string;
    points?: number;
  }): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/api/auth/users', data);
    return response.data;
  },

  async updateUser(
    userId: string,
    data: { displayName: string; phoneNumber?: string; role?: string; points?: number }
  ): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/api/auth/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/auth/users/${userId}`);
  }
};
