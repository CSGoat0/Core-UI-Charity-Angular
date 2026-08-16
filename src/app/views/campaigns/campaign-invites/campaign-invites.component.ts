import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CampaignService } from '../../../services/campaign.service';
import { OrganizationService } from '../../../services/organization.service';
import { AuthService } from '../../../services/auth.service';
import { InviteResponse, InviteStatus, PaginatedResponse, PaginationParameters } from '../../../models/campaign.models';
import { OrganizationDropDown } from '../../../models/organization.models';

@Component({
  selector: 'app-campaign-invites',
  templateUrl: './campaign-invites.component.html',
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
    TooltipDirective
  ]
})
export class CampaignInvitesComponent implements OnInit, OnDestroy {
  Math = Math;

  invites: InviteResponse[] = [];
  organizations: OrganizationDropDown[] = [];
  isLoading = false;
  isLoadingOrganizations = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  campaignId: number | null = null;
  campaignTitle: string = '';

  // Pagination
  pagination: PaginatedResponse<InviteResponse> | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // New invite
  selectedOrganizationId: number | null = null;
  expiresInDays: number = 7;
  isSendingInvite = false;

  private timeoutId: any = null;

  constructor(
    private campaignService: CampaignService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.campaignId = parseInt(id, 10);
        this.loadInvites();
        this.loadOrganizations();
        this.loadCampaignInfo();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadCampaignInfo(): void {
    if (!this.campaignId) return;

    this.campaignService.getCampaignById(this.campaignId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.campaignTitle = response.data.title;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Load campaign info error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadOrganizations(): void {
    this.isLoadingOrganizations = true;
    const params = { pageNumber: 1, pageSize: 100 };

    this.organizationService.getOrganizationsDropdown(params).subscribe({
      next: (response) => {
        this.isLoadingOrganizations = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.organizations = response.data.items;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingOrganizations = false;
        this.cdr.detectChanges();
        console.error('Load organizations error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadInvites(): void {
    if (!this.campaignId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const params: PaginationParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.campaignService.getInvitesForCampaign(params, this.campaignId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.invites = response.data.items;
          this.pagination = response.data;
          this.totalPages = response.data.totalPages;
        } else {
          this.errorMessage = response.message || 'Failed to load invites.';
          this.invites = [];
          this.pagination = null;
          this.totalPages = 0;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading invites.';
        console.error('Load invites error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  sendInvite(): void {
    if (!this.campaignId || !this.selectedOrganizationId) {
      this.errorMessage = 'Please select an organization to invite.';
      this.cdr.detectChanges();
      return;
    }

    this.isSendingInvite = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();

    this.campaignService.sendInvite(this.campaignId, {
      organizationId: this.selectedOrganizationId,
      expiresInDays: this.expiresInDays
    }).subscribe({
      next: (response) => {
        this.isSendingInvite = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Invite sent successfully!';
          this.selectedOrganizationId = null;
          this.loadInvites();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to send invite.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSendingInvite = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred sending the invite.';
        console.error('Send invite error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  cancelInvite(inviteId: number): void {
    // Note: There's no cancel endpoint in the API, but we can reject it
    // This is a workaround - you might want to add a cancel endpoint
    if (!confirm('Are you sure you want to cancel this invite?')) {
      return;
    }

    this.campaignService.rejectInvite(inviteId).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Invite cancelled successfully.';
          this.loadInvites();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to cancel invite.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.message || 'An error occurred cancelling the invite.';
        console.error('Cancel invite error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadInvites();
  }

  getStatusBadgeColor(status: InviteStatus): string {
    const statusMap: { [key: number]: string } = {
      [InviteStatus.Pending]: 'warning',
      [InviteStatus.Accepted]: 'success',
      [InviteStatus.Rejected]: 'danger',
      [InviteStatus.Expired]: 'secondary'
    };
    return statusMap[status] || 'secondary';
  }

  getStatusText(status: InviteStatus): string {
    return InviteStatus[status] || 'Unknown';
  }

  isPending(status: InviteStatus): boolean {
    return status === InviteStatus.Pending;
  }

  goBack(): void {
    this.router.navigate(['/campaigns', this.campaignId]);
  }

  get canManage(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
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
