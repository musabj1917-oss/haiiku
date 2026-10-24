import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { validateBody, requireAuth } from './middleware/auth.js';
import { googleLinkSchema, registerSchema } from './validation.js';

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

app.post('/api/auth/register', validateBody(registerSchema), (req, res) => {
  const payload = req.body;

  return res.status(201).json({
    message: 'User registered.',
    accepted: true,
    user: {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth: payload.dateOfBirth
    }
  });
});

app.post('/api/auth/google', validateBody(googleLinkSchema), (req, res) => {
  const { googleUserId, email } = req.body;

  return res.status(200).json({
    message: 'Google identity accepted.',
    provider: 'google',
    googleUserId,
    email
  });
});

app.get('/api/me', requireAuth, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user?.id,
      email: req.user?.email
    }
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'haiiku-api' });
});

export default app;
