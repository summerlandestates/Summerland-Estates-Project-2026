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
  Send,
  Search,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  DollarSign,
  Mail,
  User,
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCheck
} from 'lucide-react';

interface EmailBlast {
  id: string;
  user_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  content: string;
  target_audience: string;
  status: 'pending_payment' | 'pending_review' | 'approved' | 'sent' | 'rejected';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id: string | null;
  amount_paid: number;
  scheduled_send_at: string | null;
  sent_at: string | null;
  recipients_count: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-gray-100 text-gray-700' },
  { value: 'pending_review', label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  { value: 'sent', label: 'Sent', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' }
];

const audienceLabels: Record<string, string> = {
  all: 'All Members',
  professionals: 'Estate Professionals',
  businesses: 'Business Owners',
  agencies: 'Agencies & Recruiters'
};

export default function AdminEmailBlastsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [emailBlasts, setEmailBlasts] = useState<EmailBlast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBlast, setSelectedBlast] = useState<EmailBlast | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSendingDialogOpen, setIsSendingDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.email !== 'admin@summerlandestates.com' && !authLoading) {
      navigate('/');
      return;
    }
    loadEmailBlasts();
  }, [user, authLoading]);

  const loadEmailBlasts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_blast_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmailBlasts(data || []);
    } catch (error) {
      console.error('Error loading email blasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBlast || !newStatus) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('email_blast_submissions')
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBlast.id);

      if (error) throw error;

      // Send status update notification to user
      await emailNotifications.notifyStatusUpdate({
        userEmail: selectedBlast.sender_email,
        userName: selectedBlast.sender_name,
        itemType: 'Email Blast',
        itemName: selectedBlast.subject,
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });

      toast.success(`Status updated to ${newStatus}. User has been notified.`);

      setEmailBlasts(prev =>
        prev.map(b =>
          b.id === selectedBlast.id
            ? { ...b, status: newStatus as any, admin_notes: adminNotes }
            : b
        )
      );

      setIsReviewDialogOpen(false);
      setSelectedBlast(null);
      setNewStatus('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedBlast) return;

    setIsUpdating(true);
    try {
      // In production, this would trigger the actual email send
      const { error } = await supabase
        .from('email_blast_submissions')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipients_count: 8500, // This would be actual count
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBlast.id);

      if (error) throw error;

      setEmailBlasts(prev =>
        prev.map(b =>
          b.id === selectedBlast.id
            ? { ...b, status: 'sent', sent_at: new Date().toISOString() }
            : b
        )
      );

      setIsSendingDialogOpen(false);
      setIsDetailDialogOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openReviewDialog = (blast: EmailBlast) => {
    setSelectedBlast(blast);
    setNewStatus(blast.status);
    setAdminNotes(blast.admin_notes || '');
    setIsReviewDialogOpen(true);
  };

  const openDetailDialog = (blast: EmailBlast) => {
    setSelectedBlast(blast);
    setIsDetailDialogOpen(true);
  };

  const openSendDialog = (blast: EmailBlast) => {
    setSelectedBlast(blast);
    setIsSendingDialogOpen(true);
  };

  const filteredBlasts = emailBlasts.filter(b => {
    const matchesSearch =
      b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sender_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: emailBlasts.length,
    pendingReview: emailBlasts.filter(b => b.status === 'pending_review').length,
    approved: emailBlasts.filter(b => b.status === 'approved').length,
    sent: emailBlasts.filter(b => b.status === 'sent').length,
    revenue: emailBlasts
      .filter(b => b.payment_status === 'completed')
      .reduce((sum, b) => sum + (b.amount_paid || 0), 0)
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge className={option?.color || 'bg-gray-100'}>
        {option?.label || status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-amber-100 text-amber-700'
    };
    return (
      <Badge className={colors[status] || 'bg-gray-100'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                <Send className="w-8 h-8 text-[#A89F91]" />
                <div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900">
                    Email Blast Management
                  </h1>
                  <p className="text-gray-600">
                    Review, approve, and send email blast campaigns
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
              <div className="text-2xl font-bold text-amber-700">{stats.pendingReview}</div>
              <div className="text-sm text-amber-600">Pending Review</div>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.approved}</div>
              <div className="text-sm text-blue-600">Approved</div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-700">{stats.sent}</div>
              <div className="text-sm text-green-600">Sent</div>
            </Card>
            <Card className="p-4 bg-[#A89F91]/10 border-[#A89F91]/20">
              <div className="text-2xl font-bold text-[#A89F91]">${stats.revenue.toFixed(2)}</div>
              <div className="text-sm text-[#A89F91]/80">Revenue</div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by subject, sender, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <Send className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pending Review Alert */}
          {stats.pendingReview > 0 && (
            <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-amber-800">
                  <strong>{stats.pendingReview} email blast{stats.pendingReview > 1 ? 's' : ''}</strong> pending review.
                  Please review and approve for sending.
                </p>
              </div>
            </Card>
          )}

          {/* Table */}
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Audience</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBlasts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No email blasts found</p>
                        <p className="text-sm">Submissions will appear here when users create them</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBlasts.map((blast) => (
                      <tr key={blast.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 truncate">{blast.subject}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {blast.content.slice(0, 60)}...
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{blast.sender_name}</p>
                          <p className="text-sm text-gray-500">{blast.sender_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">
                            {audienceLabels[blast.target_audience] || blast.target_audience}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {getPaymentBadge(blast.payment_status)}
                            <p className="text-sm text-gray-600">${blast.amount_paid}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(blast.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            <p>Created: {new Date(blast.created_at).toLocaleDateString()}</p>
                            {blast.scheduled_send_at && (
                              <p className="text-[#A89F91]">
                                Scheduled: {new Date(blast.scheduled_send_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailDialog(blast)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {blast.status === 'pending_review' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewDialog(blast)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            )}
                            {blast.status === 'approved' && blast.payment_status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSendDialog(blast)}
                                className="border-green-200 text-green-600 hover:bg-green-50"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Send Now
                              </Button>
                            )}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#A89F91]" />
              Email Blast Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedBlast && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedBlast.status)}
                {getPaymentBadge(selectedBlast.payment_status)}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Subject</Label>
                  <p className="font-semibold text-lg mt-1">{selectedBlast.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Sender Name</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      {selectedBlast.sender_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Sender Email</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedBlast.sender_email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Target Audience</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-[#A89F91]" />
                      {audienceLabels[selectedBlast.target_audience]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Amount Paid</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      ${selectedBlast.amount_paid}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">Email Content</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-500 mb-1">From: {selectedBlast.sender_name} &lt;{selectedBlast.sender_email}&gt;</p>
                    <p className="text-sm text-gray-500">Subject: {selectedBlast.subject}</p>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {selectedBlast.content}
                  </pre>
                </div>
              </div>

              {selectedBlast.admin_notes && (
                <div>
                  <Label className="text-muted-foreground text-sm">Admin Notes</Label>
                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">{selectedBlast.admin_notes}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Created: {new Date(selectedBlast.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(selectedBlast.updated_at).toLocaleString()}</p>
                {selectedBlast.sent_at && (
                  <p className="text-green-600">Sent: {new Date(selectedBlast.sent_at).toLocaleString()}</p>
                )}
                {selectedBlast.recipients_count && (
                  <p>Recipients: {selectedBlast.recipients_count.toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedBlast?.status === 'pending_review' && (
              <Button
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  openReviewDialog(selectedBlast);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Review & Approve
              </Button>
            )}
            {selectedBlast?.status === 'approved' && selectedBlast?.payment_status === 'completed' && (
              <Button
                onClick={() => openSendDialog(selectedBlast)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Email Blast</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedBlast?.subject}</p>
              <p className="text-sm text-gray-500">From: {selectedBlast?.sender_name}</p>
            </div>

            <div className="space-y-2">
              <Label>Decision</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Approve for Sending
                    </span>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Reject
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Admin Notes (optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || !newStatus}
              className={newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : newStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#A89F91]'}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {newStatus === 'approved' ? 'Approve' : newStatus === 'rejected' ? 'Reject' : 'Save'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={isSendingDialogOpen} onOpenChange={setIsSendingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Confirm Send
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to send this email blast to{' '}
              <strong>{audienceLabels[selectedBlast?.target_audience || 'all']}</strong>?
            </p>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedBlast?.subject}</p>
              <p className="text-sm text-gray-500">From: {selectedBlast?.sender_name}</p>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              This action cannot be undone. The email will be sent immediately to all recipients.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Yes, Send Email Blast
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
