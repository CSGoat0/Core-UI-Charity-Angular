import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  AlertComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  imports: [
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    AlertComponent,
    IconDirective
  ]
})
export class ConfirmEmailComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  email: string = '';
  token: string = '';
  isResending = false;
  resendSuccess: string | null = null;
  resendError: string | null = null;
  showResendButton = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['encodedToken'] || '';

      if (!this.email || !this.token) {
        this.isLoading = false;
        this.errorMessage = 'Invalid or missing confirmation link. Please check your email for the correct link.';
        this.showResendButton = true;
        this.cdr.detectChanges();
        return;
      }

      this.confirmEmail();
    });
  }

  confirmEmail(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();

    this.authService.confirmEmail(this.email, this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.isSuccess = true;
          this.successMessage = response.message || 'Your email has been confirmed successfully!';
          this.showResendButton = false;
        } else {
          this.errorMessage = response.message || 'Failed to confirm email. Please try again.';
          this.showResendButton = true;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred during email confirmation.';
        this.showResendButton = true;
        console.error('Confirm email error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  resendConfirmation(): void {
    if (!this.email) {
      this.resendError = 'Email address not available. Please register again.';
      this.cdr.detectChanges();
      return;
    }

    this.isResending = true;
    this.resendError = null;
    this.resendSuccess = null;
    this.cdr.detectChanges();

    this.authService.resendConfirmation(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.resendSuccess = response.message || 'A new confirmation email has been sent. Please check your inbox.';
          this.showResendButton = false;
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
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
