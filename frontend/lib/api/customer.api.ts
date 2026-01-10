import apiClient from './client';
import type { Customer, CustomersResponse, CustomerWithMetrics } from '@/types/customer';
import type { Appointment } from '@/types/appointment';
import type { Invoice } from '@/types/invoice';
import type { CustomerFormData } from '@/lib/validations/customer.schema';

interface GetCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const customersApi = {
  getCustomers: async (params?: GetCustomersParams) => {
    const response = await apiClient.get<CustomersResponse>('/customers', { params });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await apiClient.get<CustomerWithMetrics>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: CustomerFormData) => {
    const response = await apiClient.post<{ message: string; customer: Customer }>('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: CustomerFormData) => {
    const response = await apiClient.put<{ message: string; customer: Customer }>(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/customers/${id}`);
    return response.data;
  },

  getCustomerAppointments: async (id: string, params?: { status?: string; limit?: number }) => {
    const response = await apiClient.get<{ appointments: Appointment[] }>(`/customers/${id}/appointments`, { params });
    return response.data;
  },

  getCustomerInvoices: async (id: string, params?: { payment_status?: string; limit?: number }) => {
    const response = await apiClient.get<{ invoices: Invoice[] }>(`/customers/${id}/invoices`, { params });
    return response.data;
  },
};
