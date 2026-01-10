import { Customer } from './customer';
import { Appointment } from './appointment';

export interface InvoiceLineItem {
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid';

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string | Customer;
  appointment_id?: string | Appointment;
  issue_date: string;
  due_date?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_status: PaymentStatus;
  paid_amount: number;
  payment_date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
