import type { UserRole } from './users';

export interface AuthCompany {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthSession {
  user: AuthUser;
  company: AuthCompany;
}

export interface RegisterAccountInput {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
