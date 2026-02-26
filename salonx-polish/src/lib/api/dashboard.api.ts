import apiClient from './client';

export interface DashboardOverview {
  total_customers: number;
  new_customers_this_month: number;
  total_appointments: number;
  upcoming_appointments: number;
  total_revenue: number;
  revenue_paid: number;
  revenue_pending: number;
  total_invoices: number;
  unpaid_invoices: number;
}

export interface RevenueDataPoint {
  date: string;
  total_revenue: number;
  paid_revenue: number;
}

export interface AppointmentStats {
  status: string;
  count: number;
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  email?: string;
  total_revenue: number;
  invoice_count: number;
}

export interface PopularService {
  service_id: string;
  service_name: string;
  booking_count: number;
  total_revenue: number;
}

export interface DashboardParams {
  date_from?: string;
  date_to?: string;
}

export const dashboardApi = {
  getOverview: async (params?: DashboardParams) => {
    const response = await apiClient.get<{ overview: DashboardOverview }>('/dashboard/overview', { params });
    return response.data;
  },

  getRevenueChart: async (params?: DashboardParams) => {
    const response = await apiClient.get<{ revenue: RevenueDataPoint[] }>('/dashboard/revenue-chart', { params });
    return response.data;
  },

  getAppointmentStats: async (params?: DashboardParams) => {
    const response = await apiClient.get<{ stats: AppointmentStats[] }>('/dashboard/appointment-stats', { params });
    return response.data;
  },

  getTopCustomers: async (params?: DashboardParams & { limit?: number }) => {
    const response = await apiClient.get<{ customers: TopCustomer[] }>('/dashboard/top-customers', { params });
    return response.data;
  },

  getPopularServices: async (params?: DashboardParams & { limit?: number }) => {
    const response = await apiClient.get<{ services: PopularService[] }>('/dashboard/popular-services', { params });
    return response.data;
  },
};
