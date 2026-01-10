import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').trim(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  duration_minutes: z.number().min(0, 'Duration must be greater than or equal to 0').optional(),
  is_active: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
