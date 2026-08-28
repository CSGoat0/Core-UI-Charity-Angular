import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./campaign-list/campaign-list.component').then(m => m.CampaignListComponent),
    data: {
      title: 'Campaigns'
    }
  },
  {
    path: 'create',
    loadComponent: () => import('./campaign-form/campaign-form.component').then(m => m.CampaignFormComponent),
    data: {
      title: 'Create Campaign'
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./campaign-details/campaign-details.component').then(m => m.CampaignDetailsComponent),
    data: {
      title: 'Campaign Details'
    }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./campaign-form/campaign-form.component').then(m => m.CampaignFormComponent),
    data: {
      title: 'Edit Campaign'
    }
  },
  {
    path: ':id/invites',
    loadComponent: () => import('./campaign-invites/campaign-invites.component').then(m => m.CampaignInvitesComponent),
    data: {
      title: 'Campaign Invites'
    }
  }
];
