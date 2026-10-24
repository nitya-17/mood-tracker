import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool, query } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  const seedSqlPath = path.resolve(__dirname, '../../../db/seed.sql');
  console.log(`Reading base seed from: ${seedSqlPath}`);

  try {
    // 1. Run seed.sql for feelings and quotes
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    await query(seedSql);
    console.log('✅ Base seed data (feelings & quotes) applied.');

    // 2. Upsert Demo User
    const demoEmail = 'demo@moodtracker.app';
    const demoPassword = 'password123';
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const demoName = 'Demo Explorer';
    const demoAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoExplorer';
    const demoTimezone = 'UTC';

    const userRes = await query(
      `INSERT INTO users (email, password_hash, name, avatar_url, timezone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url
       RETURNING id;`,
      [demoEmail, passwordHash, demoName, demoAvatar, demoTimezone]
    );

    const demoUserId = userRes.rows[0].id;
    console.log(`✅ Demo user created/updated with ID: ${demoUserId}`);

    // Set reminder preference for demo user
    await query(
      `INSERT INTO reminders (user_id, time_of_day, enabled, channel)
       VALUES ($1, '20:30:00', true, 'email')
       ON CONFLICT (user_id) DO NOTHING;`,
      [demoUserId]
    );

    // Fetch feelings for reference
    const feelingsRes = await query('SELECT id, label FROM feelings ORDER BY id;');
    const feelingsList = feelingsRes.rows;

    // 3. Generate ~30 days of past entries with realistic patterns and deliberate gaps
    console.log('Generating 30 days of realistic time-series check-ins with gaps...');

    const reflections = [
      'Had a deeply productive morning and caught up on deep work. Went for a brisk walk at sunset.',
      'Felt a bit low on energy today. Took things slow and had hot tea while reading.',
      'Slept poorly due to noise. Struggled with focus in the afternoon, but made it through.',
      'Wonderful dinner with friends! Feeling so connected, grounded, and grateful.',
      'High pressure sprint at work today. Meditation helped manage stress in the evening.',
      'Quiet and peaceful Saturday. Spent time sketching and listening to jazz.',
      'Felt energized after an intense gym session. Mind felt sharp all afternoon.',
      'A bit anxious about upcoming deadlines, but broke the tasks into smaller chunks.',
      'Regular day, steady pace. Kept up with hydration and took regular screen breaks.',
      'Woke up early, watched the sunrise, and felt overwhelming peace and clarity.'
    ];

    const today = new Date();

    for (let i = 28; i >= 0; i--) {
      // Deliberate gaps: skip days 6, 14, 21 to create natural time-series gaps
      if (i === 6 || i === 14 || i === 21) {
        continue;
      }

      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const entryDate = d.toISOString().split('T')[0];

      // Realistic pseudo-random mood (weighted between 2 and 5)
      const dayOfWeek = d.getDay();
      let mood = 3;
      let sleep = 7.0;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekends typically higher mood & sleep
        mood = Math.random() > 0.3 ? 4 : 5;
        sleep = Number((7.5 + Math.random() * 1.5).toFixed(1));
      } else if (dayOfWeek === 1) {
        // Monday blues
        mood = Math.random() > 0.5 ? 2 : 3;
        sleep = Number((5.5 + Math.random() * 1.5).toFixed(1));
      } else {
        mood = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
        sleep = Number((6.0 + Math.random() * 2.0).toFixed(1));
      }

      const reflection = reflections[i % reflections.length];

      // Insert mood entry
      const entryInsert = await query(
        `INSERT INTO mood_entries (user_id, entry_date, mood, sleep_hours, reflection)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, entry_date) DO UPDATE
         SET mood = EXCLUDED.mood,
             sleep_hours = EXCLUDED.sleep_hours,
             reflection = EXCLUDED.reflection
         RETURNING id;`,
        [demoUserId, entryDate, mood, sleep, reflection]
      );

      const entryId = entryInsert.rows[0].id;

      // Assign 1-3 feelings based on mood
      const selectedFeelings = [];
      if (mood >= 4) {
        selectedFeelings.push(
          feelingsList.find((f) => f.label === 'Happy')?.id,
          feelingsList.find((f) => f.label === 'Grateful')?.id
        );
      } else if (mood === 3) {
        selectedFeelings.push(
          feelingsList.find((f) => f.label === 'Calm')?.id,
          feelingsList.find((f) => f.label === 'Neutral')?.id
        );
      } else {
        selectedFeelings.push(
          feelingsList.find((f) => f.label === 'Tired')?.id,
          feelingsList.find((f) => f.label === 'Stressed')?.id
        );
      }

      for (const fId of selectedFeelings.filter(Boolean)) {
        await query(
          `INSERT INTO entry_feelings (entry_id, feeling_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [entryId, fId]
        );
      }
    }

    console.log('✅ Demo entries seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('🎉 Seeding complete. Demo credentials:');
    console.log(`   Email:    ${demoEmail}`);
    console.log(`   Password: ${demoPassword}`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedDatabase();
