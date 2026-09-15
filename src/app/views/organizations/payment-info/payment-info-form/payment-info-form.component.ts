import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  FormLabelDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DonationService } from '../../../../services/donation.service';
import { PaymentInfo } from '../../../../models/donation.models';

@Component({
  selector: 'app-payment-info-form',
  templateUrl: './payment-info-form.component.html',
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
    IconDirective
  ]
})
export class PaymentInfoFormComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() organizationId: number | null = null;
  @Input() organizationName: string = '';
  @Input() existingPaymentInfo: PaymentInfo | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  paymentInfoForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  isEditMode = false;

  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private cdr: ChangeDetectorRef
  ) {
    this.paymentInfoForm = this.fb.group({
      apiKey: ['', [Validators.required, Validators.maxLength(300)]],
      integrationId: ['', [Validators.required, Validators.maxLength(300)]],
      iframeId: ['', [Validators.required, Validators.maxLength(300)]],
      hmacKey: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    if (this.existingPaymentInfo) {
      this.isEditMode = true;
      this.paymentInfoForm.patchValue({
        apiKey: this.existingPaymentInfo.apiKey,
        integrationId: this.existingPaymentInfo.integrationId,
        iframeId: this.existingPaymentInfo.iframeId,
        hmacKey: this.existingPaymentInfo.hmacKey
      });
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.errorMessage = null;
    this.paymentInfoForm.reset();
  }

  onSubmit(): void {
    if (this.paymentInfoForm.invalid) {
      Object.keys(this.paymentInfoForm.controls).forEach(key => {
        this.paymentInfoForm.get(key)?.markAsTouched();
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

    const formData = this.paymentInfoForm.value;

    if (this.isEditMode && this.existingPaymentInfo) {
      // Update
      this.donationService.updatePaymentInfo(this.existingPaymentInfo.id, {
        ...formData,
        organizationId: this.organizationId
      }).subscribe({
        next: (response) => this.handleSuccess(response),
        error: (error) => this.handleError(error)
      });
    } else {
      // Create
      this.donationService.createPaymentInfo({
        ...formData,
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
      this.errorMessage = response.message || 'Failed to save payment info.';
    }
    this.cdr.detectChanges();
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.cdr.detectChanges();
    this.errorMessage = error.message || 'An error occurred. Please try again.';
    console.error('Payment info error:', error);
    this.cdr.detectChanges();
  }

  get apiKey() { return this.paymentInfoForm.get('apiKey'); }
  get integrationId() { return this.paymentInfoForm.get('integrationId'); }
  get iframeId() { return this.paymentInfoForm.get('iframeId'); }
  get hmacKey() { return this.paymentInfoForm.get('hmacKey'); }
}
