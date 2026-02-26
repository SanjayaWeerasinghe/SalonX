import { Modal } from '@/components/ui/modal';
import { InvoiceForm } from './InvoiceForm';
import type { Invoice } from '@/lib/api/invoice.api';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function InvoiceModal({ isOpen, onClose, invoice, onSubmit, loading = false }: InvoiceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? 'Edit Invoice' : 'Create New Invoice'}
      size="xl"
    >
      <InvoiceForm
        invoice={invoice}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}
