const router = require('express').Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    }
});

// Multer config for payment receipt uploads
const receiptUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for receipts'));
        }
    }
});

// Create a new session
router.post('/', upload.single('attachment'), (req, res) => {
    try {
        const { tutorId, subject, startTime, endTime, tuteeId, notes } = req.body;

        if (!tutorId || !subject || !startTime || !endTime || !tuteeId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate that startTime is not in the past
        if (new Date(startTime) < new Date()) {
            return res.status(400).json({ message: "Cannot book a session in the past" });
        }
        
        // Validate duration is at least 1 hour and ends after it starts
        const startMillis = new Date(startTime).getTime();
        const endMillis = new Date(endTime).getTime();
        
        if (endMillis <= startMillis) {
            return res.status(400).json({ message: "End time must be after start time." });
        }
        
        const durationHours = (endMillis - startMillis) / (1000 * 60 * 60);
        if (durationHours < 1) {
            return res.status(400).json({ message: "Minimum booking duration is 1 hour." });
        }

        // No overlapping / Double booking rule
        // Overlap logic: (existing_start < new_end) AND (existing_end > new_start)
        const overlap = db.prepare(`
            SELECT id FROM sessions
            WHERE tutor_id = ?
            AND status NOT IN ('cancelled', 'declined')
            AND start_time < ?
            AND end_time > ?
        `).get(tutorId, endTime, startTime);

        if (overlap) {
            return res.status(409).json({ message: "Selected time slot is already booked." });
        }

        const attachmentPath = req.file ? req.file.filename : null;

        const result = db.prepare(
            `INSERT INTO sessions (tutor_id, tutee_id, subject, start_time, end_time, status, notes, attachment)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
        ).run(tutorId, tuteeId, subject, startTime, endTime, notes || null, attachmentPath);

        const newSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);
        res.json(newSession);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Get sessions for a user (tutor or tutee)
router.get('/', (req, res) => {
    try {
        const { userId, role } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID required" });
        }

        // Auto-cancel pending sessions older than 48 hours or if start_time has passed
        db.prepare(`
            UPDATE sessions 
            SET status = 'cancelled' 
            WHERE status = 'pending' 
            AND (created_at <= datetime('now', '-2 days') OR start_time <= datetime('now'))
        `).run();

        let sessions;

        if (role === 'tutor') {
            sessions = db.prepare(`
        SELECT s.*, u.first_name as tutee_name, u.last_name as tutee_last_name
        FROM sessions s
        JOIN users u ON s.tutee_id = u.id
        WHERE s.tutor_id = ?
        ORDER BY s.start_time ASC
      `).all(userId);
        } else {
            sessions = db.prepare(`
        SELECT s.*, u.first_name as tutor_name, u.last_name as tutor_last_name, tp.gcash_number as tutor_gcash_number, tp.hourly_rate as tutor_hourly_rate
        FROM sessions s
        JOIN users u ON s.tutor_id = u.id
        JOIN tutor_profiles tp ON s.tutor_id = tp.user_id
        WHERE s.tutee_id = ?
        ORDER BY s.start_time ASC
      `).all(userId);
        }

        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Submit feedback for a session
router.post('/:id/feedback', (req, res) => {
    try {
        const { id } = req.params;
        const { fromUserId, toUserId, rating, comment } = req.body;

        if (!fromUserId || !toUserId || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let feedbackId;
        db.transaction(() => {
            const result = db.prepare(
                `INSERT INTO session_feedback (session_id, from_user_id, to_user_id, rating, comment)
                 VALUES (?, ?, ?, ?, ?)`
            ).run(id, fromUserId, toUserId, rating, comment);
            
            feedbackId = result.lastInsertRowid;

            // Recalculate average rating for the tutor
            const avgResult = db.prepare(`
                SELECT AVG(CAST(rating AS FLOAT)) as avg_rating 
                FROM session_feedback 
                WHERE to_user_id = ?
            `).get(toUserId);
            
            if (avgResult && avgResult.avg_rating) {
                db.prepare(`UPDATE tutor_profiles SET rating_avg = ? WHERE user_id = ?`)
                  .run(avgResult.avg_rating, toUserId);
            }
        })();

        const feedback = db.prepare('SELECT * FROM session_feedback WHERE id = ?').get(feedbackId);
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Get feedback for a user (received feedback)
router.get('/feedback/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const feedback = db.prepare(`
            SELECT sf.*, u.first_name, u.last_name, s.subject
            FROM session_feedback sf
            JOIN users u ON sf.from_user_id = u.id
            JOIN sessions s ON sf.session_id = s.id
            WHERE sf.to_user_id = ?
            ORDER BY sf.created_at DESC
        `).all(userId);
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Update session status (confirm, decline, cancel)
router.put('/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status, meetLink, startTime, endTime } = req.body;

        const allowed = ['confirmed', 'declined', 'cancelled', 'reschedule_requested', 'awaiting_payment', 'payment_verifying'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
        }

        const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Handle specific logic based on provided fields
        if (startTime && endTime && status === 'reschedule_requested') {
            db.prepare('UPDATE sessions SET status = ?, start_time = ?, end_time = ? WHERE id = ?')
                .run(status, startTime, endTime, id);
        } else if (meetLink) {
            db.prepare('UPDATE sessions SET status = ?, meeting_link = ? WHERE id = ?')
                .run(status, meetLink, id);
        } else {
            db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, id);
        }
        const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Upload GCash payment receipt
router.post('/:id/payment', receiptUpload.single('receipt'), (req, res) => {
    try {
        const { id } = req.params;

        const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        if (session.status !== 'awaiting_payment') {
            return res.status(400).json({ message: 'Session is not awaiting payment' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No receipt file uploaded' });
        }

        db.prepare('UPDATE sessions SET payment_proof = ?, status = ? WHERE id = ?')
            .run(req.file.filename, 'payment_verifying', id);

        const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Tutor verifies GCash payment — auto-generates Jitsi link
router.put('/:id/verify-payment', (req, res) => {
    try {
        const { id } = req.params;

        const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        if (session.status !== 'payment_verifying') {
            return res.status(400).json({ message: 'Session payment is not pending verification' });
        }

        // Generate a unique Jitsi room name
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const jitsiLink = `https://meet.jit.si/SPTS-Session-${id}-${randomSuffix}`;

        db.prepare('UPDATE sessions SET status = ?, meeting_link = ? WHERE id = ?')
            .run('confirmed', jitsiLink, id);

        const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Get messages for a session
router.get('/:id/messages', (req, res) => {
    try {
        const { id } = req.params;
        const messages = db.prepare(`
            SELECT sm.*, u.first_name, u.last_name 
            FROM session_messages sm
            JOIN users u ON sm.sender_id = u.id
            WHERE sm.session_id = ?
            ORDER BY sm.created_at ASC
        `).all(id);
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Send a message in a session
router.post('/:id/messages', (req, res) => {
    try {
        const { id } = req.params;
        const { senderId, message } = req.body;

        if (!senderId || !message) {
            return res.status(400).json({ message: "Sender ID and message are required" });
        }

        const result = db.prepare('INSERT INTO session_messages (session_id, sender_id, message) VALUES (?, ?, ?)')
            .run(id, senderId, message);

        const newMessage = db.prepare(`
            SELECT sm.*, u.first_name, u.last_name 
            FROM session_messages sm
            JOIN users u ON sm.sender_id = u.id
            WHERE sm.id = ?
        `).get(result.lastInsertRowid);

        res.json(newMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Submit complaint for a session
router.post('/:id/complaint', (req, res) => {
    try {
        const { id } = req.params;
        const { reporterId, reportedUserId, comment } = req.body;

        if (!reporterId || !reportedUserId || !comment) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = db.prepare(
            `INSERT INTO user_complaints (session_id, reporter_id, reported_user_id, complaint_text)
       VALUES (?, ?, ?, ?)`
        ).run(id, reporterId, reportedUserId, comment);

        const complaint = db.prepare('SELECT * FROM user_complaints WHERE id = ?').get(result.lastInsertRowid);
        res.json(complaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

module.exports = router;
