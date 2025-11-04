import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priceCents: z.number().int().positive(),
  categoryId: z.string().uuid(),
  imageIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
