'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recordPaymentSchema, type RecordPaymentFormData } from '@/lib/validations/invoice.schema';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordPaymentFormData) => void;
  loading?: boolean;
  outstandingBalance: number;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  outstandingBalance,
}: RecordPaymentModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: outstandingBalance,
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Outstanding Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(outstandingBalance)}</p>
        </div>

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input
              label="Payment Amount"
              type="number"
              step="0.01"
              min="0.01"
              max={outstandingBalance}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              error={errors.amount?.message}
              placeholder="0.00"
              required
            />
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
