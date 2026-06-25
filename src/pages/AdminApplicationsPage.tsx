import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { loadSessionJson, saveSessionJson } from '@/lib/adminSession';
import {
  getProfileTypeLabel,
  getTierLabel,
  mapMembershipApplication,
  parseApiResponse,
  type MembershipApplication,
} from '@/lib/adminApplications';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Building2, 
  Briefcase, 
  Home,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const cachedApplications = loadSessionJson<MembershipApplication[]>('admin-membership-applications', []);
  const [applications, setApplications] = useState<MembershipApplication[]>(cachedApplications);
  const [pageLoading, setPageLoading] = useState(cachedApplications.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [reviewActionsEnabled, setReviewActionsEnabled] = useState(true);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | null>(null);
  const [decisionApplication, setDecisionApplication] = useState<MembershipApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

  useEffect(() => {
    const queryStatus = searchParams.get('status');
    if (queryStatus === 'pending' || queryStatus === 'approved' || queryStatus === 'rejected') {
      setStatusFilter(queryStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    saveSessionJson('admin-membership-applications', applications);
  }, [applications]);

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

    fetchApplications();
  };

  const fetchApplications = async () => {
    setPageLoading(true);

    try {
      const response = await fetch('/api/admin-membership-applications');
      const result = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load applications');
      }

      setApplications((result.applications || []).map(mapMembershipApplication));
      setReviewActionsEnabled(result.reviewActionsEnabled !== false);
    } catch (error: any) {
      toast.error('Failed to load applications', {
        description: error.message,
      });
      setApplications([]);
      setReviewActionsEnabled(false);
    } finally {
      setPageLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.profileType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter]);

  const getProfileTypeIcon = (type: string) => {
    switch (type) {
      case 'professional': return <User className="w-4 h-4" />;
      case 'service-provider': return <Building2 className="w-4 h-4" />;
      case 'agency': return <Briefcase className="w-4 h-4" />;
      case 'estates': return <Home className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openDecisionDialog = (type: 'approve' | 'reject', application: MembershipApplication) => {
    setDecisionType(type);
    setDecisionApplication(application);
    if (type === 'approve') {
      setReviewNotes('');
    }
  };

  const closeDecisionDialog = () => {
    setDecisionType(null);
    setDecisionApplication(null);
    setReviewNotes('');
  };

  const handleReviewDecision = async () => {
    if (!decisionApplication || !decisionType) return;

    if (decisionType === 'reject' && !reviewNotes.trim()) {
      toast.error('Rejection reason required', {
        description: 'Please add a reason before rejecting this application.',
      });
      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch('/api/admin-review-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: decisionApplication.id,
          action: decisionType,
          rejectionReason: decisionType === 'reject' ? reviewNotes.trim() : null,
          reviewedBy: user?.id,
        }),
      });

      const result = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application');
      }

      toast.success(
        decisionType === 'approve' ? 'Application Approved' : 'Application Rejected',
        {
          description:
            decisionType === 'approve'
              ? 'The applicant can now sign in and has been notified by email.'
              : 'The applicant has been notified by email.',
        }
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === decisionApplication.id
            ? {
                ...application,
                status: decisionType === 'approve' ? 'approved' : 'rejected',
                notes: decisionType === 'reject' ? reviewNotes.trim() : undefined,
              }
            : application
        )
      );

      closeDecisionDialog();
    } catch (error: any) {
      toast.error('Review action failed', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Membership Applications
            </h1>
            <p className="text-muted-foreground">
              Review and manage membership applications
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">{applications.length}</p>
                </div>
                <FileText className="w-8 h-8 text-[#A89F91]" />
              </div>
            </Card>
            <Card className="p-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>
            <Card className="p-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </Card>
          </div>

          {!reviewActionsEnabled && (
            <Card className="mb-6 border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                Review actions are disabled until the Supabase service-role key is configured.
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env`, restart the API server, and approval emails plus account activation will work again.
              </p>
            </Card>
          )}

          {/* Filters */}
          <Card className="p-4 mb-6 bg-card">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Profile Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="service-provider">Service Provider</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="estates">Estates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Applications List */}
          <div className="space-y-4">
            {pageLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`application-skeleton-${index}`} className="p-6 bg-card">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="h-5 w-48 rounded-full bg-muted" />
                        <div className="h-4 w-72 rounded-full bg-muted" />
                        <div className="h-4 w-56 rounded-full bg-muted" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-9 w-24 rounded-xl bg-muted" />
                        <div className="h-9 w-24 rounded-xl bg-muted" />
                        <div className="h-9 w-24 rounded-xl bg-muted" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredApplications.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </Card>
            ) : (
              <>
              {paginatedApplications.map((application) => (
                <Card key={application.id} className="p-6 bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#A89F91]/10 flex items-center justify-center">
                        {getProfileTypeIcon(application.profileType)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">{application.name}</h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {application.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {application.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {application.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getProfileTypeLabel(application.profileType)}
                            {application.estatesSubType && ` - ${application.estatesSubType}`}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getTierLabel(application.selectedTier)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(application.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#CFC5B7] hover:bg-[#F7F1EA]"
                        onClick={() => navigate(`/admin/applications/${application.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:cursor-not-allowed"
                            disabled={!reviewActionsEnabled}
                            onClick={() => openDecisionDialog('approve', application)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl disabled:cursor-not-allowed"
                            disabled={!reviewActionsEnabled}
                            onClick={() => openDecisionDialog('reject', application)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

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
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length}
                  </span>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </main>

      <Dialog open={Boolean(decisionType)} onOpenChange={(open) => !open && closeDecisionDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {decisionType === 'approve' ? 'Approve membership application' : 'Reject membership application'}
            </DialogTitle>
            <DialogDescription>
              {decisionType === 'approve'
                ? 'This will grant access to the account and email the approval notice.'
                : 'This will keep the account blocked and email the rejection notice.'}
            </DialogDescription>
          </DialogHeader>

          {decisionApplication && (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
              <p className="font-medium text-foreground">{decisionApplication.name}</p>
              <p className="text-muted-foreground">{decisionApplication.email}</p>
            </div>
          )}

          {decisionType === 'reject' && (
            <div className="space-y-2">
              <label htmlFor="application-review-reason" className="text-sm font-medium text-foreground">
                Rejection reason
              </label>
              <Textarea
                id="application-review-reason"
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDecisionDialog} disabled={reviewLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewDecision}
              disabled={reviewLoading}
              variant={decisionType === 'approve' ? 'default' : 'destructive'}
              className={decisionType === 'approve' ? 'rounded-xl bg-green-600 hover:bg-green-700' : 'rounded-xl'}
            >
              {reviewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {decisionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
