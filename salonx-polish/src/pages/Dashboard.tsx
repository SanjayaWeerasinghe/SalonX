import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AppointmentsList } from "@/components/dashboard/AppointmentsList";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StaffOverview } from "@/components/dashboard/StaffOverview";
import { Calendar, Users, DollarSign, FileText } from "lucide-react";
import { dashboardApi, type DashboardOverview } from "@/lib/api/dashboard.api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getOverview();
        setOverview(response.overview);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error loading dashboard',
          description: error.response?.data?.error?.message || 'Failed to fetch dashboard data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={overview?.total_customers || 0}
            change={`+${overview?.new_customers_this_month || 0} this month`}
            changeType="positive"
            icon={Users}
            iconClassName="bg-emerald-500"
          />
          <StatCard
            title="Total Appointments"
            value={overview?.total_appointments || 0}
            change={`${overview?.upcoming_appointments || 0} upcoming`}
            changeType="neutral"
            icon={Calendar}
            iconClassName="bg-blue-500"
          />
          <StatCard
            title="Total Revenue"
            value={`$${(overview?.total_revenue || 0).toFixed(2)}`}
            change={`$${(overview?.revenue_paid || 0).toFixed(2)} paid`}
            changeType="positive"
            icon={DollarSign}
            iconClassName="bg-amber-500"
          />
          <StatCard
            title="Total Invoices"
            value={overview?.total_invoices || 0}
            change={`${overview?.unpaid_invoices || 0} unpaid`}
            changeType={overview && overview.unpaid_invoices > 0 ? "warning" : "positive"}
            icon={FileText}
            iconClassName="bg-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Appointments - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AppointmentsList />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <StaffOverview />
          </div>
        </div>

        {/* Revenue Chart */}
        <RevenueChart />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
