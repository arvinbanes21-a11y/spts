const router = require('express').Router();
const db = require('../db');

// Get all tutors (including deactivated) for admin
router.get('/tutors', (req, res) => {
  try {
    const tutors = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.active, 
             tp.bio, tp.subjects, tp.hourly_rate, tp.rating_avg, 
             tp.is_validated, tp.school_attended, tp.graduated_program, 
             tp.specialization, tp.current_grade, tp.graduated_year, 
             tp.proof_of_specialization
      FROM users u
      JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor'
      ORDER BY u.first_name, u.last_name
    `).all();

    const formatted = tutors.map(t => ({
      id: t.id,
      name: `${t.first_name} ${t.last_name}`,
      email: t.email,
      active: t.active === 1,
      isValidated: t.is_validated === 1,
      subjects: JSON.parse(t.subjects || '[]'),
      rating: parseFloat(t.rating_avg) || 0,
      hourlyRate: parseFloat(t.hourly_rate) || 0,
      bio: t.bio || '',
      schoolAttended: t.school_attended || '',
      graduatedProgram: t.graduated_program || '',
      specialization: t.specialization || '',
      currentGrade: t.current_grade || '',
      graduatedYear: t.graduated_year || '',
      proofFile: t.proof_of_specialization || null
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Deactivate tutor
router.patch('/tutors/:id/deactivate', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('UPDATE users SET active = 0 WHERE id = ? AND role = ?').run(id, 'tutor');
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    res.json({ message: 'Tutor deactivated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Activate tutor
router.patch('/tutors/:id/activate', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('UPDATE users SET active = 1 WHERE id = ? AND role = ?').run(id, 'tutor');
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    res.json({ message: 'Tutor activated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Validate tutor
router.patch('/tutors/:id/validate', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('UPDATE tutor_profiles SET is_validated = 1 WHERE user_id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    res.json({ message: 'Tutor validated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Get complaints (from user_complaints)
router.get('/complaints', (req, res) => {
  try {
    const complaints = db.prepare(`
      SELECT uc.id, uc.session_id, uc.complaint_text as comment, uc.resolved, uc.created_at,
        s.subject as session_subject,
        reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name, reporter.role as reporter_role,
        reported.first_name as reported_first_name, reported.last_name as reported_last_name
      FROM user_complaints uc
      JOIN sessions s ON uc.session_id = s.id
      JOIN users reporter ON uc.reporter_id = reporter.id
      JOIN users reported ON uc.reported_user_id = reported.id
      ORDER BY uc.resolved ASC, uc.created_at DESC
    `).all();

    const formatted = complaints.map(c => ({
      id: c.id,
      sessionId: c.session_id,
      comment: c.comment,
      resolved: c.resolved === 1,
      createdAt: c.created_at,
      sessionSubject: c.session_subject,
      reporterName: `${c.reporter_first_name} ${c.reporter_last_name}`,
      reporterRole: c.reporter_role,
      reportedName: `${c.reported_first_name} ${c.reported_last_name}`
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Mark complaint as resolved
router.patch('/complaints/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('UPDATE user_complaints SET resolved = 1 WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint resolved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;
