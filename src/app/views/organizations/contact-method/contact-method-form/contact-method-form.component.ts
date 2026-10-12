import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  ModalComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
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
import { OrganizationService } from '../../../../services/organization.service';
import { OrgContactMethod, ContactType } from '../../../../models/organization.models';

@Component({
  selector: 'app-contact-method-form',
  templateUrl: './contact-method-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonDirective,
    ModalComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    AlertComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormLabelDirective,
    IconDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ]
})
export class ContactMethodFormComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() organizationId: number | null = null;
  @Input() organizationName: string = '';
  @Input() existingContactMethod: OrgContactMethod | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  contactMethodForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  isEditMode = false;

  typeOptions = [
    { value: ContactType.Phone, label: 'Phone' },
    { value: ContactType.Email, label: 'Email' },
    { value: ContactType.SocialMedia, label: 'Social Media' },
    { value: ContactType.Mobile, label: 'Mobile' },
    { value: ContactType.Fax, label: 'Fax' },
    { value: ContactType.Website, label: 'Website' }
  ];

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {
    this.contactMethodForm = this.fb.group({
      type: [ContactType.Phone, [Validators.required]],
      value: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  // Fires whenever ANY @Input changes, including visible + existingContactMethod
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingContactMethod'] || changes['visible']) {
      this.syncFormWithInputs();
    }
  }

  /**
   * Syncs the form state with the current inputs.
   * Called whenever existingContactMethod or visible changes.
   */
  private syncFormWithInputs(): void {
    if (this.existingContactMethod) {
      this.isEditMode = true;
      this.contactMethodForm.patchValue({
        type: this.existingContactMethod.type,
        value: this.existingContactMethod.value
      });
    } else {
      this.isEditMode = false;
      this.contactMethodForm.reset({ type: ContactType.Phone, value: '' });
    }

    // Clear any lingering error when (re)opening
    this.errorMessage = null;

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    // No timers to clean up in this component, method kept for symmetry with sibling modals
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.errorMessage = null;
    this.contactMethodForm.reset({ type: ContactType.Phone, value: '' });
  }

  onSubmit(): void {
    if (this.contactMethodForm.invalid) {
      Object.keys(this.contactMethodForm.controls).forEach(key => {
        this.contactMethodForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
      return;
    }

    if (!this.organizationId) {
      this.errorMessage = 'Organization ID is required.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const formData = this.contactMethodForm.value;

    if (this.isEditMode && this.existingContactMethod) {
      // Update
      this.organizationService.updateContactMethod(this.existingContactMethod.id, {
        value: formData.value,
        type: formData.type
      }).subscribe({
        next: (response) => this.handleSuccess(response),
        error: (error) => this.handleError(error)
      });
    } else {
      // Create
      this.organizationService.createContactMethod({
        value: formData.value,
        type: formData.type,
        organizationId: this.organizationId
      }).subscribe({
        next: (response) => this.handleSuccess(response),
        error: (error) => this.handleError(error)
      });
    }
  }

  private handleSuccess(response: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();

    if (response.success) {
      this.saved.emit();
      this.close();
    } else {
      this.errorMessage = response.message || 'Failed to save contact method.';
    }
    this.cdr.detectChanges();
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();
    this.errorMessage = error.message || 'An error occurred. Please try again.';
    console.error('Contact method error:', error);
    this.cdr.detectChanges();
  }

  getSelectedTypeLabel(): string {
    const value = this.contactMethodForm.get('type')?.value;
    const option = this.typeOptions.find(o => o.value === value);
    return option ? option.label : 'Select a type';
  }

  selectType(value: ContactType): void {
    this.contactMethodForm.get('type')?.setValue(value);
    this.contactMethodForm.get('type')?.markAsTouched();
    this.cdr.detectChanges();
  }

  get type() { return this.contactMethodForm.get('type'); }
  get value() { return this.contactMethodForm.get('value'); }
}
