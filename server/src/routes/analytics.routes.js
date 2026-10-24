import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /analytics/compare - Last 5 vs. Previous 5 check-ins
router.get('/compare', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      `WITH ranked AS (
         SELECT mood, sleep_hours,
                ROW_NUMBER() OVER (ORDER BY entry_date DESC) AS rn
         FROM mood_entries
         WHERE user_id = $1
       )
       SELECT
         ROUND(AVG(mood)        FILTER (WHERE rn BETWEEN 1 AND 5)::numeric, 2)  AS mood_recent,
         ROUND(AVG(mood)        FILTER (WHERE rn BETWEEN 6 AND 10)::numeric, 2) AS mood_previous,
         ROUND(AVG(sleep_hours) FILTER (WHERE rn BETWEEN 1 AND 5)::numeric, 2)  AS sleep_recent,
         ROUND(AVG(sleep_hours) FILTER (WHERE rn BETWEEN 6 AND 10)::numeric, 2) AS sleep_previous,
         COUNT(*) FILTER (WHERE rn BETWEEN 1 AND 5)::int  AS count_recent,
         COUNT(*) FILTER (WHERE rn BETWEEN 6 AND 10)::int AS count_previous
       FROM ranked;`,
      [req.user.id]
    );

    const data = result.rows[0] || {};
    const moodRecent = data.mood_recent !== null ? parseFloat(data.mood_recent) : null;
    const moodPrevious = data.mood_previous !== null ? parseFloat(data.mood_previous) : null;
    const sleepRecent = data.sleep_recent !== null ? parseFloat(data.sleep_recent) : null;
    const sleepPrevious = data.sleep_previous !== null ? parseFloat(data.sleep_previous) : null;

    const moodDiff = moodRecent !== null && moodPrevious !== null
      ? parseFloat((moodRecent - moodPrevious).toFixed(2))
      : null;

    const sleepDiff = sleepRecent !== null && sleepPrevious !== null
      ? parseFloat((sleepRecent - sleepPrevious).toFixed(2))
      : null;

    res.json({
      mood: {
        recent: moodRecent,
        previous: moodPrevious,
        diff: moodDiff,
        trend: moodDiff > 0 ? 'up' : moodDiff < 0 ? 'down' : 'neutral',
        count_recent: data.count_recent,
        count_previous: data.count_previous,
      },
      sleep: {
        recent: sleepRecent,
        previous: sleepPrevious,
        diff: sleepDiff,
        trend: sleepDiff > 0 ? 'up' : sleepDiff < 0 ? 'down' : 'neutral',
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /analytics/rolling - 5-entry moving average
router.get('/rolling', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT entry_date, mood, sleep_hours,
         ROUND(AVG(mood) OVER (
           ORDER BY entry_date
           ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
         )::numeric, 2) AS rolling_mood_avg,
         ROUND(AVG(sleep_hours) OVER (
           ORDER BY entry_date
           ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
         )::numeric, 2) AS rolling_sleep_avg
       FROM mood_entries
       WHERE user_id = $1
       ORDER BY entry_date ASC;`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /analytics/streaks - Gaps and islands streak calculation
router.get('/streaks', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      `WITH groups AS (
         SELECT entry_date,
                entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS grp
         FROM mood_entries
         WHERE user_id = $1
       ),
       streaks AS (
         SELECT MIN(entry_date) AS streak_start,
                MAX(entry_date) AS streak_end,
                COUNT(*)::int   AS days
         FROM groups
         GROUP BY grp
       )
       SELECT streak_start, streak_end, days
       FROM streaks
       ORDER BY streak_end DESC;`,
      [req.user.id]
    );

    const streaks = result.rows;
    const longestStreak = streaks.length > 0 ? Math.max(...streaks.map((s) => s.days)) : 0;

    // Check if the most recent streak is currently active (today or yesterday)
    let currentStreak = 0;
    if (streaks.length > 0) {
      const latestEnd = new Date(streaks[0].streak_end);
      const today = new Date();
      const diffDays = Math.floor((today - latestEnd) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        currentStreak = streaks[0].days;
      }
    }

    res.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      history: streaks
    });
  } catch (error) {
    next(error);
  }
});

// GET /analytics/patterns - Day of week patterns
router.get('/patterns', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT EXTRACT(DOW FROM entry_date)::int AS dow,
              ROUND(AVG(mood)::numeric, 2) AS avg_mood,
              ROUND(AVG(sleep_hours)::numeric, 2) AS avg_sleep,
              COUNT(*)::int AS total_entries
       FROM mood_entries
       WHERE user_id = $1
       GROUP BY dow
       ORDER BY dow ASC;`,
      [req.user.id]
    );

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatted = result.rows.map((row) => ({
      dow: row.dow,
      day_name: dayNames[row.dow],
      avg_mood: parseFloat(row.avg_mood),
      avg_sleep: parseFloat(row.avg_sleep),
      total_entries: row.total_entries
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// GET /analytics/correlation - Pearson correlation between mood and sleep
router.get('/correlation', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ROUND(CORR(mood, sleep_hours)::numeric, 3) AS correlation,
              COUNT(*)::int AS total_entries
       FROM mood_entries
       WHERE user_id = $1;`,
      [req.user.id]
    );

    const row = result.rows[0];
    const correlation = row.correlation !== null ? parseFloat(row.correlation) : null;

    let insight = 'Log more check-ins to unlock statistical correlation between sleep and mood.';
    if (correlation !== null) {
      if (correlation >= 0.5) {
        insight = 'Strong positive correlation: Higher sleep hours are strongly linked to elevated moods.';
      } else if (correlation > 0.2) {
        insight = 'Moderate positive link: Getting restful sleep tends to lift your daily mood.';
      } else if (correlation >= -0.2) {
        insight = 'Neutral link: Your mood and sleep show varied independence right now.';
      } else {
        insight = 'Negative correlation: Longer sleep does not correlate with better mood for you.';
      }
    }

    res.json({
      correlation,
      total_entries: row.total_entries,
      insight
    });
  } catch (error) {
    next(error);
  }
});

export default router;
