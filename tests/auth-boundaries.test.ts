import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  dateOfBirth: z.string().refine((value) => {
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return false;
    const age = new Date().getFullYear() - dob.getFullYear();
    const monthDelta = new Date().getMonth() - dob.getMonth();
    return age > 13 || (age === 13 && monthDelta >= 0);
  }, 'Age must be 13+')
});

describe('Authentication boundaries', () => {
  it('rejects users under 13', () => {
    const result = registerSchema.safeParse({
      email: 'child@example.com',
      password: 'password123',
      dateOfBirth: '2015-01-01'
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid 13-year-old registrations', () => {
    const result = registerSchema.safeParse({
      email: 'teen@example.com',
      password: 'password123',
      dateOfBirth: '2012-12-31'
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email input', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      dateOfBirth: '2010-01-01'
    });

    expect(result.success).toBe(false);
  });
});
