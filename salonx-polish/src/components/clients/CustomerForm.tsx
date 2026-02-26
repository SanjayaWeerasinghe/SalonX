import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/lib/api/customer.api';

const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, loading = false }: CustomerFormProps) {
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
      : {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          notes: '',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('first_name')}
          error={errors.first_name?.message}
          disabled={loading}
          placeholder="John"
        />
        <Input
          label="Last Name"
          {...register('last_name')}
          error={errors.last_name?.message}
          disabled={loading}
          placeholder="Doe"
        />
      </div>

      {/* Contact Info */}
      <Input
        label="Email (optional)"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        disabled={loading}
        placeholder="john.doe@example.com"
      />

      <Input
        label="Phone (optional)"
        type="tel"
        {...register('phone')}
        error={errors.phone?.message}
        disabled={loading}
        placeholder="+1 555-0123"
      />

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        {...register('notes')}
        error={errors.notes?.message}
        disabled={loading}
        placeholder="Add any additional notes about this client..."
        rows={3}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {customer ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
}
