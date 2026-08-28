import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  BadgeComponent,
  NavComponent,
  NavItemComponent,
  NavLinkDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CampaignService } from '../../../services/campaign.service';
import { AuthService } from '../../../services/auth.service';
import { CampaignDetails, CampaignStatus, CampaignType, isSharedCampaign, isSoloCampaign } from '../../../models/campaign.models';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.component.html',
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
export class CampaignDetailsComponent implements OnInit, OnDestroy {
  campaign: CampaignDetails | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  activeTab: string = 'details';

  private timeoutId: any = null;

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCampaign(parseInt(id, 10));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadCampaign(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.campaignService.getCampaignById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.campaign = response.data;
          // For shared campaigns, fetch organizations separately if needed
          if (isSharedCampaign(this.campaign.type)) {
            this.loadSharedCampaignOrganizations(id);
          }
        } else {
          this.errorMessage = response.message || 'Failed to load campaign details.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading campaign details.';
        console.error('Load campaign details error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadSharedCampaignOrganizations(id: number): void {
    this.campaignService.getSharedCampaignById(id).subscribe({
      next: (response) => {
        if (response.success && response.data && this.campaign) {
          this.campaign.organizations = response.data.organizations || [];
          this.campaign.organizationsCount = response.data.organizationsCount || 0;
          this.campaign.creatorOrganizationId = response.data.creatorOrganizationId;
          this.campaign.creatorOrganizationName = response.data.creatorOrganizationName;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Load shared campaign organizations error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/campaigns']);
  }

  editCampaign(): void {
    if (this.campaign) {
      this.router.navigate(['/campaigns', this.campaign.id, 'edit']);
    }
  }

  manageInvites(): void {
    if (this.campaign && isSharedCampaign(this.campaign.type)) {
      this.router.navigate(['/campaigns', this.campaign.id, 'invites']);
    }
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

  getProgressPercentage(): number {
    if (!this.campaign || this.campaign.target === 0) {
      return 0;
    }
    return Math.min((this.campaign.achieved / this.campaign.target) * 100, 100);
  }

  get canManage(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  get canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isShared(): boolean {
    return this.campaign ? isSharedCampaign(this.campaign.type) : false;
  }

  get isSolo(): boolean {
    return this.campaign ? isSoloCampaign(this.campaign.type) : false;
  }

  get hasOrganizations(): boolean {
    return this.campaign?.organizations !== undefined &&
           this.campaign.organizations !== null &&
           this.campaign.organizations.length > 0;
  }
}
