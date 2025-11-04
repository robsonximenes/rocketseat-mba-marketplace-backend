import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
