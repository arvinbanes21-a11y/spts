const router = require('express').Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const uploadUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and pdfs are allowed'));
        }
    }
});

router.post('/register', uploadUpload.single('proofFile'), (req, res) => {
    try {
        const { firstName, lastName, email, password, role, schoolAttended, graduatedProgram, specialization, currentGrade, graduatedYear } = req.body;

        // Check if user exists
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(401).json({ message: "User already exists" });
        }

        // Insert user (placeholder hash for now)
        const result = db.prepare(
            'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
        ).run(firstName, lastName, email, "hashed_" + password, role);

        const newUser = db.prepare('SELECT id, first_name, last_name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);

        // If registering as tutor, create an empty tutor profile
        if (role === 'tutor') {
            const proofFileName = req.file ? req.file.filename : null;
            db.prepare(`
                INSERT INTO tutor_profiles (
                    user_id, bio, subjects, hourly_rate, rating_avg,
                    school_attended, graduated_program, current_grade,
                    specialization, graduated_year, proof_of_specialization
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                newUser.id, '', '[]', 0, 0,
                schoolAttended || '', graduatedProgram || '', currentGrade || '',
                specialization || '', graduatedYear || '', proofFileName
            );
            newUser.isValidated = false;
        }

        res.json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.prepare('SELECT id, first_name, last_name, email, role FROM users WHERE email = ? AND password_hash = ?').get(email, "hashed_" + password);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.role === 'tutor') {
            const profile = db.prepare('SELECT is_validated FROM tutor_profiles WHERE user_id = ?').get(user.id);
            if (profile) {
                user.isValidated = profile.is_validated === 1;
            }
        }

        // Store user info for the frontend to use
        res.json({ token: "fake-jwt-token", user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

module.exports = router;
