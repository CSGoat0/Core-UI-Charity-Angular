import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  ModalComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  AlertComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DonationService } from '../../../services/donation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-donate-modal',
  templateUrl: './donate-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    ModalComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    AlertComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective
  ]
})
export class DonateModalComponent {
  @Input() visible = false;
  @Input() campaignId: number | null = null;
  @Input() campaignTitle: string = '';
  @Input() organizationId: number | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() donationSuccess = new EventEmitter<void>();

  amount: number = 0;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.amount = 0;
    this.errorMessage = null;
  }

  donate(): void {
    if (!this.campaignId || !this.organizationId || !this.amount || this.amount < 1) {
      this.errorMessage = 'Please enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }

    const user = this.authService.getUser();
    if (!user || !user.id) {
      this.errorMessage = 'You must be logged in to donate.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.donationService.createPayment({
      amount: this.amount,
      campaignId: this.campaignId,
      organizationId: this.organizationId
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          // Redirect to Paymob iFrame
          window.location.href = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to create payment session.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred. Please try again.';
        console.error('Payment error:', error);
        this.cdr.detectChanges();
      }
    });
  }
}
