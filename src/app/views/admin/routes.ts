import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadChildren: () => import('./users/routes').then((m) => m.routes),
    data: {
      title: 'Users'
    }
  },
  {
    path: 'donations',
    loadChildren: () => import('./donations/routes').then((m) => m.routes),
    data: {
      title: 'Donations'
    }
  }
];
