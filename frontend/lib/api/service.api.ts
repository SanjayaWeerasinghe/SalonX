import apiClient from './client';
import type { Service, ServicesResponse } from '@/types/service';
import type { ServiceFormData } from '@/lib/validations/service.schema';

interface GetServicesParams {
  is_active?: boolean;
  search?: string;
}

export const servicesApi = {
  getServices: async (params?: GetServicesParams) => {
    const response = await apiClient.get<ServicesResponse>('/services', { params });
    return response.data;
  },

  getService: async (id: string) => {
    const response = await apiClient.get<{ service: Service }>(`/services/${id}`);
    return response.data;
  },

  createService: async (data: ServiceFormData) => {
    const response = await apiClient.post<{ message: string; service: Service }>('/services', data);
    return response.data;
  },

  updateService: async (id: string, data: ServiceFormData) => {
    const response = await apiClient.put<{ message: string; service: Service }>(`/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string, hardDelete: boolean = false) => {
    const response = await apiClient.delete<{ message: string; service?: Service }>(`/services/${id}`, {
      params: { hard_delete: hardDelete },
    });
    return response.data;
  },

  activateService: async (id: string) => {
    const response = await apiClient.post<{ message: string; service: Service }>(`/services/${id}/activate`);
    return response.data;
  },
};
