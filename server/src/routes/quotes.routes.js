import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// GET /quotes?mood=3
router.get('/', async (req, res, next) => {
  try {
    const moodParam = req.query.mood;
    let sql = 'SELECT id, mood_level, text, author FROM quotes';
    const params = [];

    if (moodParam) {
      const mood = parseInt(moodParam, 10);
      if (mood >= 1 && mood <= 5) {
        sql += ' WHERE mood_level = $1';
        params.push(mood);
      }
    }

    sql += ' ORDER BY RANDOM() LIMIT 1;';

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.json({
        id: 0,
        mood_level: 3,
        text: 'Every day is a fresh beginning. Take a deep breath and start again.',
        author: 'Unknown'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
