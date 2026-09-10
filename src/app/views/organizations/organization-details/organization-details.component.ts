import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  AlertComponent,
  BadgeComponent,
  NavComponent,
  NavItemComponent,
  NavLinkDirective,
  ModalComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { OrganizationService } from '../../../services/organization.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { OrganizationDetails, OrganizationSubAdmin, CampaignStatus } from '../../../models/organization.models';
import { User } from '../../../models/user.models';
import { UserDto } from '../../../models/auth.models';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  imports: [
    CommonModule,
    FormsModule,
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
    NavLinkDirective,
    ModalComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    TooltipDirective
  ]
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {
  organization: OrganizationDetails | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  activeTab: string = 'details';

  // Admin Management
  showAdminModal = false;
  showTransferModal = false;
  selectedUser: string = '';
  transferUserId: string = '';
  isAssigningAdmin = false;
  isRemovingAdmin = false;
  isTransferringAdmin = false;
  users: User[] = [];
  isLoadingUsers = false;
  adminUser: User | null = null;

  // Sub-Admin Management
  showSubAdminModal = false;
  selectedSubAdminUser: string = '';
  isAddingSubAdmin = false;
  isRemovingSubAdmin = false;
  subAdmins: OrganizationSubAdmin[] = [];

  private timeoutId: any = null;

  constructor(
    private organizationService: OrganizationService,
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
          this.loadAdminInfo();
          this.loadSubAdmins();
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

  private mapUserDtoToUser(userDto: UserDto): User {
    return {
      id: userDto.id,
      userName: userDto.userName,
      email: userDto.email,
      fullName: userDto.fullName,
      phoneNumber: userDto.phoneNumber || '',
      address: '',
      registrationDate: new Date(),
      updatedOn: null,
      deletedOn: null,
      isDeleted: false,
      emailConfirmed: userDto.emailConfirmed,
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      lockoutEnabled: true,
      lockoutEnd: null,
      accessFailedCount: 0,
      imgPath: null,
      roles: userDto.roles || []
    };
  }

  loadAdminInfo(): void {
    if (!this.organization) return;

    this.organizationService.getOrganizationAdmin(this.organization.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.adminUser = this.mapUserDtoToUser(response.data);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Load admin error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadSubAdmins(): void {
    if (!this.organization) return;

    this.organizationService.getSubAdmins(this.organization.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subAdmins = response.data;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Load sub-admins error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.cdr.detectChanges();

    const params = { pageNumber: 1, pageSize: 100 };

    this.userService.getAllUsers(params).subscribe({
      next: (response) => {
        this.isLoadingUsers = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.users = response.data.items;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingUsers = false;
        this.cdr.detectChanges();
        console.error('Load users error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // Admin Management Methods
  // ==============================

  openAdminModal(): void {
    this.selectedUser = '';
    this.showAdminModal = true;
    this.loadUsers();
    this.cdr.detectChanges();
  }

  assignAdmin(): void {
    if (!this.organization || !this.selectedUser) {
      this.errorMessage = 'Please select a user.';
      this.cdr.detectChanges();
      return;
    }

    this.isAssigningAdmin = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.organizationService.assignOrganizationAdmin(this.organization.id, this.selectedUser).subscribe({
      next: (response) => {
        this.isAssigningAdmin = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Organization admin assigned successfully.';
          this.showAdminModal = false;
          this.loadAdminInfo();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to assign admin.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isAssigningAdmin = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred assigning the admin.';
        console.error('Assign admin error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  removeAdmin(): void {
    if (!this.organization) return;
    if (!confirm('Are you sure you want to remove the organization admin?')) return;

    this.isRemovingAdmin = true;
    this.cdr.detectChanges();

    this.organizationService.removeOrganizationAdmin(this.organization.id).subscribe({
      next: (response) => {
        this.isRemovingAdmin = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Organization admin removed successfully.';
          this.adminUser = null;
          this.loadAdminInfo();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to remove admin.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isRemovingAdmin = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred removing the admin.';
        console.error('Remove admin error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  openTransferModal(): void {
    this.transferUserId = '';
    this.showTransferModal = true;
    this.loadUsers();
    this.cdr.detectChanges();
  }

  transferAdmin(): void {
    if (!this.organization || !this.transferUserId) {
      this.errorMessage = 'Please select a user.';
      this.cdr.detectChanges();
      return;
    }

    this.isTransferringAdmin = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.organizationService.transferOrganizationAdmin(this.organization.id, this.transferUserId).subscribe({
      next: (response) => {
        this.isTransferringAdmin = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Organization admin transferred successfully.';
          this.showTransferModal = false;
          this.loadAdminInfo();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to transfer admin.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isTransferringAdmin = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred transferring the admin.';
        console.error('Transfer admin error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // Sub-Admin Management Methods
  // ==============================

  openSubAdminModal(): void {
    this.selectedSubAdminUser = '';
    this.showSubAdminModal = true;
    this.loadUsers();
    this.cdr.detectChanges();
  }

  addSubAdmin(): void {
    if (!this.organization || !this.selectedSubAdminUser) {
      this.errorMessage = 'Please select a user.';
      this.cdr.detectChanges();
      return;
    }

    this.isAddingSubAdmin = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.organizationService.addSubAdmin(this.organization.id, this.selectedSubAdminUser).subscribe({
      next: (response) => {
        this.isAddingSubAdmin = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Sub-admin added successfully.';
          this.showSubAdminModal = false;
          this.loadSubAdmins();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to add sub-admin.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isAddingSubAdmin = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred adding the sub-admin.';
        console.error('Add sub-admin error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  removeSubAdmin(userId: string): void {
    if (!this.organization) return;
    if (!confirm('Are you sure you want to remove this sub-admin?')) return;

    this.isRemovingSubAdmin = true;
    this.cdr.detectChanges();

    this.organizationService.removeSubAdmin(this.organization.id, userId).subscribe({
      next: (response) => {
        this.isRemovingSubAdmin = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.successMessage = 'Sub-admin removed successfully.';
          this.loadSubAdmins();

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to remove sub-admin.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isRemovingSubAdmin = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred removing the sub-admin.';
        console.error('Remove sub-admin error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // Helper Methods
  // ==============================

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
      'Preparing': 'secondary',
      'Active': 'success',
      'Completed': 'info',
      'Dismissed': 'danger',
      'Postponed': 'warning',
      'Expired': 'dark'
    };
    const statusKey = typeof status === 'string' ? status : CampaignStatus[status];
    return statusMap[statusKey] || 'secondary';
  }

  getCampaignStatusText(status: CampaignStatus | string): string {
    if (typeof status === 'string') {
      return status;
    }
    return CampaignStatus[status] || 'Unknown';
  }

  // ==============================
  // Role Checks & Permissions
  // ==============================

  get canManage(): boolean {
    return this.authService.isSuperAdmin();
  }

  get canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isOrganizationAdmin(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;

    const orgAdminRole = `${this.organization?.name}: Admin`;
    return user.roles.includes(orgAdminRole);
  }

  get canManageAdmins(): boolean {
    return this.isSuperAdmin;
  }

  get canManageSubAdmins(): boolean {
    return this.isSuperAdmin || this.isOrganizationAdmin;
  }

  get canViewAdminInfo(): boolean {
    return this.isSuperAdmin || this.isOrganizationAdmin;
  }

  get isShared(): boolean {
    return false;  // Not used in this component
  }

  get hasOrganizations(): boolean {
    const soloCampaigns = this.organization?.soloCampaigns;
    const sharedCampaigns = this.organization?.sharedCampaigns;

    return (soloCampaigns !== undefined && soloCampaigns !== null && soloCampaigns.length > 0) ||
           (sharedCampaigns !== undefined && sharedCampaigns !== null && sharedCampaigns.length > 0);
  }

  // For template Math access
  get Math() {
    return Math;
  }
}
