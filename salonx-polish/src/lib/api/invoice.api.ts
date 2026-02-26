import apiClient from './client';
import type { Customer } from './customer.api';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  appointment_id?: string;
  issue_date: string;
  due_date: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  amount_paid: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface CreateInvoiceInput {
  customer_id: string;
  appointment_id?: string;
  issue_date?: string;
  due_date?: string;
  line_items: InvoiceLineItem[];
  tax?: number;
  notes?: string;
}

export interface CreateInvoiceFromAppointmentInput {
  appointment_id: string;
  issue_date?: string;
  due_date?: string;
  tax?: number;
  notes?: string;
}

export interface UpdateInvoiceInput {
  customer_id?: string;
  issue_date?: string;
  due_date?: string;
  line_items?: InvoiceLineItem[];
  tax?: number;
  notes?: string;
}

export interface RecordPaymentInput {
  amount: number;
  payment_date?: string;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface GetInvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const invoicesApi = {
  getInvoices: async (params?: GetInvoicesParams) => {
    const response = await apiClient.get<GetInvoicesResponse>('/invoices', { params });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await apiClient.get<{ invoice: Invoice }>(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceInput) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>('/invoices', data);
    return response.data;
  },

  createFromAppointment: async (data: CreateInvoiceFromAppointmentInput) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>('/invoices/from-appointment', data);
    return response.data;
  },

  updateInvoice: async (id: string, data: UpdateInvoiceInput) => {
    const response = await apiClient.put<{ message: string; invoice: Invoice }>(`/invoices/${id}`, data);
    return response.data;
  },

  recordPayment: async (id: string, data: RecordPaymentInput) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>(`/invoices/${id}/record-payment`, data);
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/invoices/${id}`);
    return response.data;
  },
};
