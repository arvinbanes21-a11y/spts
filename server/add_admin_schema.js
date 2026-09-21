/**
 * Migration: Add active (users) and resolved (session_feedback) for admin features.
 * Run: node add_admin_schema.js
 */
const db = require('./db');

try {
  // Add active column to users if not exists (SQLite doesn't have IF NOT EXISTS for columns)
  try {
    db.prepare('ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1').run();
    console.log('Added users.active column.');
  } catch (e) {
    if (e.message && e.message.includes('duplicate column')) {
      console.log('users.active already exists.');
    } else throw e;
  }

  // Add resolved column to session_feedback if not exists
  try {
    db.prepare('ALTER TABLE session_feedback ADD COLUMN resolved INTEGER DEFAULT 0').run();
    console.log('Added session_feedback.resolved column.');
  } catch (e) {
    if (e.message && e.message.includes('duplicate column')) {
      console.log('session_feedback.resolved already exists.');
    } else throw e;
  }

  // Set active=1 for any existing users that might have NULL
  db.prepare('UPDATE users SET active = 1 WHERE active IS NULL').run();
  db.prepare('UPDATE session_feedback SET resolved = 0 WHERE resolved IS NULL').run();

  console.log('Admin schema migration complete.');
} catch (e) {
  console.error('Migration failed:', e);
}
