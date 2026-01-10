-- Create default admin user
-- Default password is 'admin123' - CHANGE THIS AFTER FIRST LOGIN
-- Password hash is for 'admin123' using bcrypt with salt rounds = 10
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
    'admin@salon.com',
    '$2a$10$YourPasswordHashWillBeGeneratedByTheScript',
    'Admin',
    'User',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Note: The actual password hash will be generated when running the migration script
-- Default credentials: admin@salon.com / admin123
