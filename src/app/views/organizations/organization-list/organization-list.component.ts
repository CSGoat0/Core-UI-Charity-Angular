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
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { OrganizationService } from '../../../services/organization.service';
import { Organization, PaginatedResponse, PaginationParameters } from '../../../models/organization.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
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
    TooltipDirective
  ]
})
export class OrganizationListComponent implements OnInit, OnDestroy {
  Math = Math;

  organizations: Organization[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  pagination: PaginatedResponse<Organization> | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  searchTerm: string = '';
  includeDeleted = false;

  private timeoutId: any = null;

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadOrganizations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      // Use search endpoint
      const params: PaginationParameters = {
        pageNumber: this.currentPage,
        pageSize: this.pageSize
      };

      this.organizationService.searchOrganizations(params, this.searchTerm.trim()).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success && response.data) {
            this.organizations = response.data.items;
            this.pagination = response.data;
            this.totalPages = response.data.totalPages;
          } else {
            this.errorMessage = response.message || 'No organizations found.';
            this.organizations = [];
            this.pagination = null;
            this.totalPages = 0;
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred searching organizations.';
          console.error('Search organizations error:', error);
          this.cdr.detectChanges();
        }
      });
    } else {
      // Use regular list endpoint
      const params: PaginationParameters = {
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm || undefined
      };

      this.organizationService.getAllOrganizations(params, this.includeDeleted).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success && response.data) {
            this.organizations = response.data.items;
            this.pagination = response.data;
            this.totalPages = response.data.totalPages;
          } else {
            this.errorMessage = response.message || 'Failed to load organizations.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred loading organizations.';
          console.error('Load organizations error:', error);
          this.cdr.detectChanges();
        }
      });
    }
  }

  searchOrganizations(): void {
    this.currentPage = 1;
    this.loadOrganizations();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadOrganizations();
  }

  toggleDeleted(): void {
    this.includeDeleted = !this.includeDeleted;
    this.currentPage = 1;
    this.loadOrganizations();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadOrganizations();
  }

  deleteOrganization(id: number): void {
    if (!confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.organizationService.deleteOrganization(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Organization deleted successfully.';
          this.loadOrganizations();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to delete organization.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred deleting the organization.';
        console.error('Delete organization error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  restoreOrganization(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.organizationService.restoreOrganization(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Organization restored successfully.';
          this.loadOrganizations();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to restore organization.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred restoring the organization.';
        console.error('Restore organization error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  viewOrganization(id: number): void {
    this.router.navigate(['/organizations', id]);
  }

  editOrganization(id: number): void {
    this.router.navigate(['/organizations', id, 'edit']);
  }

  getStatusBadgeColor(isDeleted: boolean): string {
    return isDeleted ? 'danger' : 'success';
  }

  getStatusText(isDeleted: boolean): string {
    return isDeleted ? 'Deleted' : 'Active';
  }

  // Safe role checks with try/catch
  get canManage(): boolean {
    try {
      if (!this.authService.isAuthenticated()) {
        return false;
      }
      return this.authService.isAdmin() || this.authService.isSuperAdmin();
    } catch (error) {
      console.warn('Error checking canManage:', error);
      return false;
    }
  }

  get canDelete(): boolean {
    try {
      if (!this.authService.isAuthenticated()) {
        return false;
      }
      return this.authService.isSuperAdmin();
    } catch (error) {
      console.warn('Error checking canDelete:', error);
      return false;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      }
    }

    return pages;
  }
}
