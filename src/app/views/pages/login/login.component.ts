import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  AlertComponent
} from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    RouterLink,
    AlertComponent
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  returnUrl: string = '/dashboard';
  showResendConfirmation = false;
  resendEmail: string = '';
  resendSuccess: string | null = null;
  resendError: string | null = null;
  isResending = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.showResendConfirmation = false;
    this.resendError = null;
    this.resendSuccess = null;
    this.cdr.detectChanges();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          // User data is already stored in AuthService
          // Just redirect to the return URL
          this.router.navigateByUrl(this.returnUrl);
        } else {
          // Set error message FIRST
          this.errorMessage = response.message || 'Login failed. Please try again.';
          // Then check for email confirmation error
          this.checkForEmailConfirmationError(this.errorMessage);
          // Force UI update
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;

        const errorMsg = error.message || 'An error occurred during login.';
        // Set error message FIRST
        this.errorMessage = errorMsg;
        console.error('Login error:', error);

        // Then check for email confirmation error
        this.checkForEmailConfirmationError(errorMsg);
        // Force UI update
        this.cdr.detectChanges();
      }
    });
  }

  private checkForEmailConfirmationError(message: string): void {
    const emailErrorKeywords = ['confirm', 'verified', 'email', 'confirmation', 'verify'];
    const hasEmailError = emailErrorKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasEmailError) {
      this.showResendConfirmation = true;
      this.resendEmail = this.loginForm.get('userName')?.value || '';
      this.cdr.detectChanges();
    }
  }

  resendConfirmation(): void {
    if (!this.resendEmail) {
      this.resendError = 'Email address not available. Please try again.';
      this.cdr.detectChanges();
      return;
    }

    this.isResending = true;
    this.resendError = null;
    this.resendSuccess = null;
    this.cdr.detectChanges();

    this.authService.resendConfirmation(this.resendEmail).subscribe({
      next: (response) => {
        this.isResending = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.resendSuccess = response.message || 'A new confirmation email has been sent. Please check your inbox.';
        } else {
          this.resendError = response.message || 'Failed to resend confirmation email. Please try again.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isResending = false;
        this.cdr.detectChanges();
        this.resendError = error.message || 'An error occurred. Please try again.';
        console.error('Resend confirmation error:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isResending = false;
        this.cdr.detectChanges();
        console.log('Resend request completed');
      }
    });
  }

  // Reset error when user starts typing
  onFieldChange(): void {
    if (this.errorMessage) {
      this.errorMessage = null;
      this.showResendConfirmation = false;
      this.cdr.detectChanges();
    }
  }

  get userName() { return this.loginForm.get('userName'); }
  get password() { return this.loginForm.get('password'); }
}
