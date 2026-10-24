import { Router } from 'express';
import { z } from 'zod';
import { pool, query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schema for creating a check-in
const createEntrySchema = z.object({
  mood: z.number().int().min(1, 'Mood must be at least 1').max(5, 'Mood cannot exceed 5'),
  sleep_hours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24'),
  reflection: z.string().trim().min(1, 'Reflection cannot be empty').max(500, 'Reflection cannot exceed 500 characters'),
  feelings: z.array(z.number().int()).min(1, 'Please select at least one feeling tag'),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD').optional(),
});

// Helper to compute user's today date in their timezone
function getTodayInTimezone(timezone = 'UTC') {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// POST /entries - Create or submit check-in
router.post('/', authenticateToken, validate(createEntrySchema), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { mood, sleep_hours, reflection, feelings, entry_date } = req.body;
    const targetDate = entry_date || getTodayInTimezone(req.user.timezone);

    await client.query('BEGIN');

    // 1. Insert mood entry
    const entryRes = await client.query(
      `INSERT INTO mood_entries (user_id, entry_date, mood, sleep_hours, reflection)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, entry_date, mood, sleep_hours, reflection, created_at;`,
      [req.user.id, targetDate, mood, sleep_hours, reflection]
    );

    const newEntry = entryRes.rows[0];

    // 2. Insert feelings junction
    for (const feelingId of feelings) {
      await client.query(
        `INSERT INTO entry_feelings (entry_id, feeling_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING;`,
        [newEntry.id, feelingId]
      );
    }

    await client.query('COMMIT');

    // 3. Fetch feelings details
    const feelingsRes = await client.query(
      `SELECT f.id, f.label
       FROM entry_feelings ef
       JOIN feelings f ON ef.feeling_id = f.id
       WHERE ef.entry_id = $1;`,
      [newEntry.id]
    );

    newEntry.feelings = feelingsRes.rows;
    res.status(201).json(newEntry);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// GET /entries/today - Get today's check-in for the current user
router.get('/today', authenticateToken, async (req, res, next) => {
  try {
    const todayDate = getTodayInTimezone(req.user.timezone);

    const entryRes = await query(
      `SELECT e.id, e.user_id, e.entry_date, e.mood, e.sleep_hours, e.reflection, e.created_at,
              COALESCE(
                json_agg(
                  json_build_object('id', f.id, 'label', f.label)
                ) FILTER (WHERE f.id IS NOT NULL),
                '[]'
              ) AS feelings
       FROM mood_entries e
       LEFT JOIN entry_feelings ef ON e.id = ef.entry_id
       LEFT JOIN feelings f ON ef.feeling_id = f.id
       WHERE e.user_id = $1 AND e.entry_date = $2
       GROUP BY e.id;`,
      [req.user.id, todayDate]
    );

    if (entryRes.rows.length === 0) {
      return res.json({ entry: null, today_date: todayDate });
    }

    res.json({ entry: entryRes.rows[0], today_date: todayDate });
  } catch (error) {
    next(error);
  }
});

// GET /entries - Query entries (with limit, range, or missing day gap handling)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { limit, from, to, granularity = 'daily', include_gaps = 'false' } = req.query;

    // A. Weekly Aggregation
    if (granularity === 'weekly' && from && to) {
      const weeklyRes = await query(
        `SELECT date_trunc('week', entry_date)::date AS period_date,
                ROUND(AVG(mood)::numeric, 2) AS avg_mood,
                ROUND(AVG(sleep_hours)::numeric, 2) AS avg_sleep,
                COUNT(*)::int AS entry_count
         FROM mood_entries
         WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
         GROUP BY period_date
         ORDER BY period_date ASC;`,
        [req.user.id, from, to]
      );
      return res.json(weeklyRes.rows);
    }

    // B. Monthly Aggregation
    if (granularity === 'monthly' && from && to) {
      const monthlyRes = await query(
        `SELECT date_trunc('month', entry_date)::date AS period_date,
                ROUND(AVG(mood)::numeric, 2) AS avg_mood,
                ROUND(AVG(sleep_hours)::numeric, 2) AS avg_sleep,
                COUNT(*)::int AS entry_count
         FROM mood_entries
         WHERE user_id = $1 AND entry_date BETWEEN $2 AND $3
         GROUP BY period_date
         ORDER BY period_date ASC;`,
        [req.user.id, from, to]
      );
      return res.json(monthlyRes.rows);
    }

    // C. Continuous range with generate_series (gaps preserved as null)
    if (include_gaps === 'true' && from && to) {
      const seriesRes = await query(
        `SELECT d::date AS entry_date,
                e.id,
                e.mood,
                e.sleep_hours,
                e.reflection,
                COALESCE(
                  json_agg(
                    json_build_object('id', f.id, 'label', f.label)
                  ) FILTER (WHERE f.id IS NOT NULL),
                  '[]'
                ) AS feelings
         FROM generate_series($2::date, $3::date, interval '1 day') AS d
         LEFT JOIN mood_entries e ON e.user_id = $1 AND e.entry_date = d::date
         LEFT JOIN entry_feelings ef ON e.id = ef.entry_id
         LEFT JOIN feelings f ON ef.feeling_id = f.id
         GROUP BY d::date, e.id, e.mood, e.sleep_hours, e.reflection
         ORDER BY d::date ASC;`,
        [req.user.id, from, to]
      );
      return res.json(seriesRes.rows);
    }

    // D. Recent entries (e.g. limit=11 for the recent bar chart, ordered chronologically for display)
    if (limit) {
      const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 11, 1), 100);
      const recentRes = await query(
        `WITH recent AS (
           SELECT e.id, e.user_id, e.entry_date, e.mood, e.sleep_hours, e.reflection, e.created_at
           FROM mood_entries e
           WHERE e.user_id = $1
           ORDER BY e.entry_date DESC
           LIMIT $2
         )
         SELECT r.id, r.user_id, r.entry_date, r.mood, r.sleep_hours, r.reflection, r.created_at,
                COALESCE(
                  json_agg(
                    json_build_object('id', f.id, 'label', f.label)
                  ) FILTER (WHERE f.id IS NOT NULL),
                  '[]'
                ) AS feelings
         FROM recent r
         LEFT JOIN entry_feelings ef ON r.id = ef.entry_id
         LEFT JOIN feelings f ON ef.feeling_id = f.id
         GROUP BY r.id, r.user_id, r.entry_date, r.mood, r.sleep_hours, r.reflection, r.created_at
         ORDER BY r.entry_date ASC;`,
        [req.user.id, parsedLimit]
      );
      return res.json(recentRes.rows);
    }

    // E. Default recent 30 entries
    const defaultRes = await query(
      `SELECT e.id, e.user_id, e.entry_date, e.mood, e.sleep_hours, e.reflection, e.created_at,
              COALESCE(
                json_agg(
                  json_build_object('id', f.id, 'label', f.label)
                ) FILTER (WHERE f.id IS NOT NULL),
                '[]'
              ) AS feelings
       FROM mood_entries e
       LEFT JOIN entry_feelings ef ON e.id = ef.entry_id
       LEFT JOIN feelings f ON ef.feeling_id = f.id
       WHERE e.user_id = $1
       GROUP BY e.id
       ORDER BY e.entry_date DESC
       LIMIT 30;`,
      [req.user.id]
    );

    res.json(defaultRes.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
