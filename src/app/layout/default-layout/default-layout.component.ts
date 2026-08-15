import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';
import { INavDataExtended } from './_nav.model';
import { AuthService } from '../../services/auth.service';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    IconDirective,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective
  ]
})
export class DefaultLayoutComponent implements OnInit {
  private authService = inject(AuthService);

  public navItems: INavDataExtended[] = [];

  ngOnInit(): void {
    this.filterNavItems();

    // Subscribe to user changes to re-filter when user data updates
    this.authService.currentUser$.subscribe(() => {
      this.filterNavItems();
    });
  }

  filterNavItems(): void {
    const user = this.authService.getUser();
    const userRoles = user?.roles || [];

    this.navItems = this.filterNavItemsRecursive(navItems, userRoles);
  }

  private filterNavItemsRecursive(items: INavDataExtended[], userRoles: string[]): INavDataExtended[] {
    return items
      .filter(item => {
        // If no roles specified, show to everyone
        if (!item.roles) return true;
        // If roles specified, check if user has any of them
        return item.roles.some(role => userRoles.includes(role));
      })
      .map(item => {
        // If item has children, filter them recursively
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: this.filterNavItemsRecursive(item.children, userRoles)
          };
        }
        return item;
      });
  }
}
