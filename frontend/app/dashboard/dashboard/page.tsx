'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, FileText } from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { formatCurrency } from '@/lib/utils/format';
import { getDateRange, type DateRangePeriod } from '@/lib/utils/date';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardOverview, RevenueChartData, TopCustomer, PopularService } from '@/types/dashboard';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DateRangePeriod>('month');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(period);

      const [overviewRes, revenueRes, customersRes, servicesRes] = await Promise.all([
        dashboardApi.getOverview(dateRange),
        dashboardApi.getRevenueChart({ ...dateRange, period }),
        dashboardApi.getTopCustomers({ ...dateRange, limit: 5 }),
        dashboardApi.getPopularServices({ ...dateRange, limit: 5 }),
      ]);

      setOverview(overviewRes);
      setRevenueData(revenueRes.data);
      setTopCustomers(customersRes.customers);
      setPopularServices(servicesRes.services);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as DateRangePeriod)}
          options={[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'last_month', label: 'Last Month' },
            { value: 'last_3_months', label: 'Last 3 Months' },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{overview.customers.total}</p>
              <p className="text-sm text-green-600 mt-1">+{overview.customers.new} new</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{overview.appointments.total}</p>
              <p className="text-sm text-blue-600 mt-1">{overview.appointments.upcoming} upcoming</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(overview.revenue.total)}</p>
              <p className="text-sm text-green-600 mt-1">{formatCurrency(overview.revenue.paid)} paid</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Invoices</p>
              <p className="text-3xl font-bold text-gray-900">{overview.invoices.total}</p>
              <p className="text-sm text-red-600 mt-1">{overview.invoices.unpaid} unpaid</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} name="Total Revenue" />
              <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Active Services">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-6xl font-bold text-primary-600">{overview.services.active}</p>
              <p className="text-gray-600 mt-2">Active Services</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Customers">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCustomers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{customer.customer_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">
                      {formatCurrency(customer.total_revenue)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{customer.invoice_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Popular Services">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Service</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Bookings</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {popularServices.map((service) => (
                  <tr key={service.service_id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{service.service_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{service.booking_count}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">
                      {formatCurrency(service.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
