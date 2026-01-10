'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { invoicesApi } from '@/lib/api/invoice.api';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import InvoicePDF from '@/components/invoices/InvoicePDF';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import RecordPaymentModal from '@/components/invoices/RecordPaymentModal';
import type { Invoice } from '@/types/invoice';
import type { Customer } from '@/types/customer';
import type { InvoiceFormData, RecordPaymentFormData } from '@/lib/validations/invoice.schema';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesApi.getInvoices({ limit: 100 });
      setInvoices(response.invoices);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setCreateModalOpen(true);
  };

  const handleInvoiceSubmit = async (data: InvoiceFormData) => {
    try {
      setCreating(true);
      await invoicesApi.createInvoice(data);
      toast.success('Invoice created successfully');
      setCreateModalOpen(false);
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const handleRecordPayment = () => {
    setDetailsModalOpen(false);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: RecordPaymentFormData) => {
    if (!selectedInvoice) return;

    try {
      setRecordingPayment(true);
      await invoicesApi.recordPayment(selectedInvoice.id, data);
      toast.success('Payment recorded successfully');
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessor: 'invoice_number',
    },
    {
      header: 'Customer',
      accessor: (row) => {
        const customer = typeof row.customer_id === 'string' ? null : row.customer_id;
        return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
      },
    },
    {
      header: 'Date',
      accessor: (row) => formatDate(row.issue_date),
    },
    {
      header: 'Total',
      accessor: (row) => formatCurrency(row.total),
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant={getStatusColor(row.payment_status)}>{row.payment_status.toUpperCase().replace('_', ' ')}</Badge>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="secondary" size="sm" onClick={() => handleViewDetails(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={handleCreateInvoice}>
          <Plus size={20} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <Table data={invoices} columns={columns} loading={loading} emptyMessage="No invoices found" />
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
              {typeof selectedInvoice.customer_id !== 'string' && (
                <div>
                  <p className="text-base font-medium">
                    {selectedInvoice.customer_id.first_name} {selectedInvoice.customer_id.last_name}
                  </p>
                  {selectedInvoice.customer_id.email && <p className="text-sm text-gray-600">{selectedInvoice.customer_id.email}</p>}
                </div>
              )}
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium">Description</th>
                      <th className="px-4 py-2 text-center text-xs font-medium">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.line_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Subtotal:</span>
                <span className="text-sm">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Tax:</span>
                <span className="text-sm">{formatCurrency(selectedInvoice.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(selectedInvoice.total)}</span>
              </div>

              {selectedInvoice.paid_amount > 0 && (
                <>
                  <div className="flex justify-between mt-4 text-green-600">
                    <span>Paid:</span>
                    <span>{formatCurrency(selectedInvoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Balance:</span>
                    <span>{formatCurrency(selectedInvoice.total - selectedInvoice.paid_amount)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t pt-4">
              <InvoicePDF invoice={selectedInvoice} />
              {selectedInvoice.payment_status !== 'paid' && (
                <Button onClick={handleRecordPayment}>Record Payment</Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Invoice"
        size="xl"
      >
        <InvoiceForm
          onSubmit={handleInvoiceSubmit}
          onCancel={() => setCreateModalOpen(false)}
          loading={creating}
        />
      </Modal>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <RecordPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handlePaymentSubmit}
          loading={recordingPayment}
          outstandingBalance={selectedInvoice.total - selectedInvoice.paid_amount}
        />
      )}
    </div>
  );
}
