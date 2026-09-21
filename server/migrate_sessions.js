const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'peer_tutoring.db');
const db = new Database(dbPath);

console.log("Starting migration...");

try {
    db.exec(`
        PRAGMA foreign_keys=off;

        BEGIN TRANSACTION;

        CREATE TABLE IF NOT EXISTS new_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tutor_id INTEGER NOT NULL,
            tutee_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'reschedule_requested', 'awaiting_payment', 'payment_verifying')) DEFAULT 'pending',
            meeting_link TEXT,
            notes TEXT,
            attachment TEXT,
            payment_proof TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tutor_id) REFERENCES users(id),
            FOREIGN KEY (tutee_id) REFERENCES users(id)
        );

        INSERT INTO new_sessions (id, tutor_id, tutee_id, subject, start_time, end_time, status, meeting_link, notes, attachment, payment_proof, created_at)
        SELECT id, tutor_id, tutee_id, subject, start_time, end_time, status, meeting_link, notes, attachment, payment_proof, created_at
        FROM sessions;

        DROP TABLE sessions;

        ALTER TABLE new_sessions RENAME TO sessions;

        COMMIT;

        PRAGMA foreign_keys=on;
    `);
    console.log("Migration successful.");
} catch (e) {
    console.error("Migration failed:", e);
}

db.close();
