import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
    data: {
      title: 'Users'
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./user-details/user-details.component').then(m => m.UserDetailsComponent),
    data: {
      title: 'User Details'
    }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
    data: {
      title: 'Edit User'
    }
  },
  {
    path: 'create',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
    data: {
      title: 'Create User'
    }
  }
];
