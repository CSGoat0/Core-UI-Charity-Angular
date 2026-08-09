import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
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
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
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
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitted = false;

  email: string = '';
  token: string = '';

  Math = Math;

  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Get email and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['encodedToken'] || '';

      console.log('Reset Password Component initialized with email:', this.email, 'and token:', this.token);

      // If missing required parameters, show error
      if (!this.email || !this.token) {
        this.errorMessage = 'Invalid or missing reset link. Please request a new password reset.';
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up timeout if component is destroyed
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    // Check if form is valid
    if (this.resetForm.invalid) {
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Check if we have email and token
    if (!this.email || !this.token) {
      this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      return;
    }

    // Set loading state
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.isSubmitted = false;

    // Disable the entire form while loading
    this.resetForm.disable();

    // Safety timeout - stop loading after 15 seconds
    this.timeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.resetForm.enable();
        this.errorMessage = 'Request timed out. Please try again.';
        console.warn('Reset password request timed out');
      }
    }, 15000);

    const resetData = {
      email: this.email,
      token: this.token,
      password: this.resetForm.get('password')?.value
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        // Clear timeout
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

        // Reset loading state and re-enable controls
        this.isLoading = false;
        this.resetForm.enable();

        if (response.success) {
          this.isSubmitted = true;
          this.successMessage = 'Your password has been reset successfully!';

          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to reset password. Please try again.';
        }
      },
      error: (error) => {
        // Clear timeout
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

        // Reset loading state and re-enable controls
        this.isLoading = false;
        this.resetForm.enable();

        this.errorMessage = error.message || 'An error occurred. Please try again.';
        console.error('Reset password error:', error);
      }
    });
  }

  // Reset the form to try again
  resetFormState(): void {
    this.isSubmitted = false;
    this.successMessage = null;
    this.errorMessage = null;
    this.resetForm.reset();
    this.resetForm.enable();
  }

  // Navigate back to forgot password
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Convenience getters for form controls
  get password() { return this.resetForm.get('password'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }
}
