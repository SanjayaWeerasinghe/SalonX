import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dashboardApi, type RevenueDataPoint } from "@/lib/api/dashboard.api";
import { Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        // Fetch last 7 days of revenue data
        const endDate = new Date();
        const startDate = subDays(endDate, 6);

        const response = await dashboardApi.getRevenueChart({
          date_from: startDate.toISOString(),
          date_to: endDate.toISOString(),
        });

        // Transform data for chart
        const chartData = response.revenue.map(item => ({
          name: format(new Date(item.date), 'EEE'),
          totalRevenue: item.total_revenue,
          paidRevenue: item.paid_revenue,
        }));

        setRevenueData(chartData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Weekly Revenue</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Weekly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(15 45% 75%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(15 45% 75%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-soft)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                name="Total Revenue"
                stroke="hsl(15 45% 75%)"
                strokeWidth={2}
                fill="url(#totalGradient)"
              />
              <Area
                type="monotone"
                dataKey="paidRevenue"
                name="Paid Revenue"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                fill="url(#paidGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
