-- Insert sample salon services
INSERT INTO services (name, description, price, duration_minutes, is_active)
VALUES
    ('Haircut - Women', 'Professional women''s haircut and styling', 50.00, 60, true),
    ('Haircut - Men', 'Professional men''s haircut', 30.00, 30, true),
    ('Hair Coloring', 'Full hair coloring service', 120.00, 120, true),
    ('Highlights', 'Hair highlights', 100.00, 90, true),
    ('Blowout', 'Professional blowout and styling', 40.00, 45, true),
    ('Deep Conditioning Treatment', 'Intensive hair treatment', 35.00, 30, true),
    ('Manicure', 'Classic manicure', 25.00, 30, true),
    ('Pedicure', 'Classic pedicure', 40.00, 45, true),
    ('Facial', 'Relaxing facial treatment', 75.00, 60, true),
    ('Massage - 60min', 'Full body massage', 90.00, 60, true)
ON CONFLICT DO NOTHING;
