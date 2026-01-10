import { Customer } from './customer';
import { Service } from './service';
import { User } from './user';

export interface AppointmentService {
  service_id: string | Service;
  quantity: number;
  price_at_time: number;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  customer_id: string | Customer;
  appointment_date: string;
  duration_minutes?: number;
  status: AppointmentStatus;
  services: AppointmentService[];
  notes?: string;
  created_by?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsResponse {
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
  resource: Appointment;
}
