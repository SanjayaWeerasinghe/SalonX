import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Invoice } from '@/lib/api/invoice.api';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSubmit: (data: PaymentFormData) => void;
  loading?: boolean;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onSubmit,
  loading = false
}: RecordPaymentModalProps) {
  const outstandingBalance = invoice.total - invoice.amount_paid;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: outstandingBalance,
      payment_date: new Date().toISOString().slice(0, 10),
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Outstanding Balance */}
        <div className="bg-muted rounded-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Outstanding Balance:</span>
            <span className="text-lg font-bold">${outstandingBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Amount */}
        <Input
          label="Payment Amount"
          type="number"
          step="0.01"
          min="0.01"
          max={outstandingBalance}
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          disabled={loading}
          placeholder="0.00"
        />

        {/* Payment Date */}
        <Input
          label="Payment Date (optional)"
          type="date"
          {...register('payment_date')}
          error={errors.payment_date?.message}
          disabled={loading}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
