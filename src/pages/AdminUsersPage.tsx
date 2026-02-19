import { useEffect, useState } from 'react';
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
import { Users, Trash2, MoreVertical, CheckCircle, XCircle, Loader2, Search, UserCog } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error', {
        description: 'Failed to fetch users',
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      toast.error('Delete Failed', {
        description: error.message,
      });
    } else {
      toast.success('User Deleted', {
        description: `${email} has been removed`,
      });
      fetchUsers();
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
              Manage all registered users and their permissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Users
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
                  Regular Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {users.filter((u) => u.role !== 'admin').length}
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
                All Users ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                View and manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-[#A89F91] text-white">
                              {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">
                            {profile.full_name || 'No Name'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{profile.email}</TableCell>
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
                          <DropdownMenuContent align="end" className="w-48">
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
                              onClick={() =>
                                handleDeleteUser(profile.id, profile.email)
                              }
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
    </div>
  );
}
