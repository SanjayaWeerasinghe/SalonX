import apiClient from './client';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface GetServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface GetServicesResponse {
  services: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const servicesApi = {
  getServices: async (params?: GetServicesParams) => {
    const response = await apiClient.get<GetServicesResponse>('/services', { params });
    return response.data;
  },

  getService: async (id: string) => {
    const response = await apiClient.get<{ service: Service }>(`/services/${id}`);
    return response.data;
  },

  createService: async (data: CreateServiceInput) => {
    const response = await apiClient.post<{ message: string; service: Service }>('/services', data);
    return response.data;
  },

  updateService: async (id: string, data: UpdateServiceInput) => {
    const response = await apiClient.put<{ message: string; service: Service }>(`/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/services/${id}`);
    return response.data;
  },

  activateService: async (id: string) => {
    const response = await apiClient.patch<{ message: string; service: Service }>(`/services/${id}/activate`);
    return response.data;
  },

  deactivateService: async (id: string) => {
    const response = await apiClient.patch<{ message: string; service: Service }>(`/services/${id}/deactivate`);
    return response.data;
  },
};
