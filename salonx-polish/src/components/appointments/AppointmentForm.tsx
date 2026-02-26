import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { customersApi, type Customer } from '@/lib/api/customer.api';
import { servicesApi, type Service } from '@/lib/api/service.api';
import type { Appointment } from '@/lib/api/appointment.api';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const appointmentSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  appointment_date: z.string().min(1, 'Appointment date is required'),
  services: z.array(
    z.object({
      service_id: z.string().min(1, 'Service is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one service is required'),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
  send_email: z.boolean().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  prefilledDate?: string;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function AppointmentForm({
  appointment,
  prefilledDate,
  onSubmit,
  onCancel,
  loading = false
}: AppointmentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment
      ? {
          customer_id: appointment.customer_id,
          appointment_date: appointment.appointment_date.slice(0, 16), // Format for datetime-local
          services: appointment.services.map(s => ({
            service_id: s.service_id,
            quantity: s.quantity,
          })),
          status: appointment.status,
          notes: appointment.notes || '',
          send_email: false,
        }
      : {
          customer_id: '',
          appointment_date: prefilledDate || '',
          services: [{ service_id: '', quantity: 1 }],
          status: 'scheduled',
          notes: '',
          send_email: true,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  const watchServices = watch('services');
  const sendEmail = watch('send_email');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [customersRes, servicesRes] = await Promise.all([
          customersApi.getCustomers({ limit: 100 }),
          servicesApi.getServices({ is_active: true }),
        ]);
        setCustomers(customersRes.customers);
        setServices(servicesRes.services);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotals = () => {
    let totalDuration = 0;
    let totalPrice = 0;

    watchServices.forEach((appointmentService) => {
      const service = services.find(s => s.id === appointmentService.service_id);
      if (service) {
        totalDuration += (service.duration_minutes || 0) * appointmentService.quantity;
        totalPrice += service.price * appointmentService.quantity;
      }
    });

    return { totalDuration, totalPrice };
  };

  const { totalDuration, totalPrice } = calculateTotals();

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Customer *
        </label>
        <Select
          value={watch('customer_id')}
          onValueChange={(value) => setValue('customer_id', value)}
          disabled={loading}
        >
          <SelectTrigger className={errors.customer_id ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name}
                {customer.email && ` (${customer.email})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customer_id && (
          <p className="mt-1 text-sm text-destructive">{errors.customer_id.message}</p>
        )}
      </div>

      {/* Appointment Date & Time */}
      <Input
        label="Appointment Date & Time"
        type="datetime-local"
        {...register('appointment_date')}
        error={errors.appointment_date?.message}
        disabled={loading}
      />

      {/* Services */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            Services *
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ service_id: '', quantity: 1 })}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex-1">
              <Select
                value={watchServices[index]?.service_id || ''}
                onValueChange={(value) => setValue(`services.${index}.service_id`, value)}
                disabled={loading}
              >
                <SelectTrigger className={errors.services?.[index]?.service_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price.toFixed(2)}
                      {service.duration_minutes && ` (${formatDuration(service.duration_minutes)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.services?.[index]?.service_id && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.services[index]?.service_id?.message}
                </p>
              )}
            </div>

            <div className="w-24">
              <Input
                type="number"
                min="1"
                {...register(`services.${index}.quantity`, { valueAsNumber: true })}
                error={errors.services?.[index]?.quantity?.message}
                disabled={loading}
                placeholder="Qty"
              />
            </div>

            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={loading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {errors.services?.root && (
          <p className="text-sm text-destructive">{errors.services.root.message}</p>
        )}
      </div>

      {/* Totals Summary */}
      {watchServices.some(s => s.service_id) && (
        <div className="bg-muted rounded-md p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Duration:</span>
            <span className="font-medium">{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Price:</span>
            <span className="font-semibold">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Status (only show on edit) */}
      {appointment && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Status
          </label>
          <Select
            value={watch('status')}
            onValueChange={(value: any) => setValue('status', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Send Email Confirmation */}
      {!appointment && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="send_email"
            checked={sendEmail}
            onCheckedChange={(checked) => setValue('send_email', checked as boolean)}
            disabled={loading}
          />
          <label
            htmlFor="send_email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Send email confirmation to customer
          </label>
        </div>
      )}

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        {...register('notes')}
        error={errors.notes?.message}
        disabled={loading}
        placeholder="Add any special instructions or notes..."
        rows={3}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {appointment ? 'Update Appointment' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
  );
}
