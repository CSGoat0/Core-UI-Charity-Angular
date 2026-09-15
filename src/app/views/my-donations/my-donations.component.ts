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
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Donation, PaginatedResponse, PaginationParameters } from '../../models/donation.models';

@Component({
  selector: 'app-my-donations',
  templateUrl: './my-donations.component.html',
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
    TooltipDirective
  ]
})
export class MyDonationsComponent implements OnInit, OnDestroy {
  Math = Math;

  donations: Donation[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Pagination
  pagination: PaginatedResponse<Donation> | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

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
    const user = this.authService.getUser();
    if (!user || !user.id) {
      this.errorMessage = 'You must be logged in.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const params: PaginationParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.donationService.getUserDonationHistory(params, user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.donations = response.data.items;
          this.pagination = response.data;
          this.totalPages = response.data.totalPages;
        } else {
          this.errorMessage = response.message || 'Failed to load donations.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred.';
        console.error('Load donations error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadStatistics(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) return;

    this.donationService.getTotalAmountByUser(user.id).subscribe({
      next: (response) => {
        if (response.success && response.data !== undefined) {
          this.totalAmount = response.data;
          this.cdr.detectChanges();
        }
      }
    });

    this.donationService.getDonationCountByUser(user.id).subscribe({
      next: (response) => {
        if (response.success && response.data !== undefined) {
          this.totalCount = response.data;
          this.cdr.detectChanges();
        }
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadDonations();
  }

  viewCampaign(campaignId: number): void {
    this.router.navigate(['/campaigns', campaignId]);
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
