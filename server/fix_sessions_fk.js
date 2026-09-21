const db = require('./db');

try {
  console.log('Starting migration to fix session_feedback and session_messages foreign keys...');

  // Temporarily disable foreign key checks while we recreate the tables
  db.exec('PRAGMA foreign_keys = OFF;');

  // Recreate session_feedback with correct foreign key to sessions
  db.exec(`
    CREATE TABLE session_feedback_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER REFERENCES sessions(id),
      from_user_id INTEGER REFERENCES users(id),
      to_user_id INTEGER REFERENCES users(id),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    INSERT INTO session_feedback_new (id, session_id, from_user_id, to_user_id, rating, comment, created_at)
    SELECT id, session_id, from_user_id, to_user_id, rating, comment, created_at
    FROM session_feedback;
  `);

  db.exec(`
    DROP TABLE session_feedback;
    ALTER TABLE session_feedback_new RENAME TO session_feedback;
  `);

  // Recreate session_messages with correct foreign key to sessions
  db.exec(`
    CREATE TABLE session_messages_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER REFERENCES sessions(id),
      sender_id INTEGER REFERENCES users(id),
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    INSERT INTO session_messages_new (id, session_id, sender_id, message, created_at)
    SELECT id, session_id, sender_id, message, created_at
    FROM session_messages;
  `);

  db.exec(`
    DROP TABLE session_messages;
    ALTER TABLE session_messages_new RENAME TO session_messages;
  `);

  // Re-enable foreign key checks
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('Migration completed successfully.');
} catch (e) {
  console.error('Migration failed:', e);
}

