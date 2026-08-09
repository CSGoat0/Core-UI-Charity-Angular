import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
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
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.get('email')?.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.isSubmitted = false;

    // Disable the email control while loading
    this.forgotForm.get('email')?.disable();

    const email = this.forgotForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Re-enable the email control
        this.forgotForm.get('email')?.enable();

        if (response.success) {
          this.successMessage = response.message || 'Password reset link has been sent to your email.';
          this.isSubmitted = true;
        } else {
          this.errorMessage = response.message || 'Failed to send reset link. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Re-enable the email control on error too
        this.forgotForm.get('email')?.enable();

        this.errorMessage = error.message || 'An error occurred. Please try again.';
        console.error('Forgot password error:', error);
      }
    });
  }

  // Reset the form to try again
  resetForm(): void {
    this.isSubmitted = false;
    this.successMessage = null;
    this.errorMessage = null;
    this.forgotForm.reset();
    // Ensure the control is enabled
    this.forgotForm.get('email')?.enable();
  }

  get email() { return this.forgotForm.get('email'); }
}
