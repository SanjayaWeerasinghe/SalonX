'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { customersApi } from '@/lib/api/customer.api';
import { formatDate } from '@/lib/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomerModal from '@/components/customers/CustomerModal';
import type { Customer } from '@/types/customer';
import type { CustomerFormData } from '@/lib/validations/customer.schema';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage } = usePagination();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearch, page, limit]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getCustomers({
        search: debouncedSearch,
        page,
        limit,
      });
      setCustomers(response.customers);
      setTotal(response.pagination.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setSubmitting(true);
      if (selectedCustomer) {
        await customersApi.updateCustomer(selectedCustomer.id, data);
        toast.success('Customer updated successfully');
      } else {
        await customersApi.createCustomer(data);
        toast.success('Customer created successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      setDeleting(true);
      await customersApi.deleteCustomer(customerToDelete.id);
      toast.success('Customer deleted successfully');
      setDeleteDialogOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Name',
      accessor: (row) => `${row.first_name} ${row.last_name}`,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Created',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-primary-600 hover:text-primary-700"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <Table data={customers} columns={columns} loading={loading} emptyMessage="No customers found" />

        {total > limit && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {customers.length} of {total} customers
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.first_name} ${customerToDelete?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
