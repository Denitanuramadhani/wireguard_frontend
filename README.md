# WireGuard VPN Portal Frontend

This is the frontend application for WireGuard VPN Portal, built with [Next.js](https://nextjs.org).

## Getting Started

### Development

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Create a `.env.local` file (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update the API URL if needed:

```env
NEXT_PUBLIC_API_URL=https://api.denitanurramadhani.my.id
# or for local development:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

```bash
npm run build
npm start
```

### Docker

Build and run with Docker:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `https://api.denitanurramadhani.my.id`)

## Features

- **Authentication**: Login with username and password
- **Role-based Access**: 
  - Admin: User Management (CRUD operations)
  - User: Devices, Monitoring, Peers (no User Management)
- **User Management** (Admin only):
  - Create users
  - List all users
  - Update user roles
  - Delete users

## API Endpoints

All API calls are made to the backend at `NEXT_PUBLIC_API_URL`:

- `/auth/login` - User login
- `/auth/me` - Get current user info
- `/admin/users` - List all users (Admin only)
- `/admin/add-user` - Create user (Admin only)
- `/admin/users/{username}/role` - Update user role (Admin only)
- `/admin/users/{username}` - Delete user (Admin only)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
