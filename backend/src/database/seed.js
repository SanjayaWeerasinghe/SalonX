const { connectDB } = require('../config/database');
const User = require('../models/schemas/User');
const Service = require('../models/schemas/Service');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('Starting database seeding...');
    console.log('==================================================\n');

    // Seed admin user
    console.log('Seeding admin user...');
    const adminEmail = 'admin@salon.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠ Admin user already exists, skipping...');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        email: adminEmail,
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      });
      await admin.save();
      console.log('✓ Admin user created (email: admin@salon.com, password: admin123)');
    }

    // Seed sample services
    console.log('\nSeeding sample services...');
    const servicesCount = await Service.countDocuments();

    if (servicesCount > 0) {
      console.log('⚠ Services already exist, skipping...');
    } else {
      const sampleServices = [
        { name: 'Haircut - Women', description: 'Professional women\'s haircut and styling', price: 50.00, duration_minutes: 60 },
        { name: 'Haircut - Men', description: 'Professional men\'s haircut', price: 30.00, duration_minutes: 30 },
        { name: 'Hair Coloring', description: 'Full hair coloring service', price: 120.00, duration_minutes: 120 },
        { name: 'Highlights', description: 'Hair highlights', price: 100.00, duration_minutes: 90 },
        { name: 'Blowout', description: 'Professional blowout and styling', price: 40.00, duration_minutes: 45 },
        { name: 'Deep Conditioning Treatment', description: 'Intensive hair treatment', price: 35.00, duration_minutes: 30 },
        { name: 'Manicure', description: 'Classic manicure', price: 25.00, duration_minutes: 30 },
        { name: 'Pedicure', description: 'Classic pedicure', price: 40.00, duration_minutes: 45 },
        { name: 'Facial', description: 'Relaxing facial treatment', price: 75.00, duration_minutes: 60 },
        { name: 'Massage - 60min', description: 'Full body massage', price: 90.00, duration_minutes: 60 },
      ];

      await Service.insertMany(sampleServices);
      console.log(`✓ ${sampleServices.length} sample services created`);
    }

    console.log('\n==================================================');
    console.log('✓ Database seeding completed!');
    console.log('==================================================');
    console.log('\nDefault admin credentials:');
    console.log('  Email: admin@salon.com');
    console.log('  Password: admin123');
    console.log('  IMPORTANT: Change this password after first login!');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
