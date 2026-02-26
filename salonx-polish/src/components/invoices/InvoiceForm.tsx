import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { customersApi, type Customer } from '@/lib/api/customer.api';
import { appointmentsApi, type Appointment } from '@/lib/api/appointment.api';
import { servicesApi, type Service } from '@/lib/api/service.api';
import type { Invoice } from '@/lib/api/invoice.api';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const lineItemSchema = z.object({
  service_id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be 0 or greater'),
});

const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  appointment_id: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  tax: z.number().min(0, 'Tax must be 0 or greater'),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function InvoiceForm({ invoice, onSubmit, onCancel, loading = false }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          customer_id: invoice.customer_id,
          appointment_id: invoice.appointment_id || '',
          line_items: invoice.line_items.map(item => ({
            service_id: '',
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          tax: invoice.tax,
          due_date: invoice.due_date ? invoice.due_date.slice(0, 10) : '',
          notes: invoice.notes || '',
        }
      : {
          customer_id: '',
          appointment_id: '',
          line_items: [{ service_id: '', description: '', quantity: 1, unit_price: 0 }],
          tax: 0,
          due_date: '',
          notes: '',
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  const watchCustomerId = watch('customer_id');
  const watchAppointmentId = watch('appointment_id');
  const watchLineItems = watch('line_items');
  const watchTax = watch('tax');

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

  // Fetch completed appointments when customer is selected
  useEffect(() => {
    if (watchCustomerId) {
      const fetchAppointments = async () => {
        try {
          const response = await appointmentsApi.getAppointments({
            customer_id: watchCustomerId,
            status: 'completed',
          });
          setAppointments(response.appointments);
        } catch (error) {
          console.error('Error loading appointments:', error);
        }
      };
      fetchAppointments();
    } else {
      setAppointments([]);
      setValue('appointment_id', '');
    }
  }, [watchCustomerId, setValue]);

  // Auto-populate line items when appointment is selected
  useEffect(() => {
    if (watchAppointmentId && appointments.length > 0) {
      const appointment = appointments.find(a => a.id === watchAppointmentId);
      if (appointment) {
        const newLineItems = appointment.services.map(s => ({
          service_id: s.service_id,
          description: s.service?.name || 'Service',
          quantity: s.quantity,
          unit_price: s.service?.price || 0,
        }));
        setValue('line_items', newLineItems);
      }
    }
  }, [watchAppointmentId, appointments, setValue]);

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setValue(`line_items.${index}.service_id`, serviceId);
      setValue(`line_items.${index}.description`, service.name);
      setValue(`line_items.${index}.unit_price`, service.price);
    }
  };

  const calculateTotals = () => {
    const subtotal = watchLineItems.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unit_price || 0);
    }, 0);
    const tax = watchTax || 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

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
          disabled={loading || !!invoice}
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

      {/* Appointment Selection (Optional) */}
      {watchCustomerId && !invoice && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Link to Appointment (optional)
          </label>
          <Select
            value={watch('appointment_id')}
            onValueChange={(value) => setValue('appointment_id', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an appointment to auto-fill services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {appointments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {new Date(apt.appointment_date).toLocaleDateString()} -
                  {apt.services.map(s => s.service?.name).join(', ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            Line Items *
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ service_id: '', description: '', quantity: 1, unit_price: 0 })}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-md p-3 space-y-2">
            {/* Service Quick Select */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Quick Select Service
                </label>
                <Select
                  value={watchLineItems[index]?.service_id || ''}
                  onValueChange={(value) => handleServiceSelect(index, value)}
                  disabled={loading}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom Item</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <Input
              label="Description"
              {...register(`line_items.${index}.description`)}
              error={errors.line_items?.[index]?.description?.message}
              disabled={loading}
              placeholder="Item description"
            />

            {/* Quantity and Unit Price */}
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Quantity"
                type="number"
                min="1"
                {...register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                error={errors.line_items?.[index]?.quantity?.message}
                disabled={loading}
              />
              <Input
                label="Unit Price"
                type="number"
                step="0.01"
                min="0"
                {...register(`line_items.${index}.unit_price`, { valueAsNumber: true })}
                error={errors.line_items?.[index]?.unit_price?.message}
                disabled={loading}
              />
              <div className="flex items-end">
                <div className="w-full">
                  <label className="block text-xs text-muted-foreground mb-1">Total</label>
                  <div className="h-9 px-3 py-2 bg-muted rounded-md text-sm font-medium">
                    ${((watchLineItems[index]?.quantity || 0) * (watchLineItems[index]?.unit_price || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Remove Button */}
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={loading}
                className="text-destructive hover:text-destructive w-full"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Item
              </Button>
            )}
          </div>
        ))}

        {errors.line_items?.root && (
          <p className="text-sm text-destructive">{errors.line_items.root.message}</p>
        )}
      </div>

      {/* Tax */}
      <Input
        label="Tax"
        type="number"
        step="0.01"
        min="0"
        {...register('tax', { valueAsNumber: true })}
        error={errors.tax?.message}
        disabled={loading}
        placeholder="0.00"
      />

      {/* Totals Summary */}
      <div className="bg-muted rounded-md p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax:</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base border-t border-border pt-2">
          <span className="font-semibold">Total:</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Due Date */}
      <Input
        label="Due Date (optional)"
        type="date"
        {...register('due_date')}
        error={errors.due_date?.message}
        disabled={loading}
      />

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        {...register('notes')}
        error={errors.notes?.message}
        disabled={loading}
        placeholder="Add any additional notes or payment terms..."
        rows={3}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
