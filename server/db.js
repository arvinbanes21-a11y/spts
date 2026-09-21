const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'peer_tutoring.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'tutor', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tutor_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    subjects TEXT, -- JSON string array, e.g. '["Math", "Physics"]'
    hourly_rate REAL,
    profile_picture TEXT,
    graduated_program TEXT,
    current_grade TEXT,
    school_attended TEXT,
    specialization TEXT,
    graduated_year TEXT,
    proof_of_specialization TEXT,
    video_introduction TEXT,
    gcash_number TEXT,
    is_validated BOOLEAN DEFAULT 0,
    rating_avg REAL DEFAULT 0.00
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutee_id INTEGER REFERENCES users(id),
    tutor_id INTEGER REFERENCES users(id),
    subject TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'reschedule_requested', 'awaiting_payment', 'payment_verifying')) DEFAULT 'pending',
    meeting_link TEXT,
    notes TEXT,
    attachment TEXT,
    payment_proof TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS session_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sessions(id),
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS session_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sessions(id),
    sender_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorite_tutors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tutee_id, tutor_id)
  );

  CREATE TABLE IF NOT EXISTS user_complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sessions(id),
    reporter_id INTEGER REFERENCES users(id),
    reported_user_id INTEGER REFERENCES users(id),
    complaint_text TEXT NOT NULL,
    resolved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Try upgrading existing db
try { db.exec('ALTER TABLE tutor_profiles ADD COLUMN specialization TEXT;'); } catch(e) {}
try { db.exec('ALTER TABLE tutor_profiles ADD COLUMN graduated_year TEXT;'); } catch(e) {}
try { db.exec('ALTER TABLE tutor_profiles ADD COLUMN proof_of_specialization TEXT;'); } catch(e) {}
try { db.exec('ALTER TABLE tutor_profiles ADD COLUMN video_introduction TEXT;'); } catch(e) {}
try { db.exec('ALTER TABLE tutor_profiles ADD COLUMN gcash_number TEXT;'); } catch(e) {}
try { db.exec('ALTER TABLE tutor_profiles ADD COLUMN is_validated BOOLEAN DEFAULT 0;'); } catch(e) {}
try { db.exec('ALTER TABLE sessions ADD COLUMN payment_proof TEXT;'); } catch(e) {}

// Seed some sample tutors if the database is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
  const insertProfile = db.prepare('INSERT INTO tutor_profiles (user_id, bio, subjects, hourly_rate, rating_avg) VALUES (?, ?, ?, ?, ?)');

  const seedTx = db.transaction(() => {
    // Sample tutors
    insertUser.run('Sarah', 'Chen', 'sarah@example.com', 'hashed_password', 'tutor');
    insertProfile.run(1, 'Math expert with 3 years tutoring experience.', '["Calculus", "Linear Algebra", "Statistics"]', 25.00, 4.8);

    insertUser.run('James', 'Wilson', 'james@example.com', 'hashed_password', 'tutor');
    insertProfile.run(2, 'Physics and engineering tutor. Patient and thorough.', '["Physics", "Engineering", "Thermodynamics"]', 30.00, 4.6);

    insertUser.run('Maria', 'Garcia', 'maria@example.com', 'hashed_password', 'tutor');
    insertProfile.run(3, 'Computer science student specializing in algorithms.', '["Programming", "Data Structures", "Algorithms"]', 28.00, 4.9);

    insertUser.run('David', 'Kim', 'david@example.com', 'hashed_password', 'tutor');
    insertProfile.run(4, 'Chemistry and biology tutor. Lab experience included.', '["Chemistry", "Biology", "Organic Chemistry"]', 22.00, 4.5);
  });

  seedTx();
  console.log('Database seeded with sample tutors.');
}

console.log('SQLite database initialized at:', dbPath);

module.exports = db;
