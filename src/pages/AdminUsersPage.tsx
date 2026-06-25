import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Trash2, MoreVertical, CheckCircle, XCircle, Loader2, Search, UserCog, Clock3, ChevronLeft, ChevronRight } from 'lucide-react';

const parseApiResponse = async (response: Response) => {
  const responseText = await response.text();

  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      response.status === 404
        ? 'Membership applications API was not found. Restart the local API server.'
        : 'The API returned an invalid response. Restart the local API server and try again.'
    );
  }
};

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  rejection_reason: string | null;
  profile_type: string | null;
  location: string | null;
  phone: string | null;
  tier: string | null;
  application_data: Record<string, unknown> | null;
  created_at: string;
}

interface ActionDialogState {
  type: 'approve' | 'reject' | 'delete' | null;
  profile: Profile | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialogState, setDialogState] = useState<ActionDialogState>({ type: null, profile: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      toast.error('Access Denied', {
        description: 'You do not have admin privileges',
      });
      navigate('/');
      return;
    }

    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin-membership-applications');
      const result = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      setUsers((result.applications || []).filter((profile: Profile) => profile.status === 'approved'));
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'Failed to fetch users',
      });
    }

    setLoading(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((profile) => {
      const matchesSearch =
        !searchQuery ||
        profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || (profile.role ?? 'user') === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchQuery, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const openDialog = (type: ActionDialogState['type'], profile: Profile) => {
    setDialogState({ type, profile });
  };

  const closeDialog = () => {
    setDialogState({ type: null, profile: null });
  };

  const handleDeleteUser = async () => {
    if (!dialogState.profile) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch('/api/admin-delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dialogState.profile.id,
        }),
      });

      const result = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Unable to delete user');
      }

      toast.success('User Deleted', {
        description: `${dialogState.profile.email} has been removed`,
      });
      closeDialog();
      fetchUsers();
    } catch (error: any) {
      toast.error('Delete Failed', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Update Failed', {
        description: error.message,
      });
    } else {
      toast.success('Role Updated', {
        description: `User role changed to ${newRole}`,
      });
      fetchUsers();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage approved members and platform access
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Approved Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{users.length}</div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#A89F91]">
                  {users.filter((u) => u.role === 'admin').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Member Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {users.filter((u) => u.role && u.role !== 'admin').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {
                    users.filter(
                      (u) =>
                        new Date(u.created_at).getMonth() === new Date().getMonth()
                    ).length
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48 border-gray-300">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="business">Service Provider</SelectItem>
                    <SelectItem value="agency">Agency Owner</SelectItem>
                    <SelectItem value="estates">Estates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#A89F91]" />
                Approved Members ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                View approved members, manage admin access, and delete accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-[#A89F91] text-white">
                              {(profile.full_name?.[0] || profile.email[0]).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <span className="font-medium text-gray-900">
                              {profile.full_name || 'No Name'}
                            </span>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                            <p className="text-xs text-gray-500">
                              {profile.location || 'Location not provided'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            (profile.status ?? 'pending') === 'approved'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : (profile.status ?? 'pending') === 'rejected'
                              ? 'bg-red-100 text-red-700 hover:bg-red-100'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }
                        >
                          {(profile.status ?? 'pending') === 'approved' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (profile.status ?? 'pending') === 'rejected' ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock3 className="w-3 h-3 mr-1" />
                          )}
                          {profile.status ?? 'pending'}
                        </Badge>
                        {profile.rejection_reason && (
                          <p className="mt-2 max-w-[220px] text-xs text-red-600">
                            {profile.rejection_reason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            profile.role === 'admin'
                              ? 'bg-[#A89F91] text-white hover:bg-[#8A8279]'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }
                        >
                          {profile.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {(profile.profile_type || 'pending').replace(/-/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {profile.tier ? profile.tier.replace(/-/g, ' ') : 'No plan selected'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gray-100"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateRole(
                                  profile.id,
                                  profile.role === 'admin' ? 'user' : 'admin'
                                )
                              }
                              className="cursor-pointer hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                            >
                              <UserCog className="w-4 h-4 mr-2" />
                              {profile.role === 'admin'
                                ? 'Remove Admin'
                                : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDialog('delete', profile)}
                              className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'bg-[#A89F91] text-white' : 'border-gray-300'}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 ml-2">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                  </span>
                </div>
              )}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>

      <Dialog open={Boolean(dialogState.type)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This will permanently remove the user account from the platform.
            </DialogDescription>
          </DialogHeader>

          {dialogState.profile && (
            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-900">
                {dialogState.profile.full_name || 'No Name'}
              </p>
              <p>{dialogState.profile.email}</p>
              <p className="mt-1 text-xs text-gray-500">
                {(dialogState.profile.profile_type || 'pending').replace(/-/g, ' ')}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
