'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { servicesApi } from '@/lib/api/service.api';
import { formatCurrency, formatDuration } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import ServiceModal from '@/components/services/ServiceModal';
import type { Service } from '@/types/service';
import type { ServiceFormData } from '@/lib/validations/service.schema';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params =
        filter === 'all'
          ? {}
          : {
              is_active: filter === 'active',
            };
      const response = await servicesApi.getServices(params);
      setServices(response.services);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedService(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      setSubmitting(true);
      if (selectedService) {
        await servicesApi.updateService(selectedService.id, data);
        toast.success('Service updated successfully');
      } else {
        await servicesApi.createService(data);
        toast.success('Service created successfully');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      if (service.is_active) {
        await servicesApi.deleteService(service.id, false); // Soft delete (deactivate)
        toast.success('Service deactivated successfully');
      } else {
        await servicesApi.activateService(service.id);
        toast.success('Service activated successfully');
      }
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to toggle service status');
    }
  };

  const columns: Column<Service>[] = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Price',
      accessor: (row) => formatCurrency(row.price),
    },
    {
      header: 'Duration',
      accessor: (row) => formatDuration(row.duration_minutes || 0),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="text-primary-600 hover:text-primary-700" title="Edit">
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className={row.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
            title={row.is_active ? 'Deactivate' : 'Activate'}
          >
            {row.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Add Service
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'inactive' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('inactive')}
            >
              Inactive
            </Button>
          </div>
        </div>

        <Table data={services} columns={columns} loading={loading} emptyMessage="No services found" />
      </Card>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}
