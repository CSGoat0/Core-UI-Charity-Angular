import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
  TooltipDirective,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DonationService } from '../../../../services/donation.service';
import { AuthService } from '../../../../services/auth.service';
import { Donation, PaginatedResponse, PaginationParameters } from '../../../../models/donation.models';

@Component({
  selector: 'app-donation-list',
  templateUrl: './donation-list.component.html',
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
    IconDirective,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    AlertComponent,
    BadgeComponent,
    FormControlDirective,
    TooltipDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ]
})
export class DonationListComponent implements OnInit, OnDestroy {
  Math = Math;

  donations: Donation[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Pagination
  pagination: PaginatedResponse<Donation> | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Filters
  includeDeleted = false;
  filterType: string = 'all'; // 'all', 'by-campaign', 'by-user', 'amount-range', 'date-range'
  campaignIdFilter: number | null = null;
  userIdFilter: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  startDate: string = '';
  endDate: string = '';

  filterOptions = [
    { value: 'all', label: 'All Donations' },
    { value: 'by-campaign', label: 'By Campaign' },
    { value: 'by-user', label: 'By User' },
    { value: 'amount-range', label: 'By Amount Range' },
    { value: 'date-range', label: 'By Date Range' }
  ];

  // Statistics
  totalAmount = 0;
  totalCount = 0;

  private timeoutId: any = null;

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDonations();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadDonations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const params: PaginationParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    // Route to different endpoints based on filter type
    if (this.filterType === 'by-campaign' && this.campaignIdFilter) {
      this.donationService.getDonationsByCampaign(params, this.campaignIdFilter).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else if (this.filterType === 'by-user' && this.userIdFilter) {
      this.donationService.getDonationsByUser(params, this.userIdFilter).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else if (this.filterType === 'amount-range' && this.minAmount !== null && this.maxAmount !== null) {
      this.donationService.getDonationsByAmountRange(params, this.minAmount, this.maxAmount).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else if (this.filterType === 'date-range' && this.startDate && this.endDate) {
      this.donationService.getDonationsByDateRange(
        params,
        new Date(this.startDate),
        new Date(this.endDate)
      ).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else {
      // Default: all donations
      this.donationService.getAllDonations(params, this.includeDeleted).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    }
  }

  private handleResponse(response: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();

    if (response.success && response.data) {
      this.donations = response.data.items;
      this.pagination = response.data;
      this.totalPages = response.data.totalPages;
    } else {
      this.errorMessage = response.message || 'Failed to load donations.';
      this.donations = [];
      this.pagination = null;
      this.totalPages = 0;
    }
    this.cdr.detectChanges();
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();
    this.errorMessage = error.message || 'An error occurred loading donations.';
    console.error('Load donations error:', error);
    this.cdr.detectChanges();
  }

  loadStatistics(): void {
    this.donationService.getTotalDonationsAmount().subscribe({
      next: (response) => {
        if (response.success && response.data !== undefined) {
          this.totalAmount = response.data;
          this.cdr.detectChanges();
        }
      }
    });

    this.donationService.getTotalDonationsCount().subscribe({
      next: (response) => {
        if (response.success && response.data !== undefined) {
          this.totalCount = response.data;
          this.cdr.detectChanges();
        }
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadDonations();
  }

  clearFilters(): void {
    this.filterType = 'all';
    this.campaignIdFilter = null;
    this.userIdFilter = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.startDate = '';
    this.endDate = '';
    this.includeDeleted = false;
    this.currentPage = 1;
    this.loadDonations();
  }

  toggleDeleted(): void {
    this.includeDeleted = !this.includeDeleted;
    this.currentPage = 1;
    this.loadDonations();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadDonations();
  }

  viewDonation(id: number): void {
    this.router.navigate(['/admin/donations', id]);
  }

  deleteDonation(id: number): void {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.donationService.deleteDonation(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Donation deleted successfully.';
          this.loadDonations();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to delete donation.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred deleting the donation.';
        console.error('Delete donation error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  restoreDonation(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.donationService.restoreDonation(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Donation restored successfully.';
          this.loadDonations();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to restore donation.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred restoring the donation.';
        console.error('Restore donation error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  getSelectedFilterLabel(): string {
    const option = this.filterOptions.find(o => o.value === this.filterType);
    return option ? option.label : 'All Donations';
  }

  getStatusBadgeColor(isDeleted: boolean): string {
    return isDeleted ? 'danger' : 'success';
  }

  getStatusText(isDeleted: boolean): string {
    return isDeleted ? 'Deleted' : 'Active';
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
}
