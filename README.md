# TheCharity — Angular Frontend

A modern charity donation platform frontend built with Angular 20 and the CoreUI
Angular admin template.

This is the frontend for a full-stack donation platform where organizations can
publish campaigns, admins can manage them, and users can donate securely through
Paymob (an Egyptian payment gateway).

## Live Demo

- Frontend: https://core-ui-charity-angular.pages.dev

## Tech Stack

- Angular 20 (standalone components)
- CoreUI Angular (free admin template)
- Chart.js + ng2-charts
- TypeScript
- RxJS
- SCSS

## Features

- Authentication (login, register, email confirmation, forgot/reset password, JWT)
- Google and Facebook login
- User profile management
- Role-based navigation (SuperAdmin, Organization Admin, Sub-Admin, User)
- Organizations management (CRUD, admin and sub-admin assignment)
- Campaigns management (solo and shared campaigns, invitations)
- Payment info per organization (Paymob credentials)
- Donation flow via Paymob iFrame
- Personal donations history
- Admin donation management with filters
- Dashboard with live statistics and charts

## Project Structure

```
src/
├── app/
│   ├── guards/                 # Route guards (auth, role)
│   ├── interceptors/           # HTTP interceptors (auth token)
│   ├── layout/                 # CoreUI default layout (sidebar, header, footer)
│   ├── models/                 # TypeScript interfaces and DTOs
│   ├── services/               # API services (auth, organization, campaign, donation, etc.)
│   └── views/                  # Feature pages
│       ├── admin/              # Admin panel (users, donations)
│       ├── campaigns/          # Campaign list, form, details, invites
│       ├── dashboard/          # Dashboard with charts
│       ├── donations/          # Donate modal
│       ├── my-donations/       # Personal donation history
│       ├── organizations/      # Organization list, form, details, payment info
│       ├── pages/              # Auth pages and errors (login, register, 404, etc.)
│       └── profile/            # User profile
├── environments/               # Environment configuration
└── scss/                       # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI 20+

### Install dependencies

```bash
npm install
```

### Environment setup

```bash
cp src/environments/environment.template.ts src/environments/environment.ts
```

Then edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-backend-url/api',
  frontendUrl: 'http://localhost:4200',
  auth: {
    tokenKey: 'auth_token',
    userKey: 'user_data',
    externalCookieKey: 'ExternalCookie'
  }
};
```

### Run the development server

```bash
npm start
```

Navigate to `http://localhost:4200`.

The build artifacts are stored in `dist/`.

## Deployment

The frontend is deployed to Cloudflare Pages. The build configuration uses
`withHashLocation()`, so routes are accessed via `/#/route`.

To deploy:

1. Push to your Git repository.
2. Cloudflare Pages builds automatically on push.
3. Set the environment variables in the Cloudflare Pages dashboard.

## Related Repositories

- Backend (ASP.NET Core Web API): https://github.com/CSGoat0/TheCharity
