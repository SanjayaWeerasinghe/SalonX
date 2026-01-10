export interface DashboardOverview {
  period: {
    start: string;
    end: string;
  };
  customers: {
    total: number;
    new: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
  invoices: {
    total: number;
    paid: number;
    unpaid: number;
  };
  services: {
    active: number;
  };
}

export interface RevenueChartData {
  date: string;
  total: number;
  paid: number;
  invoices: number;
}

export interface AppointmentStatsByStatus {
  status: string;
  count: number;
}

export interface AppointmentStatsByDate {
  date: string;
  count: number;
}

export interface AppointmentStats {
  period: {
    start: string;
    end: string;
  };
  byStatus: AppointmentStatsByStatus[];
  byDate: AppointmentStatsByDate[];
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_revenue: number;
  invoice_count: number;
  paid_amount: number;
}

export interface PopularService {
  service_id: string;
  service_name: string;
  current_price: number;
  booking_count: number;
  total_revenue: number;
}

export interface RecentActivity {
  type: 'appointment' | 'invoice';
  id: string;
  customer: string;
  date?: string;
  status?: string;
  invoice_number?: string;
  amount?: number;
  payment_status?: string;
  createdAt: string;
}
