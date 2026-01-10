import apiClient from './client';
import type {
  DashboardOverview,
  RevenueChartData,
  AppointmentStats,
  TopCustomer,
  PopularService,
  RecentActivity,
} from '@/types/dashboard';

interface DateRangeParams {
  date_from?: string;
  date_to?: string;
}

interface RevenueChartParams extends DateRangeParams {
  period?: 'week' | 'month' | 'year';
}

interface TopListParams extends DateRangeParams {
  limit?: number;
}

export const dashboardApi = {
  getOverview: async (params?: DateRangeParams) => {
    const response = await apiClient.get<DashboardOverview>('/dashboard/overview', { params });
    return response.data;
  },

  getRevenueChart: async (params?: RevenueChartParams) => {
    const response = await apiClient.get<{
      period: { start: string; end: string };
      data: RevenueChartData[];
    }>('/dashboard/revenue-chart', { params });
    return response.data;
  },

  getAppointmentStats: async (params?: DateRangeParams) => {
    const response = await apiClient.get<AppointmentStats>('/dashboard/appointment-stats', { params });
    return response.data;
  },

  getTopCustomers: async (params?: TopListParams) => {
    const response = await apiClient.get<{ customers: TopCustomer[] }>('/dashboard/top-customers', { params });
    return response.data;
  },

  getPopularServices: async (params?: TopListParams) => {
    const response = await apiClient.get<{ services: PopularService[] }>('/dashboard/popular-services', { params });
    return response.data;
  },

  getRecentActivity: async (limit: number = 20) => {
    const response = await apiClient.get<{ activities: RecentActivity[] }>('/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data;
  },
};
