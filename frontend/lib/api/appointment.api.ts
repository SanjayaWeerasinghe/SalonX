import apiClient from './client';
import type { Appointment, AppointmentsResponse } from '@/types/appointment';
import type { AppointmentFormData } from '@/lib/validations/appointment.schema';

interface GetAppointmentsParams {
  status?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

interface GetCalendarViewParams {
  start_date: string;
  end_date: string;
}

export const appointmentsApi = {
  getAppointments: async (params?: GetAppointmentsParams) => {
    const response = await apiClient.get<AppointmentsResponse>('/appointments', { params });
    return response.data;
  },

  getAppointment: async (id: string) => {
    const response = await apiClient.get<{ appointment: Appointment }>(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: AppointmentFormData) => {
    const response = await apiClient.post<{ message: string; appointment: Appointment }>('/appointments', data);
    return response.data;
  },

  updateAppointment: async (id: string, data: Partial<AppointmentFormData>) => {
    const response = await apiClient.put<{ message: string; appointment: Appointment }>(`/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id: string, sendEmail: boolean = true) => {
    const response = await apiClient.post<{ message: string; appointment: Appointment }>(`/appointments/${id}/cancel`, {
      send_email: sendEmail,
    });
    return response.data;
  },

  deleteAppointment: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/appointments/${id}`);
    return response.data;
  },

  getCalendarView: async (params: GetCalendarViewParams) => {
    const response = await apiClient.get<{ appointments: Appointment[] }>('/appointments/calendar', { params });
    return response.data;
  },
};
