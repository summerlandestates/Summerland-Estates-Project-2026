import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Activity, TrendingUp, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalPages: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
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

    fetchStats();
  };

  const fetchStats = async () => {
    setLoading(true);
    
    const { data: users } = await supabase.from('profiles').select('*');
    const { data: pages } = await supabase.from('content_pages').select('*');

    const now = new Date();
    const thisMonth = users?.filter(
      (u) => new Date(u.created_at).getMonth() === now.getMonth()
    ).length || 0;

    setStats({
      totalUsers: users?.length || 0,
      newUsersThisMonth: thisMonth,
      totalPages: pages?.length || 0,
      activeUsers: users?.filter((u) => u.role).length || 0,
    });

    setLoading(false);
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
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, Admin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200 hover:border-[#A89F91] transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-[#A89F91] transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  New This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#A89F91]">{stats.newUsersThisMonth}</div>
                <p className="text-xs text-gray-500 mt-1">New registrations</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-[#A89F91] transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalPages}</div>
                <p className="text-xs text-gray-500 mt-1">Published pages</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-[#A89F91] transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
                <p className="text-xs text-gray-500 mt-1">With assigned roles</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#A89F91]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#A89F91] hover:bg-[#A89F91]/5 transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">Manage Users</h4>
                    <p className="text-sm text-gray-600">View and manage all registered users</p>
                  </button>
                  <button
                    onClick={() => navigate('/admin/content')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#A89F91] hover:bg-[#A89F91]/5 transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">Edit Content</h4>
                    <p className="text-sm text-gray-600">Manage legal pages and site content</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#A89F91]" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database</span>
                    <span className="text-green-600 font-semibold">● Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Authentication</span>
                    <span className="text-green-600 font-semibold">● Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Storage</span>
                    <span className="text-green-600 font-semibold">● Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Remove old code below this line
const oldCode = () => {

  const handleToggleRole = async (userId: string, currentRole: string | null, email: string) => {
    const newRole = currentRole === 'admin' ? null : 'admin';
    
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
        description: `${email} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`,
      });
      fetchUsers();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed Out', {
      description: 'You have been signed out',
    });
    navigate('/admin/login');
  };

  const getInitials = (email: string, name: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Summerland Estates</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role !== 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all users and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
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
                  {users.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(profile.email, profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {profile.full_name || 'No name'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        {profile.role === 'admin' ? (
                          <Badge className="bg-primary">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleRole(profile.id, profile.role, profile.email)}
                            >
                              {profile.role === 'admin' ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Make Admin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(profile.id, profile.email)}
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
