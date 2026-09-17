import { INavDataExtended } from './_nav.model';

export const navItems: INavDataExtended[] = [
  // ==============================
  // MAIN NAVIGATION - Visible to all authenticated users
  // ==============================
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Profile',
    url: '/profile',
    iconComponent: { name: 'cil-user' }
  },
  {
    name: 'My Donations',
    url: '/my-donations',
    iconComponent: { name: 'cil-heart' }
  },
  {
    name: 'Organizations',
    url: '/organizations',
    iconComponent: { name: 'cil-building' }
  },
  {
    name: 'Campaigns',
    url: '/campaigns',
    iconComponent: { name: 'cil-bullhorn' }
  },

  // ==============================
  // ADMIN SECTION - SuperAdmin only
  // ==============================
  {
    title: true,
    name: 'Administration',
    roles: ['SuperAdmin']
  },
  {
    name: 'Admin Panel',
    url: '/admin',
    iconComponent: { name: 'cil-settings' },
    roles: ['SuperAdmin'],
    children: [
      {
        name: 'Users',
        url: '/admin/users',
        icon: 'nav-icon-bullet',
        roles: ['SuperAdmin']
      },
      {
        name: 'Donations',
        url: '/admin/donations',
        icon: 'nav-icon-bullet',
        roles: ['SuperAdmin']
      }
    ]
  }
];
