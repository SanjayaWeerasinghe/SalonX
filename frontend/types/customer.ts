export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerMetrics {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  lastVisit: string | null;
}

export interface CustomerWithMetrics {
  customer: Customer;
  metrics: CustomerMetrics;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
