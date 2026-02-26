import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Scissors, Search, Clock, Plus, DollarSign, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { servicesApi, type Service } from "@/lib/api/service.api";
import { useToast } from "@/hooks/use-toast";
import { ServiceModal } from "@/components/services/ServiceModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, [searchQuery]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getServices({
        search: searchQuery || undefined,
      });
      setServices(response.services);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading services',
        description: error.response?.data?.error?.message || 'Failed to fetch services',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleOpenModal = (service?: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedService) {
        await servicesApi.updateService(selectedService.id, data);
        toast({
          title: 'Success',
          description: 'Service updated successfully',
        });
      } else {
        await servicesApi.createService(data);
        toast({
          title: 'Success',
          description: 'Service created successfully',
        });
      }
      handleCloseModal();
      fetchServices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to save service',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      if (service.is_active) {
        await servicesApi.deactivateService(service.id);
        toast({
          title: 'Success',
          description: 'Service deactivated',
        });
      } else {
        await servicesApi.activateService(service.id);
        toast({
          title: 'Success',
          description: 'Service activated',
        });
      }
      fetchServices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to toggle service status',
      });
    }
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      setSubmitting(true);
      await servicesApi.deleteService(serviceToDelete.id);
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setServiceToDelete(undefined);
      fetchServices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to delete service',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const activeServices = services.filter(s => s.is_active);
  const avgPrice = services.length > 0
    ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2)
    : 0;
  const avgDuration = services.length > 0
    ? Math.round(services.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / services.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Services</h1>
            <p className="text-muted-foreground">Manage your service offerings and pricing</p>
          </div>
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-shadow"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-semibold">{services.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Price</p>
                  <p className="text-2xl font-semibold">${avgPrice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Duration</p>
                  <p className="text-2xl font-semibold">{avgDuration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Services</p>
                  <p className="text-2xl font-semibold">{activeServices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Service Catalog</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-10 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? 'No services found matching your search' : 'No services yet. Add your first service to get started!'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {service.duration_minutes ? formatDuration(service.duration_minutes) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${service.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            service.is_active
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          }
                        >
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(service)}
                            title={service.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {service.is_active ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenModal(service)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitting}
      />
    </DashboardLayout>
  );
};

export default ServicesPage;
