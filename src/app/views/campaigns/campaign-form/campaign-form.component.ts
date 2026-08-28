import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormLabelDirective,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CampaignService } from '../../../services/campaign.service';
import { OrganizationService } from '../../../services/organization.service';
import { AuthService } from '../../../services/auth.service';
import { isSharedCampaign, isSoloCampaign } from '../../../models/campaign.models';
import { OrganizationDropDown } from '../../../models/organization.models';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    AlertComponent,
    IconDirective,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormLabelDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ]
})
export class CampaignFormComponent implements OnInit, OnDestroy {
  campaignForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditMode = false;
  campaignId: number | null = null;
  pageTitle = 'Create Campaign';
  isShared = false;

  organizations: OrganizationDropDown[] = [];
  isLoadingOrganizations = false;

  typeOptions = [
    { value: 'Solo', label: 'Solo' },
    { value: 'Shared', label: 'Shared' }
  ];

  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.campaignForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      target: [0, [Validators.required, Validators.min(1)]],
      type: ['Solo', [Validators.required]],
      organizationId: ['', [Validators.required]],
      deadline: ['', [Validators.required]],
      organizationIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.campaignId = parseInt(id, 10);
        this.pageTitle = 'Edit Campaign';
        this.loadCampaign(this.campaignId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
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

  loadCampaign(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.campaignService.getCampaignById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          const data = response.data;
          this.isShared = isSharedCampaign(data.type);

          this.campaignForm.patchValue({
            title: data.title,
            description: data.description || '',
            target: data.target,
            type: data.type,
            organizationId: data.organizationId,
            deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
            organizationIds: []
          });
        } else {
          this.errorMessage = response.message || 'Failed to load campaign.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading the campaign.';
        console.error('Load campaign error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onTypeChange(type: string): void {
    this.isShared = isSharedCampaign(type);
    if (this.isShared) {
      this.campaignForm.get('organizationId')?.clearValidators();
      this.campaignForm.get('organizationId')?.updateValueAndValidity();
      this.campaignForm.get('organizationIds')?.setValidators([Validators.required]);
      this.campaignForm.get('organizationIds')?.updateValueAndValidity();
    } else {
      this.campaignForm.get('organizationIds')?.clearValidators();
      this.campaignForm.get('organizationIds')?.updateValueAndValidity();
      this.campaignForm.get('organizationId')?.setValidators([Validators.required]);
      this.campaignForm.get('organizationId')?.updateValueAndValidity();
    }
    this.cdr.detectChanges();
  }

  toggleOrganizationSelection(orgId: number): void {
    const currentIds = this.campaignForm.get('organizationIds')?.value || [];
    const index = currentIds.indexOf(orgId);
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(orgId);
    }
    this.campaignForm.get('organizationIds')?.setValue([...currentIds]);
    this.campaignForm.get('organizationIds')?.markAsTouched();
    this.cdr.detectChanges();
  }

  isOrganizationSelected(orgId: number): boolean {
    const currentIds = this.campaignForm.get('organizationIds')?.value || [];
    return currentIds.includes(orgId);
  }

  getSelectedTypeLabel(): string {
    const value = this.campaignForm.get('type')?.value;
    const option = this.typeOptions.find(o => o.value === value);
    return option ? option.label : 'Select campaign type';
  }

  getSelectedOrganizationLabel(): string {
    const value = this.campaignForm.get('organizationId')?.value;
    if (!value) return 'Select an organization';
    const org = this.organizations.find(o => o.id === value);
    return org ? org.name : 'Select an organization';
  }

  getSelectedCreatorOrganizationLabel(): string {
    const value = this.campaignForm.get('organizationId')?.value;
    if (!value) return 'Select creator organization';
    const org = this.organizations.find(o => o.id === value);
    return org ? org.name : 'Select creator organization';
  }

  getSelectedOrganizationIdsLabel(): string {
    const currentIds = this.campaignForm.get('organizationIds')?.value || [];
    if (currentIds.length === 0) return 'Select organizations';
    if (currentIds.length === 1) {
      const org = this.organizations.find(o => o.id === currentIds[0]);
      return org ? org.name : '1 organization selected';
    }
    return `${currentIds.length} organizations selected`;
  }

  onSubmit(): void {
    if (this.campaignForm.invalid) {
      Object.keys(this.campaignForm.controls).forEach(key => {
        this.campaignForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();

    const formData = this.campaignForm.value;
    const type = formData.type;

    if (this.isEditMode && this.campaignId) {
      if (isSoloCampaign(type)) {
        const updateData = {
          id: this.campaignId,
          title: formData.title,
          description: formData.description,
          target: formData.target,
          type: formData.type,
          organizationId: formData.organizationId
        };
        this.campaignService.updateSoloCampaign(this.campaignId, updateData).subscribe({
          next: (response) => this.handleSuccess(response),
          error: (error) => this.handleError(error)
        });
      } else {
        this.errorMessage = 'Updating shared campaigns is not yet implemented.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      if (isSoloCampaign(type)) {
        const createData = {
          title: formData.title,
          description: formData.description,
          target: formData.target,
          type: formData.type,
          startDate: new Date(),
          deadline: new Date(formData.deadline),
          organizationId: parseInt(formData.organizationId, 10)
        };
        this.campaignService.createSoloCampaign(createData).subscribe({
          next: (response) => this.handleSuccess(response),
          error: (error) => this.handleError(error)
        });
      } else {
        const createData = {
          title: formData.title,
          description: formData.description,
          target: formData.target,
          type: formData.type,
          startDate: new Date(),
          deadline: new Date(formData.deadline),
          organizationIds: formData.organizationIds || [],
          creatorOrganizationId: parseInt(formData.organizationId, 10)
        };
        this.campaignService.createSharedCampaign(createData).subscribe({
          next: (response) => this.handleSuccess(response),
          error: (error) => this.handleError(error)
        });
      }
    }
  }

  private handleSuccess(response: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();

    if (response.success) {
      this.successMessage = this.isEditMode ? 'Campaign updated successfully!' : 'Campaign created successfully!';
      this.timeoutId = setTimeout(() => {
        this.router.navigate(['/campaigns']);
      }, 2000);
    } else {
      this.errorMessage = response.message || (this.isEditMode ? 'Failed to update campaign.' : 'Failed to create campaign.');
    }
    this.cdr.detectChanges();
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();
    this.errorMessage = error.message || 'An error occurred. Please try again.';
    console.error('Campaign form error:', error);
    this.cdr.detectChanges();
  }

  get title() { return this.campaignForm.get('title'); }
  get description() { return this.campaignForm.get('description'); }
  get target() { return this.campaignForm.get('target'); }
  get type() { return this.campaignForm.get('type'); }
  get organizationId() { return this.campaignForm.get('organizationId'); }
  get deadline() { return this.campaignForm.get('deadline'); }
  get organizationIds() { return this.campaignForm.get('organizationIds'); }

  get canManage(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }
}
