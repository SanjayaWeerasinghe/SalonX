import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Scissors } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 18500, expenses: 8200 },
  { month: "Feb", revenue: 21200, expenses: 8800 },
  { month: "Mar", revenue: 19800, expenses: 8400 },
  { month: "Apr", revenue: 24500, expenses: 9200 },
  { month: "May", revenue: 22800, expenses: 8900 },
  { month: "Jun", revenue: 26200, expenses: 9500 },
];

const serviceData = [
  { name: "Hair Services", value: 45, color: "#9333ea" },
  { name: "Nail Services", value: 25, color: "#ec4899" },
  { name: "Skincare", value: 18, color: "#3b82f6" },
  { name: "Wellness", value: 12, color: "#10b981" },
];

const staffPerformance = [
  { name: "Jessica", revenue: 4200, appointments: 32 },
  { name: "Alex", revenue: 3100, appointments: 28 },
  { name: "Maria", revenue: 2800, appointments: 25 },
  { name: "David", revenue: 2200, appointments: 18 },
  { name: "Emily", revenue: 1900, appointments: 22 },
];

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Reports</h1>
            <p className="text-muted-foreground">Analyze your business performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="month">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold">$26,200</p>
                  <div className="flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+15%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-semibold">342</p>
                  <div className="flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Clients</p>
                  <p className="text-2xl font-semibold">48</p>
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    <span>-3%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Services Done</p>
                  <p className="text-2xl font-semibold">412</p>
                  <div className="flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGrad)" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Services Breakdown */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Services Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="hsl(15 45% 75%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
