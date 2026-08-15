import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./organization-list/organization-list.component').then(m => m.OrganizationListComponent),
    data: {
      title: 'Organizations'
    }
  },
  {
    path: 'create',
    loadComponent: () => import('./organization-form/organization-form.component').then(m => m.OrganizationFormComponent),
    data: {
      title: 'Create Organization'
    }
  },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./organization-details/organization-details.component').then(m => m.OrganizationDetailsComponent),
  //   data: {
  //     title: 'Organization Details'
  //   }
  // },
  {
    path: ':id/edit',
    loadComponent: () => import('./organization-form/organization-form.component').then(m => m.OrganizationFormComponent),
    data: {
      title: 'Edit Organization'
    }
  }
];
