require('dotenv').config();

module.exports = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  from: {
    name: process.env.SMTP_FROM_NAME || 'Salon Management',
    email: process.env.SMTP_FROM_EMAIL || 'noreply@salon.com',
  },
  salon: {
    name: process.env.SALON_NAME || 'Your Salon',
    address: process.env.SALON_ADDRESS || '',
    phone: process.env.SALON_PHONE || '',
    email: process.env.SALON_EMAIL || '',
  },
};
