import apiClient from './client';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  metrics?: {
    total_appointments: number;
    total_revenue: number;
    last_visit?: string;
  };
}

export interface CreateCustomerInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCustomersResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const customersApi = {
  getCustomers: async (params?: GetCustomersParams) => {
    const response = await apiClient.get<GetCustomersResponse>('/customers', { params });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await apiClient.get<{ customer: Customer }>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: CreateCustomerInput) => {
    const response = await apiClient.post<{ message: string; customer: Customer }>('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerInput) => {
    const response = await apiClient.put<{ message: string; customer: Customer }>(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/customers/${id}`);
    return response.data;
  },
};
