import apiClient from './client';
import type { Invoice, InvoicesResponse } from '@/types/invoice';
import type { InvoiceFormData, RecordPaymentFormData } from '@/lib/validations/invoice.schema';

interface GetInvoicesParams {
  customer_id?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

interface CreateFromAppointmentData {
  tax?: number;
  due_date?: string;
  notes?: string;
}

export const invoicesApi = {
  getInvoices: async (params?: GetInvoicesParams) => {
    const response = await apiClient.get<InvoicesResponse>('/invoices', { params });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await apiClient.get<{ invoice: Invoice }>(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: InvoiceFormData) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>('/invoices', data);
    return response.data;
  },

  createFromAppointment: async (appointmentId: string, data?: CreateFromAppointmentData) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>(
      `/invoices/from-appointment/${appointmentId}`,
      data
    );
    return response.data;
  },

  updateInvoice: async (id: string, data: Partial<InvoiceFormData>) => {
    const response = await apiClient.put<{ message: string; invoice: Invoice }>(`/invoices/${id}`, data);
    return response.data;
  },

  recordPayment: async (id: string, data: RecordPaymentFormData) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>(`/invoices/${id}/payment`, data);
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/invoices/${id}`);
    return response.data;
  },
};
