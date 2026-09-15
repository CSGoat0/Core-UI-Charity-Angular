import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./donation-list/donation-list.component').then(m => m.DonationListComponent),
    data: {
      title: 'Donations'
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./donation-details/donation-details.component').then(m => m.DonationDetailsComponent),
    data: {
      title: 'Donation Details'
    }
  }
];
