# Salon Management System

A comprehensive web-based management system for salons, featuring customer management, appointment scheduling, invoicing, and analytics dashboard with automated email notifications.

## Project Status

### ✅ Completed (Phases 1-3)

- **Backend Foundation** - Express.js API with PostgreSQL database
- **Authentication System** - JWT-based admin authentication with secure login
- **Frontend Foundation** - Next.js application with TypeScript and Tailwind CSS

### 🚧 In Progress (Phases 4-9)

- Customer Management (backend + frontend)
- Service Management (backend + frontend)
- Appointment Scheduling with Email Service
- Invoice Management
- Analytics Dashboard
- UI Polish and Testing

## Features Overview

### Current Features
- ✅ Secure admin authentication
- ✅ JWT token management
- ✅ Protected API endpoints
- ✅ Responsive login interface
- ✅ Database schema for all features
- ✅ PostgreSQL migrations and seeds

### Planned Features
- 📋 Customer Management - Register customers, track visit frequency, revenue, and service preferences
- 📅 Appointment Scheduling - Calendar-based scheduling with email confirmations
- 💰 Invoice Management - Create invoices with payment tracking
- 📊 Analytics Dashboard - Key metrics, revenue charts, and insights
- 📧 Email Service - Automated appointment confirmations and reminders
- 🎯 Service Management - CRUD operations for salon services

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer
- **Security:** Helmet, CORS

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

## Project Structure

```
SalonX/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   ├── templates/    # Email templates
│   │   └── database/     # Migrations and seeds
│   ├── .env              # Environment variables
│   ├── package.json
│   └── server.js         # Entry point
│
└── frontend/             # Next.js React application
    ├── app/              # Next.js App Router pages
    ├── components/       # React components
    ├── contexts/         # React contexts
    ├── lib/              # Libraries and utilities
    ├── types/            # TypeScript types
    ├── .env.local        # Frontend environment variables
    ├── package.json
    └── next.config.js
```

## Quick Start Guide

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb salon_management
```

Or using psql:

```sql
CREATE DATABASE salon_management;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Run migrations and seed data
npm run migrate

# Start backend server
npm run dev
```

The backend will start on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local if needed (API URL is already set)

# Start frontend development server
npm run dev
```

The frontend will start on **http://localhost:3000**

### 4. Access the Application

1. Open your browser to **http://localhost:3000**
2. You'll be redirected to the login page
3. Use the default credentials:
   - **Email:** admin@salon.com
   - **Password:** admin123

**Important:** Change the default password after first login!

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRES_IN=1h

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_NAME=Your Salon Name
SMTP_FROM_EMAIL=noreply@yoursalon.com

# Salon Info
SALON_NAME=Your Salon Name
SALON_ADDRESS=123 Main St, City, State
SALON_PHONE=(555) 123-4567

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SALON_NAME=Your Salon Name
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Future Endpoints (Coming Soon)
- Customer Management - `/api/customers/*`
- Service Management - `/api/services/*`
- Appointments - `/api/appointments/*`
- Invoices - `/api/invoices/*`
- Dashboard - `/api/dashboard/*`

## Database Schema

### Tables Created
1. **users** - Admin user accounts
2. **customers** - Customer records
3. **services** - Salon services with pricing
4. **appointments** - Appointment bookings
5. **appointment_services** - Junction table (many-to-many)
6. **invoices** - Customer invoices
7. **invoice_line_items** - Invoice line items
8. **email_logs** - Email audit trail

All tables include proper indexes, foreign keys, and constraints for data integrity.

## Development

### Backend Development

```bash
cd backend
npm run dev    # Start with nodemon (auto-restart)
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start Next.js dev server
```

### Testing the API

Use Postman, Thunder Client, or curl to test API endpoints:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@salon.com","password":"admin123"}'

# Get current user (requires token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Gmail SMTP Setup (for Email Features)

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail" / "Other"
3. Use the generated password in `SMTP_PASSWORD` (not your regular password)
4. Update `SMTP_USER` with your Gmail address

## Security Notes

- **JWT Secrets:** Use strong, random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`
- **Database Password:** Use a strong password for the PostgreSQL database user
- **SMTP Password:** Use app-specific passwords, never store regular passwords
- **Default Admin:** Change the default admin password immediately after first login
- **Environment Files:** Never commit `.env` or `.env.local` files to version control

## Troubleshooting

### Backend Issues

**Database connection fails:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `psql -l | grep salon_management`

**Migration fails:**
- Drop and recreate database if needed
- Ensure you're in the backend directory
- Check migration files for syntax errors

### Frontend Issues

**API connection fails:**
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured in backend

**Login not working:**
- Clear browser localStorage
- Check browser console for errors
- Verify backend is returning tokens correctly

**Build fails:**
- Delete `.next` and `node_modules`, reinstall
- Check TypeScript errors: `npm run lint`

## Next Steps

Continue with the remaining phases to complete the system:

1. **Phase 4:** Customer Management - Full CRUD with metrics
2. **Phase 5:** Service Management - Service catalog
3. **Phase 6:** Appointment Scheduling - Calendar and email integration
4. **Phase 7:** Invoice Management - Billing and payments
5. **Phase 8:** Dashboard & Analytics - Insights and reports
6. **Phase 9:** Polish & Testing - Final improvements

## Contributing

This project follows a phased development approach. Each phase builds on the previous one, ensuring a solid foundation at each step.

## License

ISC

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend logs for API errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly
