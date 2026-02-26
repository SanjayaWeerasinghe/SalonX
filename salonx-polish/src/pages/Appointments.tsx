import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, Search, Filter, Clock, Edit2, Trash2, Loader2 } from "lucide-react";
import { appointmentsApi, type Appointment } from "@/lib/api/appointment.api";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay } from "date-fns";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const statusStyles = {
  scheduled: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [date, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (date) {
        params.date_from = startOfDay(date).toISOString();
        params.date_to = endOfDay(date).toISOString();
      }

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await appointmentsApi.getAppointments(params);
      setAppointments(response.appointments);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading appointments',
        description: error.response?.data?.error?.message || 'Failed to fetch appointments',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (appointment?: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedAppointment) {
        await appointmentsApi.updateAppointment(selectedAppointment.id, data);
        toast({
          title: 'Success',
          description: 'Appointment updated successfully',
        });
      } else {
        await appointmentsApi.createAppointment(data);
        toast({
          title: 'Success',
          description: 'Appointment scheduled successfully',
        });
      }
      handleCloseModal();
      fetchAppointments();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to save appointment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;

    try {
      setSubmitting(true);
      await appointmentsApi.deleteAppointment(appointmentToDelete.id);
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(undefined);
      fetchAppointments();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to delete appointment',
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  const filteredAppointments = searchQuery
    ? appointments.filter(apt =>
        apt.customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.customer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : appointments;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Appointments</h1>
            <p className="text-muted-foreground">Manage and schedule client appointments</p>
          </div>
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-shadow"
            onClick={() => handleOpenModal()}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar Sidebar */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card className="lg:col-span-3 shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">
                  Appointment List
                  {date && ` - ${format(date, 'MMMM dd, yyyy')}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {searchQuery
                    ? 'No appointments found matching your search'
                    : date
                    ? `No appointments scheduled for ${format(date, 'MMMM dd, yyyy')}`
                    : 'No appointments found'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => {
                      const customerName = apt.customer
                        ? `${apt.customer.first_name} ${apt.customer.last_name}`
                        : 'Unknown';
                      const initials = getInitials(customerName);
                      const serviceNames = apt.services
                        .map(s => s.service?.name || 'Unknown')
                        .join(', ');

                      return (
                        <TableRow key={apt.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-secondary text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{customerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={serviceNames}>
                              {serviceNames}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{format(new Date(apt.appointment_date), 'h:mm a')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {apt.total_duration ? formatDuration(apt.total_duration) : 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(apt.total_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={statusStyles[apt.status as keyof typeof statusStyles]}
                            >
                              {apt.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenModal(apt)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(apt)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
        prefilledDate={date ? format(date, "yyyy-MM-dd'T'HH:mm") : undefined}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitting}
      />
    </DashboardLayout>
  );
};

export default Appointments;
