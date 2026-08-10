import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  AlertComponent,
  NavComponent,
  NavItemComponent,
  NavLinkDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../models/auth.models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    ButtonDirective,
    AlertComponent,
    IconDirective,
    NavComponent,
    NavItemComponent,
    NavLinkDirective
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isPasswordLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  passwordErrorMessage: string | null = null;
  passwordSuccessMessage: string | null = null;
  user: UserDto | null = null;
  activeTab: string = 'profile';

  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  passwordMatchValidator(group: FormGroup): any {
    const newPassword = group.get('newPassword');
    const confirmNewPassword = group.get('confirmNewPassword');

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    return newPassword.value === confirmNewPassword.value ? null : { passwordMismatch: true };
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const storedUser = this.authService.getUser();

    if (storedUser && storedUser.id) {
      this.user = storedUser;
      this.updateProfileForm(storedUser);
      this.isLoading = false;
      this.cdr.detectChanges();

      this.authService.getCurrentUser().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.user = response.data;
            this.updateProfileForm(response.data);
            this.authService.updateCurrentUser(response.data);
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.warn('Failed to refresh user data:', error);
        }
      });
    } else {
      this.authService.getCurrentUser().subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success && response.data) {
            this.user = response.data;
            this.updateProfileForm(response.data);
          } else {
            this.errorMessage = 'Failed to load user profile.';
            this.authService.logout();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred loading your profile.';
          console.error('Load profile error:', error);
          this.authService.logout();
        }
      });
    }
  }

  updateProfileForm(user: UserDto): void {
    this.profileForm.patchValue({
      fullName: user.fullName || '',
      userName: user.userName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    });
    this.cdr.detectChanges();
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    if (!this.user) {
      this.errorMessage = 'User not found. Please refresh the page.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();

    const updatedData = {
      id: this.user.id,
      fullName: this.profileForm.get('fullName')?.value,
      userName: this.profileForm.get('userName')?.value,
      email: this.user.email,
      phoneNumber: this.profileForm.get('phoneNumber')?.value
    };

    this.authService.updateUser(updatedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          // Fetch fresh user data from the server
          this.authService.getUserById(this.user!.id).subscribe({
            next: (userResponse) => {
              this.isLoading = false;
              this.cdr.detectChanges();

              if (userResponse.success && userResponse.data) {
                this.user = userResponse.data;
                this.updateProfileForm(userResponse.data);
                this.authService.updateCurrentUser(userResponse.data);
                this.successMessage = 'Profile updated successfully!';
              } else {
                this.errorMessage = userResponse.message || 'Failed to refresh user data after update.';
              }
              this.cdr.detectChanges();

              this.timeoutId = setTimeout(() => {
                this.successMessage = null;
                this.cdr.detectChanges();
              }, 5000);
            },
            error: (error) => {
              this.isLoading = false;
              this.cdr.detectChanges();
              console.error('Failed to fetch user data after update:', error);
              this.errorMessage = 'Profile updated but failed to refresh data. Please refresh the page.';
              this.cdr.detectChanges();
            }
          });
        } else {
          this.errorMessage = response.message || 'Failed to update profile.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred updating your profile.';
        console.error('Update profile error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    if (!this.user) {
      this.passwordErrorMessage = 'User not found. Please refresh the page.';
      this.cdr.detectChanges();
      return;
    }

    this.isPasswordLoading = true;
    this.passwordErrorMessage = null;
    this.passwordSuccessMessage = null;
    this.cdr.detectChanges();

    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
      confirmNewPassword: this.passwordForm.get('confirmNewPassword')?.value
    };

    this.authService.changePassword(this.user.id, passwordData).subscribe({
      next: (response) => {
        this.isPasswordLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.passwordSuccessMessage = 'Password changed successfully!';
          this.passwordForm.reset();

          this.timeoutId = setTimeout(() => {
            this.passwordSuccessMessage = null;
            this.cdr.detectChanges();
          }, 5000);
        } else {
          this.passwordErrorMessage = response.message || 'Failed to change password.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isPasswordLoading = false;
        this.cdr.detectChanges();
        this.passwordErrorMessage = error.message || 'An error occurred changing your password.';
        console.error('Change password error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  get fullName() { return this.profileForm.get('fullName'); }
  get userName() { return this.profileForm.get('userName'); }
  get email() { return this.profileForm.get('email'); }
  get phoneNumber() { return this.profileForm.get('phoneNumber'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmNewPassword() { return this.passwordForm.get('confirmNewPassword'); }
}
