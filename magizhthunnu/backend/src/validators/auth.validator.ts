import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z
      .string()
      .email()
      .refine((v) => v.toLowerCase().endsWith('@mapyapps.com'), {
        message: 'Email must be a @mapyapps.com address',
      }),
    password: z.string().min(8).max(72),
    mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    role: z.enum(['customer', 'restaurant']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});
