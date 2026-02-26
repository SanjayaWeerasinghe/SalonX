import { Modal } from '@/components/ui/modal';
import { AppointmentForm } from './AppointmentForm';
import type { Appointment } from '@/lib/api/appointment.api';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  prefilledDate?: string;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  prefilledDate,
  onSubmit,
  loading = false
}: AppointmentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
      size="lg"
    >
      <AppointmentForm
        appointment={appointment}
        prefilledDate={prefilledDate}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}
