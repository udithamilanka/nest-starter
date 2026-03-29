export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  clientId?: string;
}

export interface AuthResult {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
}
