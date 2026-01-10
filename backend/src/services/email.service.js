const nodemailer = require('nodemailer');
const EmailLog = require('../models/schemas/EmailLog');
require('dotenv').config();

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
};

// Helper function to log emails
const logEmail = async (emailData, status, error = null) => {
  try {
    const emailLog = new EmailLog({
      recipient: emailData.to,
      subject: emailData.subject,
      email_type: emailData.type,
      status,
      error_message: error ? error.message : undefined,
      sent_at: status === 'sent' ? new Date() : undefined,
    });
    await emailLog.save();
  } catch (err) {
    console.error('Failed to log email:', err);
  }
};

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const emailService = {
  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointment) {
    const customer = appointment.customer_id;
    const services = appointment.services.map(s => s.service_id.name).join(', ');

    const subject = 'Appointment Confirmation';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4F46E5; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.SALON_NAME || 'Salon'}</h1>
            <p>Appointment Confirmation</p>
          </div>

          <div class="content">
            <h2>Hello ${customer.first_name},</h2>
            <p>Your appointment has been confirmed!</p>

            <div class="details">
              <h3>Appointment Details</h3>
              <p><strong>Date & Time:</strong> ${formatDate(appointment.appointment_date)}</p>
              <p><strong>Duration:</strong> ${appointment.duration_minutes} minutes</p>
              <p><strong>Services:</strong> ${services}</p>
              ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            </div>

            <div class="details">
              <h3>Salon Information</h3>
              <p><strong>Address:</strong> ${process.env.SALON_ADDRESS || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${process.env.SALON_PHONE || 'Not provided'}</p>
              ${process.env.SALON_EMAIL ? `<p><strong>Email:</strong> ${process.env.SALON_EMAIL}</p>` : ''}
            </div>

            <p>If you need to reschedule or cancel your appointment, please contact us as soon as possible.</p>
          </div>

          <div class="footer">
            <p>Thank you for choosing ${process.env.SALON_NAME || 'our salon'}!</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: customer.email,
      subject,
      html,
      type: 'appointment_confirmation',
    };

    try {
      const mailer = createTransporter();
      await mailer.sendMail(emailData);
      await logEmail(emailData, 'sent');
      return true;
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      await logEmail(emailData, 'failed', error);
      throw error;
    }
  },

  /**
   * Send appointment update email
   */
  async sendAppointmentUpdate(appointment) {
    const customer = appointment.customer_id;
    const services = appointment.services.map(s => s.service_id.name).join(', ');

    const subject = 'Appointment Updated';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #F59E0B; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.SALON_NAME || 'Salon'}</h1>
            <p>Appointment Update</p>
          </div>

          <div class="content">
            <h2>Hello ${customer.first_name},</h2>
            <p>Your appointment has been updated.</p>

            <div class="details">
              <h3>Updated Appointment Details</h3>
              <p><strong>Date & Time:</strong> ${formatDate(appointment.appointment_date)}</p>
              <p><strong>Duration:</strong> ${appointment.duration_minutes} minutes</p>
              <p><strong>Services:</strong> ${services}</p>
              <p><strong>Status:</strong> ${appointment.status}</p>
              ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            </div>

            <p>If you have any questions about this update, please contact us.</p>
          </div>

          <div class="footer">
            <p>${process.env.SALON_NAME || 'Our Salon'}</p>
            <p>${process.env.SALON_PHONE || ''} | ${process.env.SALON_EMAIL || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: customer.email,
      subject,
      html,
      type: 'appointment_update',
    };

    try {
      const mailer = createTransporter();
      await mailer.sendMail(emailData);
      await logEmail(emailData, 'sent');
      return true;
    } catch (error) {
      console.error('Error sending appointment update:', error);
      await logEmail(emailData, 'failed', error);
      throw error;
    }
  },

  /**
   * Send appointment cancellation email
   */
  async sendAppointmentCancellation(appointment) {
    const customer = appointment.customer_id;

    const subject = 'Appointment Cancelled';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #EF4444; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.SALON_NAME || 'Salon'}</h1>
            <p>Appointment Cancelled</p>
          </div>

          <div class="content">
            <h2>Hello ${customer.first_name},</h2>
            <p>Your appointment has been cancelled.</p>

            <div class="details">
              <h3>Cancelled Appointment Details</h3>
              <p><strong>Date & Time:</strong> ${formatDate(appointment.appointment_date)}</p>
            </div>

            <p>We're sorry to see this appointment cancelled. If you'd like to reschedule, please contact us.</p>
          </div>

          <div class="footer">
            <p>${process.env.SALON_NAME || 'Our Salon'}</p>
            <p>${process.env.SALON_PHONE || ''} | ${process.env.SALON_EMAIL || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: customer.email,
      subject,
      html,
      type: 'appointment_cancellation',
    };

    try {
      const mailer = createTransporter();
      await mailer.sendMail(emailData);
      await logEmail(emailData, 'sent');
      return true;
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      await logEmail(emailData, 'failed', error);
      throw error;
    }
  },

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(appointment) {
    const customer = appointment.customer_id;
    const services = appointment.services.map(s => s.service_id.name).join(', ');

    const subject = 'Appointment Reminder';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10B981; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.SALON_NAME || 'Salon'}</h1>
            <p>Appointment Reminder</p>
          </div>

          <div class="content">
            <h2>Hello ${customer.first_name},</h2>
            <p>This is a reminder about your upcoming appointment.</p>

            <div class="details">
              <h3>Appointment Details</h3>
              <p><strong>Date & Time:</strong> ${formatDate(appointment.appointment_date)}</p>
              <p><strong>Duration:</strong> ${appointment.duration_minutes} minutes</p>
              <p><strong>Services:</strong> ${services}</p>
            </div>

            <p>We look forward to seeing you!</p>
          </div>

          <div class="footer">
            <p>${process.env.SALON_NAME || 'Our Salon'}</p>
            <p>${process.env.SALON_ADDRESS || ''}</p>
            <p>${process.env.SALON_PHONE || ''} | ${process.env.SALON_EMAIL || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: customer.email,
      subject,
      html,
      type: 'appointment_reminder',
    };

    try {
      const mailer = createTransporter();
      await mailer.sendMail(emailData);
      await logEmail(emailData, 'sent');
      return true;
    } catch (error) {
      console.error('Error sending reminder email:', error);
      await logEmail(emailData, 'failed', error);
      throw error;
    }
  },

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      const mailer = createTransporter();
      await mailer.verify();
      console.log('✓ Email service is ready');
      return true;
    } catch (error) {
      console.error('✗ Email service error:', error.message);
      return false;
    }
  },
};

module.exports = emailService;
