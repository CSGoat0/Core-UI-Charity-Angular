import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  AlertComponent,
  ButtonDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-external-login-callback',
  templateUrl: './external-login-callback.component.html',
  imports: [
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    AlertComponent,
    ButtonDirective,
    IconDirective
  ]
})
export class ExternalLoginCallbackComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Read the token and returnUrl from the query params.
    // The backend redirects to: /#/pages/external-login-callback?token=...&returnUrl=...
    const token = this.route.snapshot.queryParams['token'] as string | undefined;
    const returnUrl = (this.route.snapshot.queryParams['returnUrl'] as string | undefined) || '/dashboard';

    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'Missing authentication token. Please try logging in again.';
      this.cdr.detectChanges();
      return;
    }

    try {
      // Store the token and decode the JWT to reconstruct the user object.
      this.authService.completeExternalLogin(token);

      // Remove the token from the URL so it does not linger in browser history.
      // This runs before navigation, so the sensitive query param is gone by the
      // time we leave the component.
      const urlWithoutToken = window.location.href
        .split('?')[0];
      window.history.replaceState({}, document.title, urlWithoutToken);

      // Kick off a background refresh of the full user object. The decoded JWT
      // already gives us id, email, username and roles, but fullName and other
      // fields come from the API. We do not block navigation on this call.
      this.authService.getCurrentUser().subscribe({
        next: () => { /* sidebar updates reactively via currentUser$ */ },
        error: (err) => { console.warn('Could not refresh user profile after external login:', err); }
      });

      // Navigate to the originally requested page.
      this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      this.isLoading = false;
      this.errorMessage = err?.message || 'An error occurred while completing sign-in. Please try again.';
      this.cdr.detectChanges();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
