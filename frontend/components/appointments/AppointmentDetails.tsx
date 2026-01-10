'use client';

import React from 'react';
import { formatDateTime, formatCurrency, formatDuration } from '@/lib/utils/format';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Appointment } from '@/types/appointment';
import type { Customer } from '@/types/customer';
import type { Service } from '@/types/service';
import { getStatusColor } from '@/lib/utils/format';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onEdit: () => void;
  onCancel: () => void;
  onMarkComplete: () => void;
  onCreateInvoice: () => void;
  onClose: () => void;
}

export default function AppointmentDetails({
  appointment,
  onEdit,
  onCancel,
  onMarkComplete,
  onCreateInvoice,
  onClose,
}: AppointmentDetailsProps) {
  const customer = typeof appointment.customer_id === 'string' ? null : appointment.customer_id;

  const calculateTotal = () => {
    return appointment.services.reduce((sum, s) => sum + s.price_at_time * s.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <Badge variant={getStatusColor(appointment.status)}>{appointment.status.toUpperCase()}</Badge>
      </div>

      {/* Customer Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
        {customer ? (
          <div>
            <p className="text-base font-medium text-gray-900">
              {customer.first_name} {customer.last_name}
            </p>
            {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
            {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Customer information not available</p>
        )}
      </div>

      {/* Appointment Time */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
        <p className="text-base text-gray-900">{formatDateTime(appointment.appointment_date)}</p>
        <p className="text-sm text-gray-600">Duration: {formatDuration(appointment.duration_minutes || 0)}</p>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Services</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Service</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointment.services.map((s, index) => {
                const service = typeof s.service_id === 'string' ? null : s.service_id;
                return (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {service ? service.name : 'Unknown Service'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-center">{s.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">
                      {formatCurrency(s.price_at_time)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(s.price_at_time * s.quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                  Total
                </td>
                <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(calculateTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-4 border-t">
        <Button onClick={onEdit}>Edit</Button>
        {appointment.status === 'scheduled' && (
          <>
            <Button variant="secondary" onClick={onMarkComplete}>
              Mark Complete
            </Button>
            <Button variant="danger" onClick={onCancel}>
              Cancel Appointment
            </Button>
          </>
        )}
        {appointment.status === 'completed' && !appointment.appointment_id && (
          <Button onClick={onCreateInvoice}>Create Invoice</Button>
        )}
        <Button variant="secondary" onClick={onClose} className="ml-auto">
          Close
        </Button>
      </div>
    </div>
  );
}
