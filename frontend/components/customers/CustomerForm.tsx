'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormData } from '@/lib/validations/customer.schema';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { Customer } from '@/types/customer';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CustomerForm({ customer, onSubmit, onCancel, loading = false }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email || '',
          phone: customer.phone || '',
          notes: customer.notes || '',
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('first_name')}
          error={errors.first_name?.message}
          placeholder="John"
          required
        />

        <Input
          label="Last Name"
          {...register('last_name')}
          error={errors.last_name?.message}
          placeholder="Doe"
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="john.doe@example.com"
      />

      <Input
        label="Phone"
        type="tel"
        {...register('phone')}
        error={errors.phone?.message}
        placeholder="(555) 123-4567"
      />

      <Textarea
        label="Notes"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Any additional information about the customer..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
