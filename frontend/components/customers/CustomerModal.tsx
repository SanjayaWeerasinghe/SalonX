'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import CustomerForm from './CustomerForm';
import type { Customer } from '@/types/customer';
import type { CustomerFormData } from '@/lib/validations/customer.schema';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  loading?: boolean;
}

export default function CustomerModal({ isOpen, onClose, customer, onSubmit, loading = false }: CustomerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Edit Customer' : 'Add Customer'} size="md">
      <CustomerForm customer={customer} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
    </Modal>
  );
}
