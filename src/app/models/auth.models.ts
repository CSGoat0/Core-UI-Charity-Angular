// Request Models
export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  userName: string;
  fullName: string;
  password: string;
  phoneNumber?: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AssignRoleRequest {
  userId: string;
  role: string;
}

// Response Models
export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface LoginResponse {
  token: string;
  returnUrl?: string;
}

export interface UserDto {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginationParameters {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
