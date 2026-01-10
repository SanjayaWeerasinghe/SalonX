export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
