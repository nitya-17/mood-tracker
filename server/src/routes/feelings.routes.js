import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// GET /feelings
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT id, label FROM feelings ORDER BY label ASC;');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
