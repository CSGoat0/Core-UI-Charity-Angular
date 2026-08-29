import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  TableDirective,
  PaginationComponent,
  PageItemComponent,
  PageLinkDirective,
  AlertComponent,
  BadgeComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  TooltipDirective,
  ModalComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { User, PaginatedResponse, PaginationParameters, availableRoles } from '../../../../models/user.models';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    RouterLink,
    IconDirective,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    AlertComponent,
    BadgeComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    TooltipDirective,
    ModalComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalHeaderComponent
  ]
})
export class UserListComponent implements OnInit, OnDestroy {
  Math = Math;

  users: User[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Pagination
  pagination: PaginatedResponse<User> | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  searchTerm: string = '';
  includeDeleted = false;

  // Role management
  selectedUser: User | null = null;
  selectedRole: string = '';
  isAssigningRole = false;
  isRemovingRole = false;
  showRoleModal = false;

  // Available roles
  availableRoles = availableRoles;

  private timeoutId: any = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const params: PaginationParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined
    };

    this.userService.getAllUsers(params, this.includeDeleted).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.users = response.data.items;
          this.pagination = response.data;
          this.totalPages = response.data.totalPages;
        } else {
          this.errorMessage = response.message || 'Failed to load users.';
          this.users = [];
          this.pagination = null;
          this.totalPages = 0;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading users.';
        console.error('Load users error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  searchUsers(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  toggleDeleted(): void {
    this.includeDeleted = !this.includeDeleted;
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadUsers();
  }

  viewUser(id: string): void {
    this.router.navigate(['/admin/users', id]);
  }

  editUser(id: string): void {
    this.router.navigate(['/admin/users', id, 'edit']);
  }

  deleteUser(id: string): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'User deleted successfully.';
          this.loadUsers();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
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

  restoreUser(id: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.userService.restoreUser(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'User restored successfully.';
          this.loadUsers();

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

  // ==============================
  // Role Management
  // ==============================

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.selectedRole = '';
    this.showRoleModal = true;
    this.cdr.detectChanges();
  }

  assignRole(): void {
    if (!this.selectedUser || !this.selectedRole) {
      this.errorMessage = 'Please select a role.';
      this.cdr.detectChanges();
      return;
    }

    this.isAssigningRole = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.userService.assignRole(this.selectedUser.id, this.selectedRole).subscribe({
      next: (response) => {
        this.isAssigningRole = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = `Role '${this.selectedRole}' assigned successfully.`;
          this.showRoleModal = false;
          this.loadUsers();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to assign role.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isAssigningRole = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred assigning the role.';
        console.error('Assign role error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  removeRole(userId: string, role: string): void {
    if (!confirm(`Are you sure you want to remove the '${role}' role from this user?`)) {
      return;
    }

    this.isRemovingRole = true;
    this.cdr.detectChanges();

    this.userService.removeRole(userId, role).subscribe({
      next: (response) => {
        this.isRemovingRole = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = `Role '${role}' removed successfully.`;
          this.loadUsers();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to remove role.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isRemovingRole = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred removing the role.';
        console.error('Remove role error:', error);
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

  getCurrentUserRoles(): string[] {
    const user = this.authService.getUser();
    return user?.roles || [];
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get canManage(): boolean {
    return this.authService.isSuperAdmin();
  }

  get canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        pages.push(i);
      }
    }
    return pages;
  }

  isCurrentUser(userId: string): boolean {
    const currentUser = this.authService.getUser();
    return currentUser?.id === userId;
  }
}
