import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  AlertComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormLabelDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { CreateUserRequest, UpdateUserRequest } from '../../../../models/user.models';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    AlertComponent,
    IconDirective,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormLabelDirective
  ]
})
export class UserFormComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditMode = false;
  userId: string | null = null;
  pageTitle = 'Create User';

  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        this.pageTitle = 'Edit User';
        this.loadUser(id);

        // Remove password validators for edit mode
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.get('confirmPassword')?.clearValidators();
        this.userForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  passwordMatchValidator(group: FormGroup): any {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  loadUser(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.userService.getUserById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          const user = response.data;
          this.userForm.patchValue({
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            address: user.address || ''
          });
        } else {
          this.errorMessage = response.message || 'Failed to load user.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading the user.';
        console.error('Load user error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();

    const formData = this.userForm.value;

    if (this.isEditMode && this.userId) {
      const updateData: UpdateUserRequest = {
        id: this.userId,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      };

      this.userService.updateUser(updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success) {
            this.successMessage = 'User updated successfully!';
            this.timeoutId = setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to update user.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred updating the user.';
          console.error('Update user error:', error);
          this.cdr.detectChanges();
        }
      });
    } else {
      const createData: CreateUserRequest = {
        userName: formData.userName,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        address: formData.address
      };

      this.userService.createUser(createData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success) {
            this.successMessage = 'User created successfully!';
            this.timeoutId = setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to create user.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred creating the user.';
          console.error('Create user error:', error);
          this.cdr.detectChanges();
        }
      });
    }
  }

  get userName() { return this.userForm.get('userName'); }
  get fullName() { return this.userForm.get('fullName'); }
  get email() { return this.userForm.get('email'); }
  get phoneNumber() { return this.userForm.get('phoneNumber'); }
  get address() { return this.userForm.get('address'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }

  get canManage(): boolean {
    return this.authService.isSuperAdmin();
  }
}
