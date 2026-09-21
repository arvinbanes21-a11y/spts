export const getDemoSessions = (role: 'student' | 'tutor') => {
    const now = new Date();
    
    // 35 minutes from now (triggers upcoming 1-hour notification banner!)
    const soonStart = new Date(now.getTime() + 35 * 60 * 1000);
    const soonEnd = new Date(soonStart.getTime() + 60 * 60 * 1000);

    // Tomorrow session
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 60 * 60 * 1000);

    // In 2 days session
    const twoDaysStart = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const twoDaysEnd = new Date(twoDaysStart.getTime() + 60 * 60 * 1000);

    // Past sessions
    const pastStart1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const pastEnd1 = new Date(pastStart1.getTime() + 60 * 60 * 1000);

    const pastStart2 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const pastEnd2 = new Date(pastStart2.getTime() + 60 * 60 * 1000);

    const cancelledStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const cancelledEnd = new Date(cancelledStart.getTime() + 60 * 60 * 1000);

    return [
        {
            id: 101,
            subject: 'Calculus & Linear Algebra',
            tutor_id: 1,
            tutee_id: 999,
            tutor_name: 'Alex',
            tutor_last_name: 'Johnson',
            tutee_name: 'Jordan',
            tutee_last_name: 'Cruz',
            tutor_gcash_number: '0917-123-4567',
            status: 'confirmed',
            start_time: soonStart.toISOString(),
            end_time: soonEnd.toISOString(),
            meeting_link: 'https://meet.jit.si/SPTS-Session-Demo-2026',
            notes: 'Preparing for midterm exam, focus on derivatives and matrix transformations.'
        },
        {
            id: 102,
            subject: 'Physics Mechanics & Thermodynamics',
            tutor_id: 2,
            tutee_id: 999,
            tutor_name: 'Emily',
            tutor_last_name: 'Chen',
            tutee_name: 'Jordan',
            tutee_last_name: 'Cruz',
            tutor_gcash_number: '0918-987-6543',
            status: 'awaiting_payment',
            start_time: tomorrowStart.toISOString(),
            end_time: tomorrowEnd.toISOString(),
            meeting_link: null,
            notes: 'Need help solving thermodynamics problem set 4.'
        },
        {
            id: 103,
            subject: 'Data Structures & Algorithms',
            tutor_id: 4,
            tutee_id: 999,
            tutor_name: 'Sarah',
            tutor_last_name: 'Williams',
            tutee_name: 'Jordan',
            tutee_last_name: 'Cruz',
            tutor_gcash_number: '0920-555-0199',
            status: 'payment_verifying',
            start_time: twoDaysStart.toISOString(),
            end_time: twoDaysEnd.toISOString(),
            meeting_link: null,
            payment_proof: 'sample_receipt.png',
            notes: 'Covering dynamic programming and binary search trees.'
        },
        {
            id: 104,
            subject: 'English & Technical Writing',
            tutor_id: 3,
            tutee_id: 999,
            tutor_name: 'Michael',
            tutor_last_name: 'Brown',
            tutee_name: 'Jordan',
            tutee_last_name: 'Cruz',
            tutor_gcash_number: '0915-444-2211',
            status: 'completed',
            start_time: pastStart1.toISOString(),
            end_time: pastEnd1.toISOString(),
            meeting_link: null,
            notes: 'Research paper outline review.'
        },
        {
            id: 105,
            subject: 'General Chemistry 1',
            tutor_id: 2,
            tutee_id: 999,
            tutor_name: 'Emily',
            tutor_last_name: 'Chen',
            tutee_name: 'Jordan',
            tutee_last_name: 'Cruz',
            tutor_gcash_number: '0918-987-6543',
            status: 'completed',
            start_time: pastStart2.toISOString(),
            end_time: pastEnd2.toISOString(),
            meeting_link: null,
            notes: 'Stoichiometry review.'
        },
        {
            id: 106,
            subject: 'Discrete Mathematics',
            tutor_id: 1,
            tutee_id: 999,
            tutor_name: 'Alex',
            tutor_last_name: 'Johnson',
            tutee_name: 'Jordan',
            tutee_last_name: 'Cruz',
            tutor_gcash_number: '0917-123-4567',
            status: 'cancelled',
            start_time: cancelledStart.toISOString(),
            end_time: cancelledEnd.toISOString(),
            meeting_link: null,
            notes: 'Rescheduled due to university quiz conflict.'
        }
    ];
};
