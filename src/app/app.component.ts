import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { freeSet, brandSet, flagSet } from '@coreui/icons'; // Import all icon sets
import { iconSubset } from './icons/icon-subset';

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  imports: [RouterOutlet],
  providers: [IconSetService] // Add IconSetService as a provider
})
export class AppComponent implements OnInit {
  title = 'Charity';

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);

  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);

  constructor() {
    this.#titleService.setTitle(this.title);

    // Register ALL icon sets globally
    // This makes ALL icons available everywhere in the app
    this.#iconSetService.icons = {
      ...iconSubset,      // Your custom icons
      ...freeSet,         // cil icons (including cilPhone, cilUser, cilLockLocked)
      ...brandSet,        // cib icons (Google, Facebook, Twitter, etc.)
      ...flagSet          // cif icons (Country flags)
    };

    this.#colorModeService.localStorageItemName.set('coreui-free-angular-admin-template-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }

  ngOnInit(): void {
    this.#router.events.pipe(
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }

      // Read the deepest route's data.title
      let route = this.#activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }

      const pageTitle = route.snapshot.data['title'];
      if (pageTitle) {
        this.#titleService.setTitle(`${pageTitle} - ${this.title}`);
      } else {
        this.#titleService.setTitle(this.title);
      }
    });

    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.#colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
