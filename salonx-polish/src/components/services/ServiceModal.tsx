import { Modal } from '@/components/ui/modal';
import { ServiceForm } from './ServiceForm';
import type { Service } from '@/lib/api/service.api';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function ServiceModal({ isOpen, onClose, service, onSubmit, loading = false }: ServiceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Edit Service' : 'Add New Service'}
      size="md"
    >
      <ServiceForm
        service={service}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}
