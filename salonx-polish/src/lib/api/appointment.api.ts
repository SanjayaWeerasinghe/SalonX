import apiClient from './client';
import type { Customer } from './customer.api';
import type { Service } from './service.api';

export interface AppointmentService {
  service_id: string;
  quantity: number;
  service?: Service;
}

export interface Appointment {
  id: string;
  customer_id: string;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  services: AppointmentService[];
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  total_price?: number;
  total_duration?: number;
}

export interface CreateAppointmentInput {
  customer_id: string;
  appointment_date: string;
  services: AppointmentService[];
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  send_email?: boolean;
}

export interface UpdateAppointmentInput {
  customer_id?: string;
  appointment_date?: string;
  services?: AppointmentService[];
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  send_email?: boolean;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface GetAppointmentsResponse {
  appointments: Appointment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CalendarAppointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  customer_name: string;
  services: string[];
}

export const appointmentsApi = {
  getAppointments: async (params?: GetAppointmentsParams) => {
    const response = await apiClient.get<GetAppointmentsResponse>('/appointments', { params });
    return response.data;
  },

  getAppointment: async (id: string) => {
    const response = await apiClient.get<{ appointment: Appointment }>(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: CreateAppointmentInput) => {
    const response = await apiClient.post<{ message: string; appointment: Appointment }>('/appointments', data);
    return response.data;
  },

  updateAppointment: async (id: string, data: UpdateAppointmentInput) => {
    const response = await apiClient.put<{ message: string; appointment: Appointment }>(`/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id: string) => {
    const response = await apiClient.patch<{ message: string; appointment: Appointment }>(`/appointments/${id}/cancel`);
    return response.data;
  },

  deleteAppointment: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/appointments/${id}`);
    return response.data;
  },

  getCalendarView: async (date_from: string, date_to: string) => {
    const response = await apiClient.get<{ appointments: Appointment[] }>('/appointments/calendar-view', {
      params: { date_from, date_to },
    });
    return response.data;
  },
};
