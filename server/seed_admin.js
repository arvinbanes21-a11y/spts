/**
 * Seed admin user. Run: node seed_admin.js
 * Credentials: admin@example.com / admin123
 */
const db = require('./db');

const adminEmail = 'admin@example.com';
const adminPassword = 'hashed_admin123';

try {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (existing) {
    console.log('Admin user already exists.');
  } else {
    db.prepare(
      'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run('Admin', 'User', adminEmail, adminPassword, 'admin');
    console.log('Admin user created: admin@example.com / admin123');
  }
} catch (e) {
  console.error('Seed failed:', e);
}
