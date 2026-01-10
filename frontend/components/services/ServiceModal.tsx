'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import ServiceForm from './ServiceForm';
import type { Service } from '@/types/service';
import type { ServiceFormData } from '@/lib/validations/service.schema';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  onSubmit: (data: ServiceFormData) => void;
  loading?: boolean;
}

export default function ServiceModal({ isOpen, onClose, service, onSubmit, loading = false }: ServiceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Edit Service' : 'Add Service'} size="md">
      <ServiceForm service={service} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
    </Modal>
  );
}
