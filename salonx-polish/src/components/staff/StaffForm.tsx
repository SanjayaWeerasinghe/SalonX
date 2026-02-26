import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Staff } from '@/lib/api/staff.api';

const staffSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['stylist', 'manager', 'receptionist', 'other']),
  specialties: z.string().optional(),
  hire_date: z.string().optional(),
  is_active: z.boolean(),
  notes: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function StaffForm({ staff, onSubmit, onCancel, loading = false }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: staff
      ? {
          first_name: staff.first_name,
          last_name: staff.last_name,
          email: staff.email,
          phone: staff.phone || '',
          role: staff.role,
          specialties: staff.specialties?.join(', ') || '',
          hire_date: staff.hire_date ? staff.hire_date.slice(0, 10) : '',
          is_active: staff.is_active,
          notes: staff.notes || '',
        }
      : {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: 'stylist',
          specialties: '',
          hire_date: '',
          is_active: true,
          notes: '',
        },
  });

  const isActive = watch('is_active');
  const role = watch('role');

  const handleFormSubmit = (data: StaffFormData) => {
    // Convert specialties string to array
    const formattedData = {
      ...data,
      specialties: data.specialties
        ? data.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [],
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

      {/* Email and Phone Row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
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
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Role and Hire Date Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Role
          </label>
          <Select
            value={role}
            onValueChange={(value) => setValue('role', value as any)}
            disabled={loading}
          >
            <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stylist">Stylist</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="mt-1 text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        <Input
          label="Hire Date (optional)"
          type="date"
          {...register('hire_date')}
          error={errors.hire_date?.message}
          disabled={loading}
        />
      </div>

      {/* Specialties */}
      <Input
        label="Specialties (optional)"
        {...register('specialties')}
        error={errors.specialties?.message}
        disabled={loading}
        placeholder="e.g., Color, Extensions, Bridal (comma-separated)"
      />

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        {...register('notes')}
        error={errors.notes?.message}
        disabled={loading}
        placeholder="Additional information about this staff member..."
        rows={3}
      />

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
          Active (available for appointments)
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {staff ? 'Update Staff Member' : 'Add Staff Member'}
        </Button>
      </div>
    </form>
  );
}
