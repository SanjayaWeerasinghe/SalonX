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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Filter, Plus, DollarSign, Loader2 } from "lucide-react";
import { invoicesApi, type Invoice } from "@/lib/api/invoice.api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { InvoiceModal } from "@/components/invoices/InvoiceModal";
import { RecordPaymentModal } from "@/components/invoices/RecordPaymentModal";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";

const paymentStatusStyles = {
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  partially_paid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceForPayment, setInvoiceForPayment] = useState<Invoice | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter && statusFilter !== 'all') {
        params.payment_status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await invoicesApi.getInvoices(params);
      setInvoices(response.invoices);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading invoices',
        description: error.response?.data?.error?.message || 'Failed to fetch invoices',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInvoices();
  };

  const handleOpenModal = (invoice?: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedInvoice) {
        await invoicesApi.updateInvoice(selectedInvoice.id, data);
        toast({
          title: 'Success',
          description: 'Invoice updated successfully',
        });
      } else {
        await invoicesApi.createInvoice(data);
        toast({
          title: 'Success',
          description: 'Invoice created successfully',
        });
      }
      handleCloseModal();
      fetchInvoices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to save invoice',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setInvoiceForPayment(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setInvoiceForPayment(undefined);
  };

  const handleRecordPayment = async (data: any) => {
    if (!invoiceForPayment) return;

    try {
      setSubmitting(true);
      await invoicesApi.recordPayment(invoiceForPayment.id, data);
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      handleClosePaymentModal();
      fetchInvoices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to record payment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const unpaidInvoices = invoices.filter(i => i.payment_status === 'unpaid');
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.amount_paid, 0);
  const totalOutstanding = totalRevenue - totalPaid;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Invoices</h1>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-shadow"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-semibold">{invoices.length}</p>
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
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-semibold">${totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-semibold">${totalOutstanding.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Invoice List</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice #..."
                    className="pl-10 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'No invoices found matching your filters'
                  : 'No invoices yet. Create your first invoice to get started!'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const customerName = invoice.customer
                      ? `${invoice.customer.first_name} ${invoice.customer.last_name}`
                      : 'Unknown';
                    const balance = invoice.total - invoice.amount_paid;

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{customerName}</TableCell>
                        <TableCell>{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="font-semibold">${invoice.total.toFixed(2)}</TableCell>
                        <TableCell className="text-emerald-600">${invoice.amount_paid.toFixed(2)}</TableCell>
                        <TableCell className={balance > 0 ? 'text-red-600 font-medium' : ''}>
                          ${balance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={paymentStatusStyles[invoice.payment_status as keyof typeof paymentStatusStyles]}
                          >
                            {invoice.payment_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <InvoicePDF invoice={invoice} />
                            {invoice.payment_status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPaymentModal(invoice)}
                              >
                                Record Payment
                              </Button>
                            )}
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
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        invoice={selectedInvoice}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {invoiceForPayment && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          invoice={invoiceForPayment}
          onSubmit={handleRecordPayment}
          loading={submitting}
        />
      )}
    </DashboardLayout>
  );
};

export default Invoices;
