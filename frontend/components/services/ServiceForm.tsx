'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, type ServiceFormData } from '@/lib/validations/service.schema';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { Service } from '@/types/service';

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ServiceForm({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description || '',
          price: service.price,
          duration_minutes: service.duration_minutes || 0,
          is_active: service.is_active,
        }
      : {
          is_active: true,
          price: 0,
          duration_minutes: 0,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Service Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Haircut"
        required
      />

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Describe the service..."
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              error={errors.price?.message}
              placeholder="50.00"
              required
            />
          )}
        />

        <Controller
          name="duration_minutes"
          control={control}
          render={({ field }) => (
            <Input
              label="Duration (minutes)"
              type="number"
              min="0"
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              error={errors.duration_minutes?.message}
              placeholder="60"
            />
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          {...register('is_active')}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Active (available for booking)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}
