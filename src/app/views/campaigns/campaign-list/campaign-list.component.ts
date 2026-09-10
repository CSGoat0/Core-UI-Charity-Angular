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
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CampaignService } from '../../../services/campaign.service';
import { AuthService } from '../../../services/auth.service';
import { CampaignResponse, CampaignStatus, PaginatedResponse, PaginationParameters } from '../../../models/campaign.models';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
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
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ]
})
export class CampaignListComponent implements OnInit, OnDestroy {
  Math = Math;

  campaigns: CampaignResponse[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Pagination
  pagination: PaginatedResponse<CampaignResponse> | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  searchTerm: string = '';
  includeDeleted = false;
  filterStatus: string = '';
  filterType: string = '';

  // Status and Type options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: '0', label: 'Preparing' },
    { value: '1', label: 'Active' },
    { value: '2', label: 'Completed' },
    { value: '3', label: 'Dismissed' },
    { value: '4', label: 'Postponed' },
    { value: '5', label: 'Expired' }
  ];

  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Solo', label: 'Solo' },
    { value: 'Shared', label: 'Shared' }
  ];

  private timeoutId: any = null;

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadCampaigns(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const params: PaginationParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined
    };

    // Use different endpoints based on filters
    if (this.filterStatus) {
      this.campaignService.getCampaignsByStatus(params, parseInt(this.filterStatus, 10) as CampaignStatus).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else if (this.filterType) {
      this.campaignService.getCampaignsByType(params, this.filterType).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else if (this.searchTerm && this.searchTerm.trim().length > 0) {
      this.campaignService.searchCampaigns(params, this.searchTerm.trim()).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    } else {
      this.campaignService.getAllCampaigns(params, this.includeDeleted).subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error)
      });
    }
  }

  private handleResponse(response: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();

    if (response.success && response.data) {
      this.campaigns = response.data.items;
      this.pagination = response.data;
      this.totalPages = response.data.totalPages;
    } else {
      this.errorMessage = response.message || 'Failed to load campaigns.';
      this.campaigns = [];
      this.pagination = null;
      this.totalPages = 0;
    }
    this.cdr.detectChanges();
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();
    this.errorMessage = error.message || 'An error occurred loading campaigns.';
    console.error('Load campaigns error:', error);
    this.cdr.detectChanges();
  }

  searchCampaigns(): void {
    this.currentPage = 1;
    this.loadCampaigns();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterType = '';
    this.currentPage = 1;
    this.loadCampaigns();
  }

  toggleDeleted(): void {
    this.includeDeleted = !this.includeDeleted;
    this.currentPage = 1;
    this.loadCampaigns();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadCampaigns();
  }

  deleteCampaign(id: number): void {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.campaignService.deleteCampaign(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Campaign deleted successfully.';
          this.loadCampaigns();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to delete campaign.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred deleting the campaign.';
        console.error('Delete campaign error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  restoreCampaign(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.campaignService.restoreCampaign(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Campaign restored successfully.';
          this.loadCampaigns();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to restore campaign.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred restoring the campaign.';
        console.error('Restore campaign error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  viewCampaign(id: number): void {
    this.router.navigate(['/campaigns', id]);
  }

  editCampaign(id: number): void {
    this.router.navigate(['/campaigns', id, 'edit']);
  }

  manageInvites(campaignId: number): void {
    this.router.navigate(['/campaigns', campaignId, 'invites']);
  }

  getStatusBadgeColor(status: CampaignStatus): string {
    const statusMap: { [key: number]: string } = {
      [CampaignStatus.Preparing]: 'secondary',
      [CampaignStatus.Active]: 'success',
      [CampaignStatus.Completed]: 'info',
      [CampaignStatus.Dismissed]: 'danger',
      [CampaignStatus.Postponed]: 'warning',
      [CampaignStatus.Expired]: 'dark'
    };
    return statusMap[status] || 'secondary';
  }

  getStatusText(status: CampaignStatus): string {
    return CampaignStatus[status] || 'Unknown';
  }

  getTypeText(type: string): string {
    return type || 'Unknown';
  }

  getSelectedStatusLabel(): string {
    const option = this.statusOptions.find(o => o.value === this.filterStatus);
    return option ? option.label : 'All Statuses';
  }

  getSelectedTypeLabel(): string {
    const option = this.typeOptions.find(o => o.value === this.filterType);
    return option ? option.label : 'All Types';
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

  isSharedCampaign(type: string): boolean {
    return type?.toLowerCase() === 'shared';
  }
}
