'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import AppointmentForm from './AppointmentForm';
import type { Appointment } from '@/types/appointment';
import type { AppointmentFormData } from '@/lib/validations/appointment.schema';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  onSubmit: (data: AppointmentFormData) => void;
  loading?: boolean;
  prefilledDate?: Date;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSubmit,
  loading = false,
  prefilledDate,
}: AppointmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={appointment ? 'Edit Appointment' : 'Schedule Appointment'} size="lg">
      <AppointmentForm
        appointment={appointment}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        prefilledDate={prefilledDate}
      />
    </Modal>
  );
}
