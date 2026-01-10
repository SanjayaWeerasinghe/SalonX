'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment.schema';
import { customersApi } from '@/lib/api/customer.api';
import { servicesApi } from '@/lib/api/service.api';
import { formatCurrency, formatDuration } from '@/lib/utils/format';
import { formatDateForInput } from '@/lib/utils/date';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { Appointment } from '@/types/appointment';
import type { Customer } from '@/types/customer';
import type { Service } from '@/types/service';
import toast from 'react-hot-toast';
import { Minus, Plus } from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  prefilledDate?: Date;
}

export default function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  loading = false,
  prefilledDate,
}: AppointmentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ service_id: string; quantity: number }[]>([]);

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
          customer_id: typeof appointment.customer_id === 'string' ? appointment.customer_id : appointment.customer_id.id,
          appointment_date: formatDateForInput(appointment.appointment_date),
          services: appointment.services.map((s) => ({
            service_id: typeof s.service_id === 'string' ? s.service_id : s.service_id.id,
            quantity: s.quantity,
          })),
          status: appointment.status,
          notes: appointment.notes || '',
          send_email: true,
        }
      : {
          customer_id: '',
          appointment_date: prefilledDate ? formatDateForInput(prefilledDate) : '',
          status: 'scheduled',
          services: [],
          send_email: true,
          notes: '',
        },
  });

  useEffect(() => {
    fetchCustomers();
    fetchServices();

    if (appointment) {
      setSelectedServices(
        appointment.services.map((s) => ({
          service_id: typeof s.service_id === 'string' ? s.service_id : s.service_id.id,
          quantity: s.quantity,
        }))
      );
    }
  }, []);

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

  const handleAddService = () => {
    if (services.length === 0) return;
    const newService = { service_id: services[0].id, quantity: 1 };
    const updated = [...selectedServices, newService];
    setSelectedServices(updated);
    setValue('services', updated);
  };

  const handleRemoveService = (index: number) => {
    const updated = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(updated);
    setValue('services', updated);
  };

  const handleServiceChange = (index: number, field: 'service_id' | 'quantity', value: string | number) => {
    const updated = [...selectedServices];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedServices(updated);
    setValue('services', updated);
  };

  const calculateTotals = () => {
    let totalDuration = 0;
    let totalPrice = 0;

    selectedServices.forEach((selected) => {
      const service = services.find((s) => s.id === selected.service_id);
      if (service) {
        totalDuration += (service.duration_minutes || 0) * selected.quantity;
        totalPrice += service.price * selected.quantity;
      }
    });

    return { totalDuration, totalPrice };
  };

  const { totalDuration, totalPrice } = calculateTotals();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="customer_id"
        control={control}
        render={({ field }) => (
          <Select
            label="Customer"
            {...field}
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

      <Input
        label="Appointment Date & Time"
        type="datetime-local"
        {...register('appointment_date')}
        error={errors.appointment_date?.message}
        required
      />

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <Button type="button" variant="secondary" size="sm" onClick={handleAddService}>
            <Plus size={16} className="mr-1" />
            Add Service
          </Button>
        </div>

        {selectedServices.length === 0 ? (
          <p className="text-sm text-gray-500">No services selected. Click "Add Service" to get started.</p>
        ) : (
          <div className="space-y-2">
            {selectedServices.map((selected, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <select
                    value={selected.service_id}
                    onChange={(e) => handleServiceChange(index, 'service_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.price)}{' '}
                        {service.duration_minutes ? `(${formatDuration(service.duration_minutes)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="1"
                  value={selected.quantity}
                  onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Minus size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>}

        {selectedServices.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Duration:</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="font-medium">Total Price:</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}
      </div>

      {appointment && (
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              {...field}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'no_show', label: 'No Show' },
              ]}
              error={errors.status?.message}
            />
          )}
        />
      )}

      <Textarea label="Notes" {...register('notes')} error={errors.notes?.message} placeholder="Any additional notes..." rows={3} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="send_email"
          {...register('send_email')}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="send_email" className="text-sm font-medium text-gray-700">
          Send email confirmation to customer
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {appointment ? 'Update Appointment' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  );
}
