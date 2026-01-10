-- Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
    email_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent',
    error_message TEXT,
    CONSTRAINT chk_email_type CHECK (email_type IN ('confirmation', 'reminder', 'invoice', 'other')),
    CONSTRAINT chk_status CHECK (status IN ('sent', 'failed'))
);

-- Create indexes for performance
CREATE INDEX idx_email_logs_customer_id ON email_logs(customer_id);
CREATE INDEX idx_email_logs_appointment_id ON email_logs(appointment_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
