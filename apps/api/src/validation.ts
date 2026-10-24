import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  dateOfBirth: z.string().refine((value) => {
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return false;

    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      now.getMonth() > dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());

    return age > 13 || (age === 13 && hasBirthdayPassed);
  }, 'You must be at least 13 years old to register.')
});

export const googleLinkSchema = z.object({
  googleUserId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1)
});

export function createUserToken(userId: string, email: string) {
  const payload = {
    sub: userId,
    email,
    jti: randomUUID()
  };

  return payload;
}
