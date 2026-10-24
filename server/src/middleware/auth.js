import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'dev_fallback_secret_please_change_in_production';

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or has expired.' });
    }

    try {
      const userRes = await query(
        'SELECT id, email, name, avatar_url, timezone FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'User no longer exists.' });
      }

      req.user = userRes.rows[0];
      next();
    } catch (dbErr) {
      console.error('Error fetching user during auth:', dbErr);
      return res.status(500).json({ error: 'Authentication database lookup failed.' });
    }
  });
}
