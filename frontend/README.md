# Salon Management System - Frontend

Next.js frontend application for the Salon Management System.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.local.example` to `.env.local` and update if needed:

```bash
cp .env.local.example .env.local
```

Default configuration:
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_SALON_NAME=Your Salon Name`

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
npm start
```

## Features

### Authentication (Phase 3)
- ✅ Login page with form validation
- ✅ JWT token management
- ✅ Protected routes
- ✅ Automatic token refresh
- ✅ Auth context for global state

### Customer Management (Phase 4 - Coming Soon)
- Customer list with search and filters
- Customer detail page with metrics
- Add/edit customer forms
- View customer appointment history
- Track visit frequency and revenue

### Service Management (Phase 5 - Coming Soon)
- Service list
- Add/edit services
- Service pricing and duration
- Service popularity tracking

### Appointments (Phase 6 - Coming Soon)
- Calendar view
- Create/edit appointments
- Multi-service selection
- Email confirmations
- Status tracking

### Invoices (Phase 7 - Coming Soon)
- Invoice list
- Create/edit invoices
- Payment status tracking
- Invoice preview
- Email invoices to customers

### Dashboard (Phase 8 - Coming Soon)
- Key metrics overview
- Revenue charts
- Upcoming appointments
- Recent customers
- Popular services

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/          # Auth pages (login)
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home/dashboard page
│   └── globals.css      # Global styles
├── components/
│   └── ui/              # Reusable UI components
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   └── api/             # API client and functions
├── types/               # TypeScript type definitions
├── .env.local.example   # Environment variables template
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Default Login Credentials

After setting up the backend:
- **Email:** admin@salon.com
- **Password:** admin123

**Important:** Change the default password after first login!

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod
- **Notifications:** React Hot Toast
- **Calendar:** React Big Calendar
- **Charts:** Recharts
- **UI Components:** Headless UI + Heroicons

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Pages

Next.js uses file-based routing. Add new pages in the `app/` directory:

```
app/
├── customers/
│   ├── page.tsx        # /customers
│   └── [id]/
│       └── page.tsx    # /customers/:id
```

### API Integration

Use the API client in `lib/api/client.ts` for all HTTP requests:

```typescript
import apiClient from '@/lib/api/client';

const getCustomers = async () => {
  const response = await apiClient.get('/customers');
  return response.data;
};
```

The client automatically:
- Adds auth token to requests
- Handles 401 errors (redirects to login)
- Provides consistent error handling

## Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured correctly in backend

### Authentication Issues
- Clear browser localStorage if auth state is inconsistent
- Check browser console for errors
- Verify JWT token format in backend

### Build Issues
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure TypeScript types are correct

## License

ISC
