# L.E.A.P - Local Education and Assistance Platform

A comprehensive health monitoring and case management system built with React, Ionic, and Supabase.

## Overview

L.E.A.P is a professional-grade application designed to facilitate health monitoring, case management, and educational resources for communities. The platform supports multiple user roles including administrators, health workers, social workers, and end users.

## Features

- **User Authentication**: Secure login with email/password and OAuth (Google)
- **Role-Based Access Control**: Separate interfaces for administrators and users
- **Health Monitoring**: Track prenatal, postnatal, and child health records
- **Case Management**: Comprehensive case tracking and management system
- **Profile Management**: User profile creation and management
- **Early Warning Dashboard**: Real-time health monitoring and alerts
- **Reports Generation**: Export data to PDF and Excel formats
- **Location-Based Filtering**: Philippine regional, provincial, municipal, and barangay filtering

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Mobile Framework**: Ionic 8
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Routing**: React Router 5
- **Charts**: Chart.js with React wrapper
- **Testing**: Vitest (unit), Cypress (e2e)
- **Build Tool**: Vite
- **Code Quality**: ESLint, TypeScript strict mode

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/aktziku/L.E.A.P.git
cd L.E.A.P
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

Run unit tests:
```bash
npm run test.unit
```

Run end-to-end tests:
```bash
npm run test.e2e
```

## Code Quality

Run ESLint:
```bash
npm run lint
```

## Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── view/           # View-only modal components
│   └── ...             # Form modals and dashboards
├── pages/              # Route pages
│   ├── admin/          # Admin dashboard and tabs
│   ├── users/          # User-facing pages
│   └── ...             # Authentication pages
├── services/           # Business logic and API calls
├── utils/              # Utility functions and helpers
└── theme/              # CSS variables and theming

```

## User Roles

- **Admin**: Full system access and user management
- **Health Worker**: Health record management
- **Social Worker**: Case management
- **School**: Educational resource management
- **User**: Personal profile and health record access

## Security

- Environment variables for sensitive data
- Supabase Row Level Security (RLS)
- Privacy agreement enforcement
- Secure authentication with OAuth support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the GitHub repository.
