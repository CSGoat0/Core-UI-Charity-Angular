import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DonationService } from '../../../../services/donation.service';
import { AuthService } from '../../../../services/auth.service';
import { Donation } from '../../../../models/donation.models';

@Component({
  selector: 'app-donation-details',
  templateUrl: './donation-details.component.html',
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
    IconDirective
  ]
})
export class DonationDetailsComponent implements OnInit, OnDestroy {
  donation: Donation | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private timeoutId: any = null;

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadDonation(parseInt(id, 10));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  loadDonation(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.donationService.getDonationWithDetails(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success && response.data) {
          this.donation = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load donation details.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred loading donation details.';
        console.error('Load donation details error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/donations']);
  }

  viewCampaign(): void {
    if (this.donation) {
      this.router.navigate(['/campaigns', this.donation.campaignId]);
    }
  }

  deleteDonation(): void {
    if (!this.donation) return;
    if (!confirm('Are you sure you want to delete this donation?')) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.donationService.deleteDonation(this.donation.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.router.navigate(['/admin/donations']);
        } else {
          this.errorMessage = response.message || 'Failed to delete donation.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred.';
        this.cdr.detectChanges();
      }
    });
  }

  restoreDonation(): void {
    if (!this.donation) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.donationService.restoreDonation(this.donation.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.success) {
          this.loadDonation(this.donation!.id);
          this.successMessage = 'Donation restored successfully.';

          this.timeoutId = setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to restore donation.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = error.message || 'An error occurred.';
        this.cdr.detectChanges();
      }
    });
  }

  getStatusBadgeColor(isDeleted: boolean): string {
    return isDeleted ? 'danger' : 'success';
  }

  getStatusText(isDeleted: boolean): string {
    return isDeleted ? 'Deleted' : 'Active';
  }

  get canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }
}
