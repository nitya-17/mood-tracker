import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// Middleware to verify internal secret token for background jobs
function verifyJobSecret(req, res, next) {
  const jobSecret = process.env.JOB_SECRET || 'dev_job_secret';
  const clientSecret = req.headers['x-job-secret'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!clientSecret || clientSecret !== jobSecret) {
    return res.status(403).json({ error: 'Unauthorized: Invalid or missing job secret token' });
  }
  next();
}

// POST /jobs/reminders - Triggered by external cron (Render cron, GitHub Actions, or local runner)
router.post('/reminders', verifyJobSecret, async (req, res, next) => {
  try {
    // Find users with reminders enabled who have NOT logged today in their own timezone
    const pendingRes = await query(
      `SELECT u.id, u.email, u.name, u.timezone, r.time_of_day, r.channel
       FROM users u
       JOIN reminders r ON r.user_id = u.id AND r.enabled = true
       WHERE NOT EXISTS (
         SELECT 1 FROM mood_entries e
         WHERE e.user_id = u.id
         AND e.entry_date = (NOW() AT TIME ZONE COALESCE(u.timezone, 'UTC'))::date
       );`
    );

    const pendingUsers = pendingRes.rows;
    console.log(`[Job:Reminders] Found ${pendingUsers.length} users due for a reminder.`);

    const notificationsSent = [];

    for (const u of pendingUsers) {
      // Simulation of email / push notification dispatch
      console.log(`[Job:Reminders] 📬 Reminder dispatched to ${u.email} (${u.name}) via ${u.channel} (TZ: ${u.timezone})`);
      notificationsSent.push({
        user_id: u.id,
        email: u.email,
        channel: u.channel,
        status: 'dispatched'
      });
    }

    res.json({
      status: 'success',
      reminders_processed: pendingUsers.length,
      notifications: notificationsSent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// POST /jobs/retention - Roll up historical data into weekly_summaries
router.post('/retention', verifyJobSecret, async (req, res, next) => {
  try {
    const cutoffDays = 365;

    // 1. Aggregate old entries into weekly_summaries
    const rollupRes = await query(
      `INSERT INTO weekly_summaries (user_id, week_start, avg_mood, avg_sleep, entry_count)
       SELECT user_id,
              date_trunc('week', entry_date)::date AS week_start,
              ROUND(AVG(mood)::numeric, 2) AS avg_mood,
              ROUND(AVG(sleep_hours)::numeric, 2) AS avg_sleep,
              COUNT(*)::int AS entry_count
       FROM mood_entries
       WHERE entry_date < (CURRENT_DATE - INTERVAL '${cutoffDays} days')
       GROUP BY user_id, date_trunc('week', entry_date)::date
       ON CONFLICT (user_id, week_start) DO UPDATE
       SET avg_mood = EXCLUDED.avg_mood,
           avg_sleep = EXCLUDED.avg_sleep,
           entry_count = EXCLUDED.entry_count
       RETURNING id;`
    );

    // 2. Optionally delete archived entries
    const deleteRes = await query(
      `DELETE FROM mood_entries
       WHERE entry_date < (CURRENT_DATE - INTERVAL '${cutoffDays} days')
       RETURNING id;`
    );

    res.json({
      status: 'success',
      summaries_created: rollupRes.rowCount,
      entries_archived: deleteRes.rowCount,
      policy: `Entries older than ${cutoffDays} days rolled up to weekly summaries.`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
