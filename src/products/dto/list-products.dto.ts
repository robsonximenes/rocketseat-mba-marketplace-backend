import { z } from 'zod';

export const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['AVAILABLE', 'SOLD', 'CANCELED']).optional(),
  q: z.string().optional(),
});

export type ListProductsDto = z.infer<typeof listProductsSchema>;
