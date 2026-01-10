# Salon Management System - Backend API

Backend API server for the Salon Management System built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb salon_management
```

Or using PostgreSQL client:

```sql
CREATE DATABASE salon_management;
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials (DB_HOST, DB_USER, DB_PASSWORD, etc.)
- JWT secret keys
- SMTP email configuration (for Gmail, use app-specific password)
- Salon information

### 4. Run Migrations

Run database migrations to create tables and seed initial data:

```bash
npm run migrate
```

This will:
- Create all database tables
- Create a default admin user (admin@salon.com / admin123)
- Seed sample services

**IMPORTANT:** Change the default admin password after first login!

### 5. Start the Server

Development mode (with auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in .env).

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Authentication (Coming in Phase 2)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Customers (Coming in Phase 4)
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/metrics` - Get customer metrics
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Services (Coming in Phase 5)
- `GET /api/services` - List all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Appointments (Coming in Phase 6)
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/status` - Update status
- `DELETE /api/appointments/:id` - Delete appointment

### Invoices (Coming in Phase 7)
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/payment` - Update payment status
- `DELETE /api/invoices/:id` - Delete invoice

### Dashboard (Coming in Phase 8)
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/revenue` - Get revenue trends
- `GET /api/dashboard/appointments/upcoming` - Get upcoming appointments

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── templates/       # Email templates
│   ├── database/        # Migrations and seeds
│   └── app.js           # Express app setup
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json
└── server.js            # Server entry point
```

## Gmail SMTP Setup

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail" / "Other"
3. Use the generated password in SMTP_PASSWORD (not your regular password)

## Default Credentials

After running migrations:
- **Email:** admin@salon.com
- **Password:** admin123

**Change this password immediately after first login!**

## Development

### Testing Database Connection

The server automatically tests the database connection on startup.

### Viewing Logs

Logs are output to console using Morgan middleware in development mode.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists (`salon_management`)
- Check if PostgreSQL is accepting connections on the specified port

### Migration Issues
- Ensure database is empty before first migration
- Drop and recreate database if needed:
  ```bash
  dropdb salon_management
  createdb salon_management
  npm run migrate
  ```

### Email Issues
- Verify SMTP credentials
- For Gmail, use app-specific password
- Check SMTP host and port configuration
- Ensure less secure app access is disabled (use app passwords instead)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer
- **Security:** Helmet, CORS
- **Logging:** Morgan

## License

ISC
