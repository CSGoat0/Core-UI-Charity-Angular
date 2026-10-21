import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';
import { ImagePreviewComponent } from '../../../shared/components/image-preview/image-preview.component';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    DropdownDividerDirective,
    ImagePreviewComponent
  ]
})
export class DefaultHeaderComponent extends HeaderComponent {

  readonly #colorModeService = inject(ColorModeService);
  readonly #authService = inject(AuthService);

  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor() {
    super();
  }

  readonly sidebarId = input('sidebar1');

  // ==============================
  // Auth Methods
  // ==============================

  /**
   * Logout the current user
   */
  logout(): void {
    this.#authService.logout();
  }

  /**
   * Get current user for display
   */
  get currentUser() {
    return this.#authService.getUser();
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.currentUser;
    if (user?.fullName) {
      return user.fullName;
    }
    return user?.userName || 'User';
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    const user = this.currentUser;
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }
    return user?.userName?.substring(0, 2).toUpperCase() || 'U';
  }

  /**
   * Get the current user's profile image URL, or null if not set.
   * Used by the header avatar to display the user's picture when available.
   */
  getUserImgPath(): string | null {
    const user = this.currentUser;
    // UserDto may not declare imgPath in every version of auth.models.ts;
    // casting to access the runtime field safely.
    return (user as any)?.imgPath || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.#authService.isAuthenticated();
  }
}
