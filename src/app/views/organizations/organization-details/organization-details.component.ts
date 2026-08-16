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
import { OrganizationService } from '../../../services/organization.service';
import { AuthService } from '../../../services/auth.service';
import { OrganizationDetails, CampaignStatus } from '../../../models/organization.models';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
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
export class OrganizationDetailsComponent implements OnInit, OnDestroy {
  organization: OrganizationDetails | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  activeTab: string = 'details';

  private timeoutId: any = null;

  constructor(
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
        this.loadOrganization(parseInt(id, 10));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadOrganization(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.organizationService.getOrganizationDetails(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.organization = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load organization details.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading organization details.';
        console.error('Load organization details error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/organizations']);
  }

  editOrganization(): void {
    if (this.organization) {
      this.router.navigate(['/organizations', this.organization.id, 'edit']);
    }
  }

  viewCampaign(id: number): void {
    this.router.navigate(['/campaigns', id]);
  }

  getStatusBadgeColor(isDeleted: boolean): string {
    return isDeleted ? 'danger' : 'success';
  }

  getStatusText(isDeleted: boolean): string {
    return isDeleted ? 'Deleted' : 'Active';
  }

  getCampaignStatusColor(status: CampaignStatus | string): string {
    const statusMap: { [key: string]: string } = {
      'Draft': 'secondary',
      'Active': 'success',
      'Completed': 'info',
      'Cancelled': 'danger'
    };
    // Convert enum to string if needed
    const statusKey = typeof status === 'string' ? status : CampaignStatus[status];
    return statusMap[statusKey] || 'secondary';
  }

  getCampaignStatusText(status: CampaignStatus | string): string {
    if (typeof status === 'string') {
      return status;
    }
    return CampaignStatus[status] || 'Unknown';
  }

  get canManage(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  get canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }
}
