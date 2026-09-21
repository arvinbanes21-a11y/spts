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
        const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

const videoUpload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.mp4', '.webm'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only mp4 and webm videos are allowed'));
        }
    }
});

// Get all tutors
router.get('/', (req, res) => {
    try {
        const tutors = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, tp.bio, tp.subjects, tp.hourly_rate, tp.rating_avg, tp.profile_picture, tp.graduated_program, tp.current_grade, tp.school_attended, tp.video_introduction, tp.gcash_number
      FROM users u
      JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor' AND (u.active IS NULL OR u.active = 1) AND tp.is_validated = 1
    `).all();

        const formattedTutors = tutors.map(t => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
            subjects: JSON.parse(t.subjects || '[]'),
            rating: parseFloat(t.rating_avg) || 0,
            bio: t.bio || '',
            hourlyRate: parseFloat(t.hourly_rate) || 0,
            avatar: `${t.first_name[0]}${t.last_name[0]}`,
            profilePicture: t.profile_picture || null,
            graduatedProgram: t.graduated_program || '',
            currentGrade: t.current_grade || '',
            schoolAttended: t.school_attended || '',
            videoIntroduction: t.video_introduction || null,
            gcashNumber: t.gcash_number || ''
        }));

        res.json(formattedTutors);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Add tutor to favorites
router.post('/favorites', (req, res) => {
    try {
        const { tuteeId, tutorId } = req.body;
        if (!tuteeId || !tutorId) return res.status(400).json({ message: "Missing info" });
        db.prepare('INSERT OR IGNORE INTO favorite_tutors (tutee_id, tutor_id) VALUES (?, ?)').run(tuteeId, tutorId);
        res.json({ message: "Added to favorites" });
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// Remove tutor from favorites
router.delete('/favorites', (req, res) => {
    try {
        const { tuteeId, tutorId } = req.query; // query params for DELETE
        if (!tuteeId || !tutorId) return res.status(400).json({ message: "Missing info" });
        db.prepare('DELETE FROM favorite_tutors WHERE tutee_id = ? AND tutor_id = ?').run(tuteeId, tutorId);
        res.json({ message: "Removed from favorites" });
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// Get favorite tutors for a tutee
router.get('/favorites/:tuteeId', (req, res) => {
    try {
        const { tuteeId } = req.params;
        const favorites = db.prepare(`
            SELECT u.id, u.first_name, u.last_name, u.email, tp.bio, tp.subjects, tp.hourly_rate, tp.rating_avg, tp.profile_picture, tp.graduated_program, tp.current_grade, tp.school_attended
            FROM favorite_tutors ft
            JOIN users u ON ft.tutor_id = u.id
            JOIN tutor_profiles tp ON u.id = tp.user_id
            WHERE ft.tutee_id = ?
        `).all(tuteeId);

        const formatted = favorites.map(t => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
            subjects: JSON.parse(t.subjects || '[]'),
            rating: parseFloat(t.rating_avg) || 0,
            bio: t.bio || '',
            hourlyRate: parseFloat(t.hourly_rate) || 0,
            avatar: `${t.first_name[0]}${t.last_name[0]}`,
            profilePicture: t.profile_picture || null,
            graduatedProgram: t.graduated_program || '',
            currentGrade: t.current_grade || '',
            schoolAttended: t.school_attended || ''
        }));
        res.json(formatted);
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// Get a specific tutor's profile
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const tutor = db.prepare(`
            SELECT u.id, u.first_name, u.last_name, u.email, tp.bio, tp.subjects, tp.hourly_rate, tp.rating_avg, tp.profile_picture, tp.graduated_program, tp.current_grade, tp.school_attended, tp.gcash_number
            FROM users u
            JOIN tutor_profiles tp ON u.id = tp.user_id
            WHERE u.id = ? AND u.role = 'tutor'
        `).get(id);

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        const formattedTutor = {
            id: tutor.id,
            firstName: tutor.first_name,
            lastName: tutor.last_name,
            email: tutor.email,
            subjects: JSON.parse(tutor.subjects || '[]'),
            rating: parseFloat(tutor.rating_avg) || 0,
            bio: tutor.bio || '',
            hourlyRate: parseFloat(tutor.hourly_rate) || 0,
            avatar: `${tutor.first_name[0]}${tutor.last_name[0]}`,
            profilePicture: tutor.profile_picture || null,
            graduatedProgram: tutor.graduated_program || '',
            currentGrade: tutor.current_grade || '',
            schoolAttended: tutor.school_attended || '',
            gcashNumber: tutor.gcash_number || ''
        };

        res.json(formattedTutor);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Update tutor profile
function updateProfile(req, res) {
    try {
        const { id } = req.params;
        const { bio, hourlyRate, graduatedProgram, currentGrade, schoolAttended, gcashNumber } = req.body;

        let subjects;
        if (typeof req.body.subjects === 'string') {
            subjects = JSON.parse(req.body.subjects);
        } else {
            subjects = req.body.subjects || [];
        }

        const profilePicture = req.file ? req.file.filename : null;

        let result;
        if (profilePicture) {
            result = db.prepare(`
                UPDATE tutor_profiles
                SET bio = ?, subjects = ?, hourly_rate = ?, profile_picture = ?, graduated_program = ?, current_grade = ?, school_attended = ?, gcash_number = ?
                WHERE user_id = ?
            `).run(bio, JSON.stringify(subjects), hourlyRate, profilePicture, graduatedProgram || '', currentGrade || '', schoolAttended || '', gcashNumber || '', id);
        } else {
            result = db.prepare(`
                UPDATE tutor_profiles
                SET bio = ?, subjects = ?, hourly_rate = ?, graduated_program = ?, current_grade = ?, school_attended = ?, gcash_number = ?
                WHERE user_id = ?
            `).run(bio, JSON.stringify(subjects), hourlyRate, graduatedProgram || '', currentGrade || '', schoolAttended || '', gcashNumber || '', id);
        }

        if (result.changes === 0) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }

        res.json({ message: "Profile updated successfully", profilePicture });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
}

router.put('/:id', uploadUpload.single('profilePicture'), updateProfile);

// Upload video introduction
router.post('/:id/video', videoUpload.single('video'), (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ message: "No video uploaded" });
        }

        db.prepare('UPDATE tutor_profiles SET video_introduction = ? WHERE user_id = ?')
          .run(req.file.filename, id);

        res.json({ message: "Video uploaded successfully", filename: req.file.filename });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

module.exports = router;
