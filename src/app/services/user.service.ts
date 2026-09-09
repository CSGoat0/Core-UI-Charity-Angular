import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  UserResponse,
  AssignRoleRequest,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  PaginationParameters,
  PaginatedResponse,
  ServiceResponse
} from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/User`;

  constructor(private http: HttpClient) {}

  // ==============================
  // User Management
  // ==============================

  /**
   * Get all users with pagination
   */
  getAllUsers(params: PaginationParameters, includeDeleted: boolean = false): Observable<ServiceResponse<PaginatedResponse<User>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString())
      .set('includeDeleted', includeDeleted.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return this.http.get<ServiceResponse<PaginatedResponse<User>>>(
      `${this.apiUrl}`,
      { params: httpParams }
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<ServiceResponse<User>> {
    return this.http.get<ServiceResponse<User>>(
      `${this.apiUrl}/${userId}`
    );
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): Observable<ServiceResponse<string[]>> {
    return this.http.get<ServiceResponse<string[]>>(
      `${this.apiUrl}/${userId}/roles`
    );
  }

  /**
   * Assign role to user
   */
  assignRole(userId: string, role: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/${userId}/roles`,
      { role } as AssignRoleRequest
    );
  }

  /**
   * Remove role from user
   */
  removeRole(userId: string, role: string): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/${userId}/roles/${role}`
    );
  }

  /**
   * Create a new user (Admin/SuperAdmin only)
   */
  createUser(data: CreateUserRequest): Observable<ServiceResponse<User>> {
    return this.http.post<ServiceResponse<User>>(
      `${this.apiUrl}/register`,
      data
    );
  }

  /**
   * Update user
   */
  updateUser(data: UpdateUserRequest): Observable<ServiceResponse<User>> {
    return this.http.put<ServiceResponse<User>>(
      `${this.apiUrl}/${data.id}`,
      data
    );
  }

  /**
   * Delete user (soft delete)
   */
  deleteUser(userId: string): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/${userId}`
    );
  }

  /**
   * Restore user
   */
  restoreUser(userId: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/restore/${userId}`,
      {}
    );
  }

  /**
   * Change user password
   */
  changeUserPassword(userId: string, data: ChangePasswordRequest): Observable<ServiceResponse<null>> {
    return this.http.put<ServiceResponse<null>>(
      `${this.apiUrl}/${userId}/change-password`,
      data
    );
  }

  /**
   * Reset user password
   */
  resetUserPassword(data: ResetPasswordRequest): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/reset-password`,
      data
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(params: PaginationParameters, role: string): Observable<ServiceResponse<PaginatedResponse<User>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<ServiceResponse<PaginatedResponse<User>>>(
      `${this.apiUrl}/role/${role}`,
      { params: httpParams }
    );
  }

  /**
   * Get deleted users
   */
  getDeletedUsers(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<User>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<ServiceResponse<PaginatedResponse<User>>>(
      `${this.apiUrl}/deleted`,
      { params: httpParams }
    );
  }
}
