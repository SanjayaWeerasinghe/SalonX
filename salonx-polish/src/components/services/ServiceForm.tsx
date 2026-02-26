import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Service } from '@/lib/api/service.api';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  duration_minutes: z.number().min(0, 'Duration must be 0 or greater').optional(),
  is_active: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ServiceForm({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
          name: '',
          description: '',
          price: 0,
          duration_minutes: 0,
          is_active: true,
        },
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Service Name */}
      <Input
        label="Service Name"
        {...register('name')}
        error={errors.name?.message}
        disabled={loading}
        placeholder="e.g., Haircut, Manicure, Facial"
      />

      {/* Description */}
      <Textarea
        label="Description (optional)"
        {...register('description')}
        error={errors.description?.message}
        disabled={loading}
        placeholder="Describe this service..."
        rows={3}
      />

      {/* Price and Duration Row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
          disabled={loading}
          placeholder="0.00"
        />
        <Input
          label="Duration (minutes)"
          type="number"
          {...register('duration_minutes', { valueAsNumber: true })}
          error={errors.duration_minutes?.message}
          disabled={loading}
          placeholder="60"
        />
      </div>

      {/* Is Active Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
          disabled={loading}
        />
        <label
          htmlFor="is_active"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Active (available for booking)
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {service ? 'Update Service' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
}
