-- Database Schema for Smart PeerTutoring System

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'tutor', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutor Profiles (Extension of Users for Tutors)
CREATE TABLE tutor_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    subjects TEXT[], -- Array of subjects, e.g., {'Math', 'Physics'}
    hourly_rate DECIMAL(10, 2),
    rating_avg DECIMAL(3, 2) DEFAULT 0.00
);

-- Sessions Table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    tutee_id INTEGER REFERENCES users(id),
    tutor_id INTEGER REFERENCES users(id),
    subject VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    meeting_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback/Ratings
CREATE TABLE session_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
