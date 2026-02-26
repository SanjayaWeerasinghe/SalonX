import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { appointmentsApi, type Appointment } from "@/lib/api/appointment.api";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, endOfDay } from "date-fns";

const statusStyles = {
  scheduled: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const response = await appointmentsApi.getAppointments({
          date_from: startOfDay(today).toISOString(),
          date_to: endOfDay(today).toISOString(),
          limit: 5,
        });
        setAppointments(response.appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          No appointments scheduled for today
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-serif text-xl">Today's Appointments</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => navigate('/appointments')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {appointments.map((apt) => {
            const customerName = apt.customer
              ? `${apt.customer.first_name} ${apt.customer.last_name}`
              : 'Unknown Customer';
            const initials = getInitials(customerName);
            const time = format(new Date(apt.appointment_date), 'h:mm a');
            const services = apt.services.map(s => s.service?.name || 'Unknown').join(', ');

            return (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate('/appointments')}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{customerName}</p>
                    <p className="text-sm text-muted-foreground">{services}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {time}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {apt.total_duration ? formatDuration(apt.total_duration) : 'N/A'}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusStyles[apt.status as keyof typeof statusStyles]}
                  >
                    {apt.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
