'use client';

import React, { useState, useEffect } from 'react';
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointment.api';
import { formatDateTime } from '@/lib/utils/format';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { getStatusColor } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentDetails from '@/components/appointments/AppointmentDetails';
import type { Appointment } from '@/types/appointment';
import type { AppointmentFormData } from '@/lib/validations/appointment.schema';
import toast from 'react-hot-toast';
import type { View } from 'react-big-calendar';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Cancel dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (view === 'calendar') {
      fetchCalendarAppointments();
    } else {
      fetchAppointments();
    }
  }, [view, currentDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getAppointments({ limit: 100 });
      setAppointments(response.appointments);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarAppointments = async () => {
    try {
      setLoading(true);
      // Fetch appointments for a wider range to include visible days from adjacent months
      const start = startOfMonth(currentDate);
      start.setDate(start.getDate() - 7); // Go back 7 days to catch previous month's visible days

      const end = endOfMonth(currentDate);
      end.setDate(end.getDate() + 7); // Go forward 7 days to catch next month's visible days

      const response = await appointmentsApi.getCalendarView({
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
      });

      console.log('Fetched appointments:', response.appointments);
      setAppointments(response.appointments);
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (date?: Date) => {
    setSelectedAppointment(undefined);
    setPrefilledDate(date);
    setIsFormModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPrefilledDate(undefined);
    setIsFormModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      setSubmitting(true);
      if (selectedAppointment) {
        await appointmentsApi.updateAppointment(selectedAppointment.id, data);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentsApi.createAppointment(data);
        toast.success('Appointment created successfully');
      }
      setIsFormModalOpen(false);
      if (view === 'calendar') {
        fetchCalendarAppointments();
      } else {
        fetchAppointments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentsApi.updateAppointment(selectedAppointment.id, { status: 'completed' });
      toast.success('Appointment marked as complete');
      setIsDetailsModalOpen(false);
      view === 'calendar' ? fetchCalendarAppointments() : fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update appointment');
    }
  };

  const handleCancelClick = (appointment?: Appointment) => {
    const apt = appointment || selectedAppointment;
    if (!apt) return;
    setAppointmentToCancel(apt);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;

    try {
      setCancelling(true);
      await appointmentsApi.cancelAppointment(appointmentToCancel.id);
      toast.success('Appointment cancelled successfully');
      setCancelDialogOpen(false);
      setIsDetailsModalOpen(false);
      view === 'calendar' ? fetchCalendarAppointments() : fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedAppointment) return;

    try {
      const { invoicesApi } = await import('@/lib/api/invoice.api');
      await invoicesApi.createFromAppointment(selectedAppointment.id);
      toast.success('Invoice created successfully from appointment');
      setIsDetailsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create invoice');
    }
  };

  const handleEventDrop = async ({ event, start }: { event: any; start: Date }) => {
    try {
      await appointmentsApi.updateAppointment(event.resource.id, {
        appointment_date: start.toISOString(),
      });
      toast.success('Appointment rescheduled');
      fetchCalendarAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to reschedule appointment');
    }
  };

  const columns: Column<Appointment>[] = [
    {
      header: 'Customer',
      accessor: (row) => {
        const customer = typeof row.customer_id === 'string' ? null : row.customer_id;
        return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
      },
    },
    {
      header: 'Date & Time',
      accessor: (row) => formatDateTime(row.appointment_date),
    },
    {
      header: 'Services',
      accessor: (row) => row.services.length,
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant={getStatusColor(row.status)}>{row.status.toUpperCase()}</Badge>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="secondary" size="sm" onClick={() => handleViewDetails(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView(view === 'list' ? 'calendar' : 'list')}>
            {view === 'list' ? <CalendarIcon size={20} className="mr-2" /> : <List size={20} className="mr-2" />}
            {view === 'list' ? 'Calendar View' : 'List View'}
          </Button>
          <Button onClick={() => handleCreate()}>
            <Plus size={20} className="mr-2" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <Card>
          <Table data={appointments} columns={columns} loading={loading} emptyMessage="No appointments found" />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">
              Showing <strong>{appointments.length}</strong> appointment(s) for the selected period.
              {appointments.length === 0 && ' Try creating a new appointment or navigate to a different month.'}
            </p>
          </Card>
          {loading ? (
            <div className="flex justify-center items-center h-[700px] bg-white rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <AppointmentCalendar
              appointments={appointments}
              onSelectSlot={(slotInfo) => handleCreate(slotInfo.start)}
              onSelectEvent={handleViewDetails}
              onNavigate={setCurrentDate}
              onEventDrop={handleEventDrop}
            />
          )}
        </div>
      )}

      {/* Appointment Form Modal */}
      <AppointmentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        appointment={selectedAppointment}
        onSubmit={handleSubmit}
        loading={submitting}
        prefilledDate={prefilledDate}
      />

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Appointment Details"
          size="lg"
        >
          <AppointmentDetails
            appointment={selectedAppointment}
            onEdit={() => handleEdit(selectedAppointment)}
            onCancel={() => handleCancelClick()}
            onMarkComplete={handleMarkComplete}
            onCreateInvoice={handleCreateInvoice}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        </Modal>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? An email notification will be sent to the customer."
        confirmText="Cancel Appointment"
        loading={cancelling}
      />
    </div>
  );
}
