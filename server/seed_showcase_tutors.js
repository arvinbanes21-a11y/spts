/**
 * Seed dummy tutor accounts for showcasing search filters.
 * Run: node seed_showcase_tutors.js
 */
const db = require('./db');

const showcaseTutors = [
  // Low price, low rating - budget filter
  { first: 'Ana', last: 'Reyes', email: 'showcase_ana@example.com', bio: 'New tutor building experience. Affordable rates for students on a budget.', subjects: ['English', 'Filipino'], hourly_rate: 10, rating_avg: 3.5 },
  // Low price, mid rating
  { first: 'Bobby', last: 'Santos', email: 'showcase_bobby@example.com', bio: 'Patient tutor specializing in basic Math and Science.', subjects: ['Mathematics', 'General Science'], hourly_rate: 25, rating_avg: 4.0 },
  // Mid price, high rating
  { first: 'Carla', last: 'Dela Cruz', email: 'showcase_carla@example.com', bio: 'Experienced tutor with excellent student feedback. Specializes in advanced subjects.', subjects: ['Physics', 'Calculus', 'Chemistry'], hourly_rate: 75, rating_avg: 4.7 },
  // High price, highest rating - premium filter
  { first: 'Diego', last: 'Manila', email: 'showcase_diego@example.com', bio: 'Elite tutor with 5-star reviews. Ideal for competitive exam prep.', subjects: ['Engineering', 'Programming', 'Statistics'], hourly_rate: 150, rating_avg: 5.0 },
  // Highest price - max filter showcase
  { first: 'Elena', last: 'Villar', email: 'showcase_elena@example.com', bio: 'Premium one-on-one tutoring. Customized learning plans for serious students.', subjects: ['Medicine', 'Biology', 'Organic Chemistry'], hourly_rate: 250, rating_avg: 4.9 },
  // Lowest rated - min rating filter showcase
  { first: 'Frank', last: 'Lim', email: 'showcase_frank@example.com', bio: 'Getting started as a tutor. Happy to help with introductory topics.', subjects: ['History', 'English'], hourly_rate: 15, rating_avg: 3.2 },
  // Mid-high, top rated
  { first: 'Grace', last: 'Torres', email: 'showcase_grace@example.com', bio: 'Consistently top-rated. Great for students aiming for academic excellence.', subjects: ['Mathematics', 'Physics', 'Programming'], hourly_rate: 95, rating_avg: 4.9 },
];

const insertUser = db.prepare('INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
const insertProfile = db.prepare('INSERT INTO tutor_profiles (user_id, bio, subjects, hourly_rate, rating_avg) VALUES (?, ?, ?, ?, ?)');
const getLastId = () => db.prepare('SELECT last_insert_rowid() as id').get();

const run = db.transaction(() => {
  let added = 0;
  for (const t of showcaseTutors) {
    try {
      insertUser.run(t.first, t.last, t.email, 'hashed_password', 'tutor');
      const { id } = getLastId();
      insertProfile.run(id, t.bio, JSON.stringify(t.subjects), t.hourly_rate, t.rating_avg);
      added++;
      console.log(`Added: ${t.first} ${t.last} (₱${t.hourly_rate}/hr, ${t.rating_avg}★)`);
    } catch (e) {
      if (e.message && e.message.includes('UNIQUE constraint')) {
        console.log(`Skipped (exists): ${t.first} ${t.last}`);
      } else {
        throw e;
      }
    }
  }
  return added;
});

const added = run();
console.log(`\nDone. ${added} showcase tutor(s) added.`);
