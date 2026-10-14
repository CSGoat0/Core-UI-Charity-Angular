import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ServiceResponse,
  LoginResponse,
  UserDto
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = environment.auth.tokenKey;
  private userKey = environment.auth.userKey;

  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  // ==============================
  // Authentication Methods
  // ==============================

  /**
   * Login user with username and password
   */
  login(credentials: LoginRequest): Observable<ServiceResponse<LoginResponse>> {
    return this.http.post<ServiceResponse<LoginResponse>>(
      `${this.apiUrl}/User/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Store the token
          localStorage.setItem(this.tokenKey, response.data.token);

          // Store the user data if available
          if (response.data.user) {
            this.currentUserSubject.next(response.data.user);
            localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
          }

          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/User/register`,
      userData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Confirm email with token
   */
  confirmEmail(email: string, token: string): Observable<ServiceResponse<null>> {
    return this.http.get<ServiceResponse<null>>(
      `${this.apiUrl}/User/confirm-email`,
      {
        params: {
          email: email,
          encodedToken: token
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Resend email confirmation
   */
  resendConfirmation(email: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/User/resend-confirmation`,
      null,
      {
        params: {
          email: email
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/User/forgot-password`,
      null,
      {
        params: {
          email: email
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(resetData: ResetPasswordRequest): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/User/reset-password`,
      resetData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Change password (authenticated user)
   */
  changePassword(userId: string, passwordData: ChangePasswordRequest): Observable<ServiceResponse<null>> {
    return this.http.put<ServiceResponse<null>>(
      `${this.apiUrl}/User/${userId}/change-password`,
      passwordData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ==============================
  // User Management Methods
  // ==============================

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<ServiceResponse<UserDto>> {
    const user = this.getUser();

    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ServiceResponse<UserDto>>(
      `${this.apiUrl}/User/${user.id}`
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateCurrentUser(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<ServiceResponse<UserDto>> {
    return this.http.get<ServiceResponse<UserDto>>(
      `${this.apiUrl}/User/${userId}`
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateCurrentUser(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile - DOES NOT update local data automatically
   * Caller should call getUserById() after successful update
   */
  updateUser(userData: any): Observable<ServiceResponse<null>> {
    return this.http.put<ServiceResponse<null>>(
      `${this.apiUrl}/User/${userData.id}`,
      userData
    ).pipe(
      tap(response => {
        console.log('[AuthService] updateUser response:', response);
        // We don't update local data here because the response doesn't contain user data
        // The caller should call getUserById() to refresh the data
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update the current user data in the service and localStorage
   */
  updateCurrentUser(user: UserDto): void {
    console.log('[AuthService] updateCurrentUser called with:', user);
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    console.log('[AuthService] User data saved to localStorage');
  }

  // ==============================
  // External Login Methods
  // ==============================

  /**
   * Initiate external login with provider
   */
  externalLogin(provider: string, returnUrl: string = '/'): void {
    const redirectUrl = `${this.apiUrl}/ExternalLogin/external-login`;
    window.location.href = `${redirectUrl}?provider=${provider}&returnUrl=${returnUrl}`;
  }

  /**
   * Handle external login callback
   */
  handleExternalLoginCallback(): Observable<ServiceResponse<LoginResponse>> {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl') || '/';
    const remoteError = urlParams.get('remoteError');

    if (remoteError) {
      return throwError(() => new Error(`External login error: ${remoteError}`));
    }

    return this.http.get<ServiceResponse<LoginResponse>>(
      `${this.apiUrl}/ExternalLogin/external-login-callback`,
      {
        params: {
          returnUrl: returnUrl
        }
      }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem(this.tokenKey, response.data.token);

          if (response.data.user) {
            this.updateCurrentUser(response.data.user);
          }

          this.isAuthenticatedSubject.next(true);
          this.router.navigateByUrl(returnUrl);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Complete external login by storing the JWT received from the backend redirect
   * and decoding it to reconstruct the user object.
   *
   * The backend redirects to the frontend callback route with the token and
   * returnUrl as query params. The callback component calls this method with the
   * token so we can persist it before navigating away.
   */
  completeExternalLogin(token: string): void {
    if (!token) {
      throw new Error('Authentication token is required.');
    }

    // Store the token immediately so any subsequent API call is authenticated.
    localStorage.setItem(this.tokenKey, token);

    // Decode the JWT payload. We do not verify the signature here — verification
    // happens server-side on every API call. We only read claims to build the
    // local user object for UI purposes.
    const user = this.decodeJwtToUser(token);

    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Decodes a JWT payload into a UserDto shape.
   * Only fields present in the token are populated; the rest are placeholders.
   * Callers can refresh from the API for full data via getCurrentUser().
   */
  private decodeJwtToUser(token: string): UserDto {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) {
      throw new Error('Malformed token.');
    }

    // JWT uses base64url encoding. Convert to standard base64 and pad.
    const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payloadJson = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(payloadJson);

    // .NET JWT claim names.
    const id: string = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
    const email: string = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
    const userName: string = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '';

    // Role claims can be a single string or an array depending on how many roles.
    let roles: string[] = [];
    const rawRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (Array.isArray(rawRole)) {
      roles = rawRole;
    } else if (typeof rawRole === 'string') {
      roles = [rawRole];
    }

    return {
      id,
      email,
      userName,
      fullName: '',           // not in the token; filled by getCurrentUser()
      phoneNumber: '',        // not in the token; filled by getCurrentUser()
      emailConfirmed: true,   // external logins are treated as confirmed
      roles,
      createdAt: new Date(),
      updatedAt: undefined,
      deletedAt: undefined
    };
  }

  // ==============================
  // Token and User Management
  // ==============================

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored user data
   */
  getUser(): UserDto | null {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Ensure roles is always an array
        if (!user.roles || !Array.isArray(user.roles)) {
          user.roles = [];
        }
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get current user ID from stored user
   */
  getUserId(): string | null {
    const user = this.getUser();
    return user ? user.id : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    // Safe check with multiple fallbacks
    if (!user) {
      return false;
    }
    if (!user.roles || !Array.isArray(user.roles)) {
      return false;
    }
    return user.roles.includes(role);
  }

  /**
   * Check if user is SuperAdmin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }

  // ==============================
  // Private Helper Methods
  // ==============================

  /**
   * Load stored user on app initialization
   */
  private loadStoredUser(): void {
    const user = this.getUser();
    const token = this.getToken();

    if (user && token) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Bad request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 415:
            errorMessage = 'Unsupported media type. Please try again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
