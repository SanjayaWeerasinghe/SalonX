-- Create appointment_services junction table (many-to-many)
CREATE TABLE IF NOT EXISTS appointment_services (
    id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_quantity CHECK (quantity > 0)
);

-- Create indexes for performance
CREATE INDEX idx_appointment_services_appointment_id ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service_id ON appointment_services(service_id);
