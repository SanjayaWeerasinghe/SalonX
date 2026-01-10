import { z } from 'zod';

export const lineItemSchema = z.object({
  service_id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  unit_price: z.number().min(0, 'Unit price must be greater than or equal to 0'),
});

export const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  appointment_id: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  tax: z.number().min(0, 'Tax must be greater than or equal to 0').default(0),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type LineItemFormData = z.infer<typeof lineItemSchema>;
export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;
