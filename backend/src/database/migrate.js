const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('Starting database migrations...\n');

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = await fs.readdir(migrationsDir);
    const sortedMigrations = migrationFiles.filter(f => f.endsWith('.sql')).sort();

    // Run each migration
    for (const file of sortedMigrations) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      await client.query(sql);
      console.log(`✓ ${file} completed`);
    }

    console.log('\n✓ All migrations completed successfully\n');

    // Run seeds
    console.log('Running database seeds...\n');

    // Seed admin user with hashed password
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@salon.com', hashedPassword, 'Admin', 'User', 'admin']);

    console.log('✓ Admin user seeded (email: admin@salon.com, password: admin123)');

    // Seed sample services
    const servicesPath = path.join(__dirname, 'seeds', '002_seed_sample_services.sql');
    const servicesSql = await fs.readFile(servicesPath, 'utf8');
    await client.query(servicesSql);

    console.log('✓ Sample services seeded');

    console.log('\n✓ All seeds completed successfully\n');
    console.log('==================================================');
    console.log('Database setup complete!');
    console.log('Default admin credentials:');
    console.log('  Email: admin@salon.com');
    console.log('  Password: admin123');
    console.log('  IMPORTANT: Change this password after first login!');
    console.log('==================================================\n');

  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
