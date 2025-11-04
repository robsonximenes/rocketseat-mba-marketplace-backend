import { z } from 'zod';

export const updateProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  priceCents: z.number().int().positive().optional(),
  categoryId: z.string().uuid().optional(),
  imageIds: z.array(z.string().uuid()).optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
