import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.component.html',
  imports: [
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    IconDirective
  ]
})
export class PaymentCallbackComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage: string | null = null;
  transactionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Paymob sends query params like: ?success=true&order=123&...
    this.route.queryParams.subscribe(params => {
      const success = params['success'] === 'true' || params['success'] === true;
      const pending = params['pending'] === 'true';
      const errorOccurred = params['error_occured'] === 'true' || params['errorOccurred'] === 'true';

      this.transactionId = params['id'] || params['transaction_id'] || null;

      if (success && !errorOccurred) {
        this.isSuccess = true;
      } else if (pending) {
        this.errorMessage = 'Your payment is still being processed. You will be notified once it completes.';
      } else {
        this.errorMessage = 'Your payment was not successful. Please try again.';
      }

      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  goToCampaigns(): void {
    this.router.navigate(['/campaigns']);
  }

  goToMyDonations(): void {
    this.router.navigate(['/my-donations']);
  }
}
