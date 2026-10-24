import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();

    const result = await query(
      `SELECT e.entry_date,
              e.mood,
              e.sleep_hours,
              e.reflection,
              COALESCE(string_agg(f.label, '; '), '') AS feelings,
              e.created_at
       FROM mood_entries e
       LEFT JOIN entry_feelings ef ON e.id = ef.entry_id
       LEFT JOIN feelings f ON ef.feeling_id = f.id
       WHERE e.user_id = $1
       GROUP BY e.id, e.entry_date, e.mood, e.sleep_hours, e.reflection, e.created_at
       ORDER BY e.entry_date DESC;`,
      [req.user.id]
    );

    const entries = result.rows;

    if (format === 'csv') {
      const headers = ['entry_date', 'mood', 'sleep_hours', 'feelings', 'reflection', 'created_at'];
      const csvRows = [headers.join(',')];

      for (const row of entries) {
        const escapedReflection = `"${(row.reflection || '').replace(/"/g, '""')}"`;
        const escapedFeelings = `"${(row.feelings || '').replace(/"/g, '""')}"`;
        csvRows.push([
          row.entry_date.toISOString ? row.entry_date.toISOString().split('T')[0] : row.entry_date,
          row.mood,
          row.sleep_hours,
          escapedFeelings,
          escapedReflection,
          row.created_at
        ].join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mood_entries_export.csv"');
      return res.send(csvRows.join('\n'));
    }

    res.json(entries);
  } catch (error) {
    next(error);
  }
});

export default router;
