import { PaginationParameters, PaginatedResponse, ServiceResponse } from './organization.models';

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  registrationDate: Date;
  updatedOn: Date | null;
  deletedOn: Date | null;
  isDeleted: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
  lockoutEnd: Date | null;
  accessFailedCount: number;
  imgPath: string | null;
  roles: string[];
}

export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  registrationDate: Date;
  updatedOn: Date | null;
  deletedOn: Date | null;
  isDeleted: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
  lockoutEnd: Date | null;
  accessFailedCount: number;
  imgPath: string | null;
  roles: string[];
}

export interface AssignRoleRequest {
  role: string;
}

export interface CreateUserRequest {
  userName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  address?: string;
  imgPath?: string;
}

export interface UpdateUserRequest {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  imgPath?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export const availableRoles = ['Admin', 'SuperAdmin'];

export type { PaginationParameters, PaginatedResponse, ServiceResponse };
