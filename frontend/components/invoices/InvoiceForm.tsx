'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice.schema';
import { customersApi } from '@/lib/api/customer.api';
import { appointmentsApi } from '@/lib/api/appointment.api';
import { servicesApi } from '@/lib/api/service.api';
import { formatCurrency } from '@/lib/utils/format';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Plus, Minus } from 'lucide-react';
import type { Customer } from '@/types/customer';
import type { Appointment } from '@/types/appointment';
import type { Service } from '@/types/service';
import toast from 'react-hot-toast';

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  preselectedAppointmentId?: string;
}

export default function InvoiceForm({
  onSubmit,
  onCancel,
  loading = false,
  preselectedAppointmentId,
}: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: '',
      appointment_id: preselectedAppointmentId || '',
      line_items: [{ description: '', quantity: 1, unit_price: 0 }],
      tax: 0,
      due_date: '',
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  const watchLineItems = watch('line_items');
  const watchTax = watch('tax');

  useEffect(() => {
    fetchCustomers();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerAppointments(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (preselectedAppointmentId) {
      loadAppointmentData(preselectedAppointmentId);
    }
  }, [preselectedAppointmentId]);

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.getCustomers({ limit: 1000 });
      setCustomers(response.customers);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getServices({ is_active: true });
      setServices(response.services);
    } catch (error) {
      toast.error('Failed to fetch services');
    }
  };

  const fetchCustomerAppointments = async (customerId: string) => {
    try {
      const response = await appointmentsApi.getAppointments({ customer_id: customerId, status: 'completed', limit: 50 });
      setAppointments(response.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    }
  };

  const loadAppointmentData = async (appointmentId: string) => {
    try {
      const response = await appointmentsApi.getAppointment(appointmentId);
      const apt = response.appointment;

      // Set customer
      const customerId = typeof apt.customer_id === 'string' ? apt.customer_id : apt.customer_id.id;
      setValue('customer_id', customerId);
      setSelectedCustomerId(customerId);

      // Set line items from appointment services
      const lineItems = apt.services.map((s) => {
        const service = typeof s.service_id === 'string' ? null : s.service_id;
        return {
          service_id: typeof s.service_id === 'string' ? s.service_id : s.service_id.id,
          description: service ? service.name : 'Service',
          quantity: s.quantity,
          unit_price: s.price_at_time,
        };
      });

      setValue('line_items', lineItems);
    } catch (error) {
      toast.error('Failed to load appointment data');
    }
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setValue(`line_items.${index}.description`, service.name);
      setValue(`line_items.${index}.unit_price`, service.price);
      setValue(`line_items.${index}.service_id`, serviceId);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <Controller
        name="customer_id"
        control={control}
        render={({ field }) => (
          <Select
            label="Customer"
            {...field}
            onChange={(e) => {
              field.onChange(e);
              setSelectedCustomerId(e.target.value);
            }}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.first_name} ${c.last_name}${c.email ? ` (${c.email})` : ''}`,
            }))}
            placeholder="Select a customer"
            error={errors.customer_id?.message}
            required
          />
        )}
      />

      {/* Appointment Selection (Optional) */}
      {selectedCustomerId && (
        <Controller
          name="appointment_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Link to Appointment (Optional)"
              {...field}
              options={appointments.map((apt) => ({
                value: apt.id,
                label: `${new Date(apt.appointment_date).toLocaleDateString()} - ${apt.services.length} service(s)`,
              }))}
              placeholder="Select an appointment or leave empty"
              error={errors.appointment_id?.message}
            />
          )}
        />
      )}

      {/* Line Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">Line Items</label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
          >
            <Plus size={16} className="mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Service Selection (Optional) */}
                <div className="md:col-span-4">
                  <select
                    onChange={(e) => handleServiceSelect(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Select service (optional)</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-4">
                  <input
                    {...register(`line_items.${index}.description`)}
                    placeholder="Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  {errors.line_items?.[index]?.description && (
                    <p className="text-xs text-red-600 mt-1">{errors.line_items[index]?.description?.message}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <Controller
                    name={`line_items.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    )}
                  />
                </div>

                {/* Unit Price */}
                <div className="md:col-span-2">
                  <Controller
                    name={`line_items.${index}.unit_price`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Remove Button */}
              {fields.length > 1 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Minus size={16} className="mr-1" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {errors.line_items && (
          <p className="mt-2 text-sm text-red-600">{errors.line_items.message}</p>
        )}
      </div>

      {/* Tax */}
      <Controller
        name="tax"
        control={control}
        render={({ field }) => (
          <Input
            label="Tax Amount"
            type="number"
            step="0.01"
            min="0"
            {...field}
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            error={errors.tax?.message}
            placeholder="0.00"
          />
        )}
      />

      {/* Totals Display */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax:</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Due Date */}
      <Input
        label="Due Date (Optional)"
        type="date"
        {...register('due_date')}
        error={errors.due_date?.message}
      />

      {/* Notes */}
      <Textarea
        label="Notes"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Any additional notes..."
        rows={3}
      />

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Invoice
        </Button>
      </div>
    </form>
  );
}
