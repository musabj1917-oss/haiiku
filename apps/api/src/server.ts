import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { env } from './config.js';
import { validateBody, requireAuth } from './middleware/auth.js';
import { registerSchema, loginSchema, googleLinkSchema } from './validation.js';
import { logAuditEvent } from './services/audit.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please slow down.' }
});

app.use('/api/auth', authLimiter);

// 1. Email/Password Registration
app.post('/api/auth/register', validateBody(registerSchema), async (req, res) => {
  const { email, password, firstName, lastName, dateOfBirth } = req.body;

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query<{ id: string; email: string; first_name: string; last_name: string }>(
      `INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name`,
      [email, passwordHash, firstName, lastName, dateOfBirth]
    );

    const user = result[0];
    await logAuditEvent(user.id, 'user.registered', 'user', user.id, { provider: 'email' });

    const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

// 2. Email/Password Login
app.post('/api/auth/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await query<{ id: string; email: string; password_hash: string | null; first_name: string; last_name: string }>(
      'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (users.length === 0 || !users[0].password_hash) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = users[0];
    const valid = user.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    await logAuditEvent(user.id, 'user.login', 'user', user.id, { provider: 'email' });
    const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// 3. Google OAuth Link / Authentication
app.post('/api/auth/google', validateBody(googleLinkSchema), async (req, res) => {
  const { googleUserId, email, firstName, lastName, dateOfBirth } = req.body;

  try {
    const existingProvider = await query<{ user_id: string }>(
      'SELECT user_id FROM auth_providers WHERE provider = $1 AND provider_user_id = $2',
      ['google', googleUserId]
    );

    let userId: string;

    if (existingProvider.length > 0) {
      userId = existingProvider[0].user_id;
    } else {
      const existingUser = await query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        if (!dateOfBirth) {
          return res.status(400).json({ error: 'Date of birth is required for new registration.' });
        }

        const newUser = await query<{ id: string }>(
          `INSERT INTO users (email, first_name, last_name, date_of_birth, is_verified)
           VALUES ($1, $2, $3, $4, TRUE)
           RETURNING id`,
          [email, firstName || 'Google', lastName || 'User', dateOfBirth]
        );
        userId = newUser[0].id;
      }

      await query(
        `INSERT INTO auth_providers (user_id, provider, provider_user_id, email)
         VALUES ($1, 'google', $2, $3)
         ON CONFLICT (provider, provider_user_id) DO NOTHING`,
        [userId, googleUserId, email]
      );
    }

    await logAuditEvent(userId, 'user.google_auth', 'user', userId, { googleUserId });
    const token = jwt.sign({ sub: userId, email }, env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: { id: userId, email }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Google authentication failed.' });
  }
});

// Protected Profile
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const users = await query<{ id: string; email: string; first_name: string; last_name: string; date_of_birth: string }>(
      'SELECT id, email, first_name, last_name, date_of_birth FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: users[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Account Deletion Request
app.post('/api/account/delete', requireAuth, async (req, res) => {
  const { reason } = req.body;
  const userId = req.user?.id;

  try {
    await query(
      `INSERT INTO account_deletion_requests (user_id, status, scheduled_for, reason)
       VALUES ($1, 'requested', NOW() + INTERVAL '30 days', $2)`,
      [userId, reason || 'User requested deletion']
    );

    await logAuditEvent(userId!, 'user.account_deletion_requested', 'user', userId, { reason });

    return res.status(200).json({
      message: 'Account deletion requested. Your account is scheduled for deletion in 30 days.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process account deletion request.' });
  }
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'haiiku-api' });
});

export default app;
