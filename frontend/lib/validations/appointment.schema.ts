import { z } from 'zod';

export const appointmentServiceSchema = z.object({
  service_id: z.string().min(1, 'Service is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
});

export const appointmentSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  appointment_date: z.string().min(1, 'Appointment date is required'),
  services: z.array(appointmentServiceSchema).min(1, 'At least one service is required'),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  notes: z.string().optional(),
  send_email: z.boolean().default(true),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type AppointmentServiceFormData = z.infer<typeof appointmentServiceSchema>;
