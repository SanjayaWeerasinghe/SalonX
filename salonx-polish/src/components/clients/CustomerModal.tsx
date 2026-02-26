import { Modal } from '@/components/ui/modal';
import { CustomerForm } from './CustomerForm';
import type { Customer } from '@/lib/api/customer.api';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function CustomerModal({ isOpen, onClose, customer, onSubmit, loading = false }: CustomerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Client' : 'Add New Client'}
      size="md"
    >
      <CustomerForm
        customer={customer}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}
