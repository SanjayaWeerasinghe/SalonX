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
import { UserPlus, Search, Users, UserCog, Filter, Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { staffApi, type Staff } from "@/lib/api/staff.api";
import { useToast } from "@/hooks/use-toast";
import { StaffModal } from "@/components/staff/StaffModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";

const roleLabels: Record<string, string> = {
  stylist: 'Stylist',
  manager: 'Manager',
  receptionist: 'Receptionist',
  other: 'Other',
};

const StaffPage = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, [searchQuery, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (roleFilter && roleFilter !== 'all') {
        params.role = roleFilter;
      }

      if (statusFilter && statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }

      const response = await staffApi.getStaff(params);
      setStaff(response.staff);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading staff',
        description: error.response?.data?.error?.message || 'Failed to fetch staff members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleOpenModal = (staffMember?: Staff) => {
    setSelectedStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedStaff) {
        await staffApi.updateStaff(selectedStaff.id, data);
        toast({
          title: 'Success',
          description: 'Staff member updated successfully',
        });
      } else {
        await staffApi.createStaff(data);
        toast({
          title: 'Success',
          description: 'Staff member created successfully',
        });
      }
      handleCloseModal();
      fetchStaff();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to save staff member',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (staffMember: Staff) => {
    try {
      await staffApi.toggleActive(staffMember.id);
      toast({
        title: 'Success',
        description: `Staff member ${staffMember.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      fetchStaff();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to toggle staff status',
      });
    }
  };

  const handleDeleteClick = (staffMember: Staff) => {
    setStaffToDelete(staffMember);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    try {
      setSubmitting(true);
      await staffApi.deleteStaff(staffToDelete.id);
      toast({
        title: 'Success',
        description: 'Staff member deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setStaffToDelete(undefined);
      fetchStaff();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to delete staff member',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeStaff = staff.filter(s => s.is_active);
  const roleGroups = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Staff</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-shadow"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-semibold">{staff.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-semibold">{activeStaff.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stylists</p>
                  <p className="text-2xl font-semibold">{roleGroups['stylist'] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Managers</p>
                  <p className="text-2xl font-semibold">{roleGroups['manager'] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Team Members</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    className="pl-10 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
            ) : staff.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No staff members found matching your filters'
                  : 'No staff members yet. Add your first team member to get started!'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell className="font-medium">
                        {staffMember.first_name} {staffMember.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {staffMember.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {staffMember.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {roleLabels[staffMember.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {staffMember.hire_date
                          ? format(new Date(staffMember.hire_date), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {staffMember.specialties && staffMember.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {staffMember.specialties.slice(0, 2).map((specialty, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {staffMember.specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{staffMember.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            staffMember.is_active
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          }
                        >
                          {staffMember.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(staffMember)}
                            title={staffMember.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {staffMember.is_active ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenModal(staffMember)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(staffMember)}
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
      <StaffModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        staff={selectedStaff}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${staffToDelete?.first_name} ${staffToDelete?.last_name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitting}
      />
    </DashboardLayout>
  );
};

export default StaffPage;
