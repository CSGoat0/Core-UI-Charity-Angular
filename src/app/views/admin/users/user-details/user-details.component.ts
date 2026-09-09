import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  BadgeComponent,
  NavComponent,
  NavItemComponent,
  NavLinkDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../models/user.models';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  imports: [
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    AlertComponent,
    BadgeComponent,
    IconDirective,
    NavComponent,
    NavItemComponent,
    NavLinkDirective
  ]
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  activeTab: string = 'details';

  private timeoutId: any = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadUser(id);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
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
          this.user = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load user details.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading user details.';
        console.error('Load user error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  editUser(): void {
    if (this.user) {
      this.router.navigate(['/admin/users', this.user.id, 'edit']);
    }
  }

  deleteUser(): void {
    if (!this.user) return;
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.userService.deleteUser(this.user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.router.navigate(['/admin/users']);
        } else {
          this.errorMessage = response.message || 'Failed to delete user.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred deleting the user.';
        console.error('Delete user error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  restoreUser(): void {
    if (!this.user) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.userService.restoreUser(this.user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.loadUser(this.user!.id);
          this.successMessage = 'User restored successfully.';
          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to restore user.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred restoring the user.';
        console.error('Restore user error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  getStatusBadgeColor(isDeleted: boolean): string {
    return isDeleted ? 'danger' : 'success';
  }

  getStatusText(isDeleted: boolean): string {
    return isDeleted ? 'Deleted' : 'Active';
  }

  getEmailConfirmedBadge(confirmed: boolean): string {
    return confirmed ? 'success' : 'warning';
  }

  getEmailConfirmedText(confirmed: boolean): string {
    return confirmed ? 'Verified' : 'Unverified';
  }

  /**
   * Check if a role is an organization role
   */
  isOrganizationRole(role: string): boolean {
    return role.includes(':');
  }

  /**
   * Get display name for a role
   */
  getRoleDisplayName(role: string): string {
    if (role === 'SuperAdmin') {
      return 'SuperAdmin';
    }
    if (role.includes(': Admin')) {
      return 'Organization Admin';
    }
    if (role.includes(': SubAdmin')) {
      return 'Organization Sub-Admin';
    }
    return role;
  }

  /**
   * Get badge color for a role
   */
  getRoleBadgeColor(role: string): string {
    if (role === 'SuperAdmin') {
      return 'danger';
    }
    if (role.includes(': Admin')) {
      return 'primary';
    }
    if (role.includes(': SubAdmin')) {
      return 'secondary';
    }
    return 'info';
  }

  /**
   * Get the organization name from an organization role
   */
  getOrganizationNameFromRole(role: string): string {
    if (role.includes(':')) {
      return role.split(':')[0].trim();
    }
    return '';
  }

  get canManage(): boolean {
    return this.authService.isSuperAdmin();
  }

  get canDelete(): boolean {
    return this.authService.isSuperAdmin() && this.user?.id !== this.authService.getUser()?.id;
  }

  successMessage: string | null = null;
}
