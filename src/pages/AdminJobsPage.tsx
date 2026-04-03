import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Briefcase, 
  Users,
  MoreVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface JobPosting {
  id: string;
  job_title: string;
  job_category: string;
  job_description: string;
  location: string;
  salary_range: string;
  employment_types: string[];
  created_at: string;
  user_id: string;
  status: string;
}

interface ServiceRequest {
  id: string;
  service_needed: string;
  location: string;
  date_needed: string;
  details: string;
  budget_min: number;
  budget_max: number;
  created_at: string;
  user_id: string;
  status: string;
}

export default function AdminJobsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'job' | 'service' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

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

    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all job postings (including drafts)
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch all service requests (including drafts)
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServiceRequests(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (id: string, type: 'job' | 'service', currentStatus: string) => {
    setActionLoading(id);
    // Jobs use 'active'/'closed', Services use 'open'/'closed'
    const activeStatus = type === 'job' ? 'active' : 'open';
    const newStatus = currentStatus === activeStatus ? 'closed' : activeStatus;
    const table = type === 'job' ? 'job_postings' : 'service_requests';

    try {
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      const isNowActive = newStatus === activeStatus;
      toast.success(`${type === 'job' ? 'Job' : 'Service request'} ${isNowActive ? 'published' : 'unpublished'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setActionLoading(itemToDelete.id);
    const table = itemToDelete.type === 'job' ? 'job_postings' : 'service_requests';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      toast.success(`${itemToDelete.type === 'job' ? 'Job posting' : 'Service request'} deleted successfully`);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = serviceRequests.filter(service =>
    service.service_needed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string, type: 'job' | 'service' = 'job') => {
    const activeStatus = type === 'job' ? 'active' : 'open';
    if (status === activeStatus) {
      return <Badge className="bg-green-100 text-green-700 border-0">Published</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-600 border-0">Closed</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-xl font-semibold text-gray-900">Jobs & Service Requests</h1>
            </div>
            <Button
              onClick={() => navigate('/post-job')}
              className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobs.filter(j => j.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500">Published Jobs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobs.filter(j => j.status !== 'active').length}
                </p>
                <p className="text-sm text-gray-500">Draft Jobs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {serviceRequests.filter(s => s.status === 'open').length}
                </p>
                <p className="text-sm text-gray-500">Published Services</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {serviceRequests.filter(s => s.status !== 'open').length}
                </p>
                <p className="text-sm text-gray-500">Draft Services</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 mb-6">
            <TabsTrigger 
              value="jobs" 
              className="data-[state=active]:bg-[#A89F91] data-[state=active]:text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Job Postings ({jobs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="services"
              className="data-[state=active]:bg-[#A89F91] data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Service Requests ({serviceRequests.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
            </div>
          ) : (
            <>
              {/* Job Postings Tab */}
              <TabsContent value="jobs">
                {filteredJobs.length === 0 ? (
                  <Card className="p-12 text-center bg-white">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings</h3>
                    <p className="text-gray-500 mb-4">Create your first job posting to get started.</p>
                    <Button 
                      onClick={() => navigate('/post-job')}
                      className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                    >
                      Create Job Posting
                    </Button>
                  </Card>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{job.job_title}</p>
                                <p className="text-sm text-gray-500">{job.job_category}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                {job.location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {job.salary_range}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(job.status, 'job')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(job.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {actionLoading === job.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="w-4 h-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                  <DropdownMenuItem 
                                    onClick={() => navigate(`/job/${job.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handlePublishToggle(job.id, 'job', job.status)}
                                    className="cursor-pointer"
                                  >
                                    {job.status === 'active' ? (
                                      <>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setItemToDelete({ id: job.id, type: 'job' });
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Service Requests Tab */}
              <TabsContent value="services">
                {filteredServices.length === 0 ? (
                  <Card className="p-12 text-center bg-white">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Requests</h3>
                    <p className="text-gray-500 mb-4">Create your first service request to get started.</p>
                    <Button 
                      onClick={() => navigate('/post-job')}
                      className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                    >
                      Create Service Request
                    </Button>
                  </Card>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredServices.map((service) => (
                          <tr key={service.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{service.service_needed}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                {service.location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-1" />
                                ${service.budget_min || 0} - ${service.budget_max || 'Open'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(service.status, 'service')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(service.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {actionLoading === service.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="w-4 h-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                  <DropdownMenuItem 
                                    onClick={() => navigate(`/service-request/${service.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handlePublishToggle(service.id, 'service', service.status)}
                                    className="cursor-pointer"
                                  >
                                    {service.status === 'open' ? (
                                      <>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => navigate(`/admin/services/edit/${service.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setItemToDelete({ id: service.id, type: 'service' });
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type === 'job' ? 'job posting' : 'service request'}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading === itemToDelete?.id}
            >
              {actionLoading === itemToDelete?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
