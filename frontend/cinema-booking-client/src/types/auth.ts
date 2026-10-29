export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  roles: string[];
  points: number;
  status: 'active' | 'locked';
  joinedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  points: number;
  roles: string[];
  status?: 'active' | 'locked';
  token: string;
}
