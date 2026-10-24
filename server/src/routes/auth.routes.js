import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  timezone: z.string().optional().default('UTC'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().or(z.literal('')).optional(),
  timezone: z.string().optional(),
});

const updateReminderSchema = z.object({
  time_of_day: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Invalid time format (HH:MM)'),
  enabled: z.boolean(),
  channel: z.enum(['email', 'push', 'sms']).default('email'),
});

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'dev_fallback_secret_please_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, secret, { expiresIn });
}

// POST /auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, timezone } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const userRes = await query(
      `INSERT INTO users (email, password_hash, name, avatar_url, timezone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, avatar_url, timezone, created_at;`,
      [email.toLowerCase(), passwordHash, name, defaultAvatar, timezone || 'UTC']
    );

    const user = userRes.rows[0];
    const token = generateToken(user.id);

    // Create default reminder
    await query(
      `INSERT INTO reminders (user_id, time_of_day, enabled, channel)
       VALUES ($1, '20:00:00', true, 'email')
       ON CONFLICT (user_id) DO NOTHING;`,
      [user.id]
    );

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userRes = await query(
      'SELECT id, email, password_hash, name, avatar_url, timezone, created_at FROM users WHERE email = $1;',
      [email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    delete user.password_hash;

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// PATCH /auth/me
router.patch('/me', authenticateToken, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, avatar_url, timezone } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      values.push(avatar_url);
    }
    if (timezone !== undefined) {
      updates.push(`timezone = $${idx++}`);
      values.push(timezone);
    }

    if (updates.length === 0) {
      return res.json({ user: req.user });
    }

    values.push(req.user.id);
    const updateQuery = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, email, name, avatar_url, timezone, created_at;
    `;

    const updated = await query(updateQuery, values);
    res.json({ user: updated.rows[0] });
  } catch (error) {
    next(error);
  }
});

// GET /auth/reminders
router.get('/reminders', authenticateToken, async (req, res, next) => {
  try {
    const remRes = await query(
      'SELECT time_of_day, enabled, channel FROM reminders WHERE user_id = $1;',
      [req.user.id]
    );

    if (remRes.rows.length === 0) {
      return res.json({ time_of_day: '20:00:00', enabled: true, channel: 'email' });
    }

    res.json(remRes.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /auth/reminders
router.put('/reminders', authenticateToken, validate(updateReminderSchema), async (req, res, next) => {
  try {
    const { time_of_day, enabled, channel } = req.body;
    const timeFormatted = time_of_day.length === 5 ? `${time_of_day}:00` : time_of_day;

    const remRes = await query(
      `INSERT INTO reminders (user_id, time_of_day, enabled, channel, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET time_of_day = EXCLUDED.time_of_day,
           enabled = EXCLUDED.enabled,
           channel = EXCLUDED.channel,
           updated_at = NOW()
       RETURNING time_of_day, enabled, channel;`,
      [req.user.id, timeFormatted, enabled, channel]
    );

    res.json(remRes.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
