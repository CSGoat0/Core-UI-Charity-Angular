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
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormLabelDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { OrganizationService } from '../../../services/organization.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
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
    FormLabelDirective
  ]
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  organizationForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditMode = false;
  organizationId: number | null = null;
  pageTitle = 'Create Organization';

  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      address: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.organizationId = parseInt(id, 10);
        this.pageTitle = 'Edit Organization';
        this.loadOrganization(this.organizationId);
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

    this.organizationService.getOrganizationById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.organizationForm.patchValue({
            name: response.data.name,
            address: response.data.address || ''
          });
        } else {
          this.errorMessage = response.message || 'Failed to load organization.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading the organization.';
        console.error('Load organization error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.organizationForm.invalid) {
      Object.keys(this.organizationForm.controls).forEach(key => {
        this.organizationForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();

    const formData = this.organizationForm.value;

    if (this.isEditMode && this.organizationId) {
      this.organizationService.updateOrganization(this.organizationId, formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success) {
            this.successMessage = 'Organization updated successfully!';
            this.timeoutId = setTimeout(() => {
              this.router.navigate(['/organizations']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to update organization.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred updating the organization.';
          console.error('Update organization error:', error);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.organizationService.createOrganization(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          if (response.success) {
            this.successMessage = 'Organization created successfully!';
            this.timeoutId = setTimeout(() => {
              this.router.navigate(['/organizations']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to create organization.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = error.message || 'An error occurred creating the organization.';
          console.error('Create organization error:', error);
          this.cdr.detectChanges();
        }
      });
    }
  }

  get name() { return this.organizationForm.get('name'); }
  get address() { return this.organizationForm.get('address'); }

  get canManage(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }
}
