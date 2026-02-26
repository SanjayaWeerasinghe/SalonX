import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Search, Mail, Phone, Edit2, Trash2, Loader2 } from "lucide-react";
import { customersApi, type Customer } from "@/lib/api/customer.api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CustomerModal } from "@/components/clients/CustomerModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const Clients = () => {
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalClients, setTotalClients] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Customer | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Customer | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, [searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getCustomers({
        search: searchQuery || undefined,
        limit: 50,
      });
      setClients(response.customers);
      setTotalClients(response.pagination.total);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading clients',
        description: error.response?.data?.error?.message || 'Failed to fetch clients',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleOpenModal = (client?: Customer) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedClient) {
        await customersApi.updateCustomer(selectedClient.id, data);
        toast({
          title: 'Success',
          description: 'Client updated successfully',
        });
      } else {
        await customersApi.createCustomer(data);
        toast({
          title: 'Success',
          description: 'Client created successfully',
        });
      }
      handleCloseModal();
      fetchClients();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to save client',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (client: Customer) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      setSubmitting(true);
      await customersApi.deleteCustomer(clientToDelete.id);
      toast({
        title: 'Success',
        description: 'Client deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setClientToDelete(undefined);
      fetchClients();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to delete client',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const vipClients = clients.filter(c => (c.metrics?.total_revenue || 0) > 1000);
  const newThisMonth = clients.filter(c => {
    const createdDate = new Date(c.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  });

  const avgVisits = clients.length > 0
    ? (clients.reduce((sum, c) => sum + (c.metrics?.total_appointments || 0), 0) / clients.length).toFixed(1)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Clients</h1>
            <p className="text-muted-foreground">Manage your client database</p>
          </div>
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-shadow"
            onClick={() => handleOpenModal()}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-semibold">{totalClients}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">VIP Members</p>
              <p className="text-2xl font-semibold">{vipClients.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">New This Month</p>
              <p className="text-2xl font-semibold">{newThisMonth.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Avg. Visits/Client</p>
              <p className="text-2xl font-semibold">{avgVisits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Client Directory</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
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
            ) : clients.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? 'No clients found matching your search' : 'No clients yet. Add your first client to get started!'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const isVip = (client.metrics?.total_revenue || 0) > 1000;
                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(client.first_name, client.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {client.first_name} {client.last_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {client.metrics?.total_appointments || 0}
                        </TableCell>
                        <TableCell>
                          {client.metrics?.last_visit
                            ? format(new Date(client.metrics.last_visit), 'MMM dd, yyyy')
                            : 'No visits'}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          ${(client.metrics?.total_revenue || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {isVip ? (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              VIP
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenModal(client)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(client)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedClient}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.first_name} ${clientToDelete?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitting}
      />
    </DashboardLayout>
  );
};

export default Clients;
