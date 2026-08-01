import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Import models
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

  // BehaviorSubject to track authentication state
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in on app initialization
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
          this.handleSuccessfulLogin(response.data.token);
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
      email
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
      email
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
  changePassword(userId: string, changeData: ChangePasswordRequest): Observable<ServiceResponse<null>> {
    return this.http.put<ServiceResponse<null>>(
      `${this.apiUrl}/User/${userId}/change-password`,
      changeData
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
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ServiceResponse<UserDto>>(
      `${this.apiUrl}/User/${userId}`
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
          localStorage.setItem(this.userKey, JSON.stringify(response.data));
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
      catchError(this.handleError)
    );
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
    // Parse the return URL from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl') || '/';
    const remoteError = urlParams.get('remoteError');

    if (remoteError) {
      return throwError(() => new Error(`External login error: ${remoteError}`));
    }

    // The backend will handle the external login and return the token
    // The token is returned in the response data
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
          this.handleSuccessfulLogin(response.data.token);
          // Redirect to return URL after successful login
          this.router.navigateByUrl(returnUrl);
        }
      }),
      catchError(this.handleError)
    );
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
        return JSON.parse(userData);
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
    return user ? user.roles.includes(role) : false;
  }

  /**
   * Check if user is Admin
   */
  isAdmin(): boolean {
    return this.hasRole('Admin');
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

  private handleSuccessfulLogin(token: string): void {
    // Store token
    localStorage.setItem(this.tokenKey, token);

    // Load user data from token or fetch from API
    this.loadUserData();

    // Update authentication state
    this.isAuthenticatedSubject.next(true);
  }

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

  private loadUserData(): void {
    // If we have a token but no user data, fetch it
    if (this.getToken() && !this.getUser()) {
      this.getCurrentUser().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
            localStorage.setItem(this.userKey, JSON.stringify(response.data));
          }
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
          // If we can't load user data, logout
          this.logout();
        }
      });
    } else {
      // Use stored user data
      const user = this.getUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
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
