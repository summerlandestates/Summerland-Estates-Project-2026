import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { emailNotifications } from '@/services/emailNotifications';
import { toast } from 'sonner';
import {
  Handshake,
  Search,
  Filter,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Globe,
  Building2,
  User,
  ArrowLeft,
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';

interface Sponsorship {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  sponsorship_type: 'event' | 'newsletter' | 'website' | 'premium_content' | 'custom';
  budget_range: string;
  message: string | null;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  start_date: string | null;
  end_date: string | null;
  amount: number | null;
  created_at: string;
  updated_at: string;
}

const sponsorshipTypeLabels: Record<string, string> = {
  event: 'Event Sponsorship',
  newsletter: 'Newsletter Sponsorship',
  website: 'Website Banner',
  premium_content: 'Premium Content',
  custom: 'Custom Partnership'
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-100 text-blue-700' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700' }
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'event', label: 'Event Sponsorship' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'website', label: 'Website Banner' },
  { value: 'premium_content', label: 'Premium Content' },
  { value: 'custom', label: 'Custom' }
];

export default function AdminSponsorshipsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.email !== 'admin@summerlandestates.com' && !authLoading) {
      navigate('/');
      return;
    }
    loadSponsorships();
  }, [user, authLoading]);

  const loadSponsorships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsorships(data || []);
    } catch (error) {
      console.error('Error loading sponsorships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSponsorship || !newStatus) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('sponsorships')
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSponsorship.id);

      if (error) throw error;

      // Send status update notification to user
      await emailNotifications.notifyStatusUpdate({
        userEmail: selectedSponsorship.email,
        userName: selectedSponsorship.contact_name,
        itemType: 'Sponsorship Inquiry',
        itemName: selectedSponsorship.company_name,
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });

      toast.success(`Status updated to ${newStatus}. User has been notified.`);

      setSponsorships(prev =>
        prev.map(s =>
          s.id === selectedSponsorship.id
            ? { ...s, status: newStatus as any, admin_notes: adminNotes }
            : s
        )
      );

      setIsStatusDialogOpen(false);
      setSelectedSponsorship(null);
      setNewStatus('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusDialog = (sponsorship: Sponsorship) => {
    setSelectedSponsorship(sponsorship);
    setNewStatus(sponsorship.status);
    setAdminNotes(sponsorship.admin_notes || '');
    setIsStatusDialogOpen(true);
  };

  const openDetailDialog = (sponsorship: Sponsorship) => {
    setSelectedSponsorship(sponsorship);
    setIsDetailDialogOpen(true);
  };

  const filteredSponsorships = sponsorships.filter(s => {
    const matchesSearch =
      s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesType = typeFilter === 'all' || s.sponsorship_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: sponsorships.length,
    pending: sponsorships.filter(s => s.status === 'pending').length,
    reviewing: sponsorships.filter(s => s.status === 'reviewing').length,
    approved: sponsorships.filter(s => s.status === 'approved').length,
    completed: sponsorships.filter(s => s.status === 'completed').length
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge className={option?.color || 'bg-gray-100'}>
        {option?.label || status}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-x-hidden overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Handshake className="w-8 h-8 text-[#A89F91]" />
                <div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900">
                    Sponsorship Management
                  </h1>
                  <p className="text-gray-600">
                    Review and manage sponsorship inquiries
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-white">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </Card>
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
              <div className="text-sm text-amber-600">Pending</div>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.reviewing}</div>
              <div className="text-sm text-blue-600">Reviewing</div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
              <div className="text-sm text-green-600">Approved</div>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{stats.completed}</div>
              <div className="text-sm text-purple-600">Completed</div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by company, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <Handshake className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Budget</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSponsorships.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Handshake className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No sponsorships found</p>
                        <p className="text-sm">Inquiries will appear here when submitted</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSponsorships.map((sponsorship) => (
                      <tr key={sponsorship.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#A89F91]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-[#A89F91]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{sponsorship.company_name}</p>
                              <p className="text-sm text-gray-500">{sponsorship.contact_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">
                            {sponsorshipTypeLabels[sponsorship.sponsorship_type]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {sponsorship.budget_range}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(sponsorship.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(sponsorship.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailDialog(sponsorship)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusDialog(sponsorship)}
                              className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10"
                            >
                              Update
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#A89F91]" />
              Sponsorship Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedSponsorship && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-[#A89F91]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#A89F91]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedSponsorship.company_name}</h3>
                  {getStatusBadge(selectedSponsorship.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Contact Name</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    {selectedSponsorship.contact_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${selectedSponsorship.email}`} className="text-[#A89F91] hover:underline">
                      {selectedSponsorship.email}
                    </a>
                  </p>
                </div>
                {selectedSponsorship.phone && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Phone</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${selectedSponsorship.phone}`} className="text-[#A89F91] hover:underline">
                        {selectedSponsorship.phone}
                      </a>
                    </p>
                  </div>
                )}
                {selectedSponsorship.website && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Website</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={selectedSponsorship.website} target="_blank" rel="noopener noreferrer" className="text-[#A89F91] hover:underline truncate">
                        {selectedSponsorship.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-sm">Sponsorship Type</Label>
                  <p className="font-medium mt-1">
                    {sponsorshipTypeLabels[selectedSponsorship.sponsorship_type]}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Budget Range</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    {selectedSponsorship.budget_range}
                  </p>
                </div>
              </div>

              {selectedSponsorship.message && (
                <div>
                  <Label className="text-muted-foreground text-sm">Message</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedSponsorship.message}</p>
                  </div>
                </div>
              )}

              {selectedSponsorship.admin_notes && (
                <div>
                  <Label className="text-muted-foreground text-sm">Admin Notes</Label>
                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">{selectedSponsorship.admin_notes}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Submitted: {new Date(selectedSponsorship.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(selectedSponsorship.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsDetailDialogOpen(false);
                openStatusDialog(selectedSponsorship!);
              }}
              className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Sponsorship Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.filter(o => o.value !== 'all').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this sponsorship deal..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
