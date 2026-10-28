export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
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
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  points: number;
  roles: string[];
  token: string;
}

