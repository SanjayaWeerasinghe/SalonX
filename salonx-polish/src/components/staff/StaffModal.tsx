import { Modal } from '@/components/ui/modal';
import { StaffForm } from './StaffForm';
import type { Staff } from '@/lib/api/staff.api';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: Staff;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function StaffModal({ isOpen, onClose, staff, onSubmit, loading = false }: StaffModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? 'Edit Staff Member' : 'Add New Staff Member'}
      size="lg"
    >
      <StaffForm
        staff={staff}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}
