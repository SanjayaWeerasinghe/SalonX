import apiClient from './client';

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'stylist' | 'manager' | 'receptionist' | 'other';
  specialties?: string[];
  hire_date?: string;
  is_active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: 'stylist' | 'manager' | 'receptionist' | 'other';
  specialties?: string[];
  hire_date?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateStaffInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: 'stylist' | 'manager' | 'receptionist' | 'other';
  specialties?: string[];
  hire_date?: string;
  is_active?: boolean;
  notes?: string;
}

export interface GetStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  role?: string;
}

export interface GetStaffResponse {
  staff: Staff[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const staffApi = {
  getStaff: async (params?: GetStaffParams) => {
    const response = await apiClient.get<GetStaffResponse>('/staff', { params });
    return response.data;
  },

  getStaffById: async (id: string) => {
    const response = await apiClient.get<{ staff: Staff }>(`/staff/${id}`);
    return response.data;
  },

  createStaff: async (data: CreateStaffInput) => {
    const response = await apiClient.post<{ message: string; staff: Staff }>('/staff', data);
    return response.data;
  },

  updateStaff: async (id: string, data: UpdateStaffInput) => {
    const response = await apiClient.put<{ message: string; staff: Staff }>(`/staff/${id}`, data);
    return response.data;
  },

  deleteStaff: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/staff/${id}`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await apiClient.patch<{ message: string; staff: Staff }>(`/staff/${id}/toggle-active`);
    return response.data;
  },
};
