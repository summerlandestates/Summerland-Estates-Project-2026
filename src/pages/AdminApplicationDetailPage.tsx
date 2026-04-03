import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { loadSessionJson, saveSessionJson } from '@/lib/adminSession';
import {
  formatApplicationFieldLabel,
  getProfileTypeLabel,
  getTierLabel,
  mapMembershipApplication,
  parseApiResponse,
  type MembershipApplication,
} from '@/lib/adminApplications';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Building2,
  Briefcase,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const getProfileTypeIcon = (type: string) => {
  switch (type) {
    case 'professional':
      return <User className="w-5 h-5" />;
    case 'service-provider':
      return <Building2 className="w-5 h-5" />;
    case 'agency':
      return <Briefcase className="w-5 h-5" />;
    case 'estates':
      return <Home className="w-5 h-5" />;
    default:
      return <User className="w-5 h-5" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const renderApplicationValue = (value: unknown) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'None';
    }

    if (value.every((item) => typeof item === 'object' && item !== null && 'name' in item)) {
      return (
        <div className="space-y-2">
          {(value as Array<{ name: string; type?: string; size?: number; dataUrl?: string | null; publicUrl?: string | null }>).map((item) => (
            <div
              key={`${item.name}-${item.size || 0}`}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type || 'File'}
                    {item.size ? ` • ${(item.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                  </p>
                </div>
                {item.publicUrl || item.dataUrl ? (
                  <a
                    href={item.publicUrl || item.dataUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[#CFC5B7] px-3 py-1 text-xs font-medium text-[#8A8279] transition-colors hover:bg-[#F7F1EA]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Preview unavailable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  return String(value);
};

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const cacheKey = id ? `admin-application-detail:${id}` : 'admin-application-detail';
  const cachedApplication = loadSessionJson<MembershipApplication | null>(cacheKey, null);
  const [application, setApplication] = useState<MembershipApplication | null>(cachedApplication);
  const [loading, setLoading] = useState(!cachedApplication);
  const [reviewActionsEnabled, setReviewActionsEnabled] = useState(true);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user, id]);

  useEffect(() => {
    if (!application || !id) return;
    saveSessionJson(`admin-application-detail:${id}`, application);
  }, [application, id]);

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

    fetchApplication();
  };

  const fetchApplication = async () => {
    if (!id) {
      toast.error('Application not found');
      navigate('/admin/applications');
      return;
    }

    if (!application) {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/admin-membership-applications/${id}`);
      const result = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load application');
      }

      setApplication(mapMembershipApplication(result.application));
      setReviewActionsEnabled(result.reviewActionsEnabled !== false);
    } catch (error: any) {
      toast.error('Failed to load application', {
        description: error.message || 'Please try again.',
      });
      navigate('/admin/applications');
    } finally {
      setLoading(false);
    }
  };

  const closeDecisionDialog = () => {
    setDecisionType(null);
    setReviewNotes('');
  };

  const handleReviewDecision = async () => {
    if (!application || !decisionType) return;

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
          userId: application.id,
          action: decisionType,
          rejectionReason: decisionType === 'reject' ? reviewNotes.trim() : null,
          reviewedBy: user?.id,
        }),
      });

      const result = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application');
      }

      const updatedStatus = decisionType === 'approve' ? 'approved' : 'rejected';
      const updatedNotes = decisionType === 'reject' ? reviewNotes.trim() : undefined;

      setApplication((current) =>
        current
          ? {
              ...current,
              status: updatedStatus,
              notes: updatedNotes,
              applicationData: {
                ...current.applicationData,
                account_status: updatedStatus,
                rejection_reason: updatedNotes || null,
              },
            }
          : current
      );

      toast.success(
        decisionType === 'approve' ? 'Application Approved' : 'Application Rejected',
        {
          description:
            decisionType === 'approve'
              ? 'The applicant can now sign in and has been notified by email.'
              : 'The applicant has been notified by email.',
        }
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <Button
            variant="ghost"
            className="mb-6 rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => navigate('/admin/applications')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <Card className="overflow-hidden border-border/60">
                <div className="border-b border-border/60 bg-muted/20 p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A89F91]/10 text-[#8A8279]">
                        {getProfileTypeIcon(application.profileType)}
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-3xl font-heading font-bold text-foreground">
                            {application.name}
                          </h1>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{getProfileTypeLabel(application.profileType)}</Badge>
                          <Badge variant="outline">{getTierLabel(application.selectedTier)}</Badge>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {application.email}
                          </span>
                          <span className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {application.phone}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {application.location}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Submitted {new Date(application.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <Card className="border-border/60 p-5">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Profile Summary</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Primary Role</p>
                        <p className="mt-1 text-foreground">{application.role || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Years of Experience</p>
                        <p className="mt-1 text-foreground">{application.yearsExperience || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Bio</p>
                      <p className="mt-1 leading-7 text-foreground">{application.bio || 'Not provided'}</p>
                    </div>
                  </Card>

                  <Card className="border-border/60 p-5">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-foreground">Submitted Details</h2>
                      <p className="text-sm text-muted-foreground">
                        All information captured during account creation.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(application.applicationData || {}).map(([key, value]) => (
                        <div
                          key={key}
                          className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {formatApplicationFieldLabel(key)}
                          </p>
                          <div className="text-sm text-foreground">{renderApplicationValue(value)}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {application.notes && (
                    <Card className="border-red-200 bg-red-50 p-5">
                      <h2 className="text-lg font-semibold text-red-700">Rejection Reason</h2>
                      <p className="mt-2 text-sm leading-7 text-red-600">{application.notes}</p>
                    </Card>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border/60 p-5">
                <h2 className="text-lg font-semibold text-foreground">Review Actions</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Confirm the submission and update access for this account.
                </p>

                {!reviewActionsEnabled && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` and restart the API server to enable approval and rejection.
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <Button
                    className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:cursor-not-allowed"
                    disabled={!reviewActionsEnabled || application.status !== 'pending'}
                    onClick={() => setDecisionType('approve')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl disabled:cursor-not-allowed"
                    disabled={!reviewActionsEnabled || application.status !== 'pending'}
                    onClick={() => setDecisionType('reject')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Application
                  </Button>
                </div>
              </Card>

              <Card className="border-border/60 p-5">
                <h2 className="text-lg font-semibold text-foreground">Application Snapshot</h2>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Application ID</p>
                    <p className="mt-1 break-all text-foreground">{application.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Status</p>
                    <div className="mt-2">{getStatusBadge(application.status)}</div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Selected Plan</p>
                    <p className="mt-1 text-foreground">{getTierLabel(application.selectedTier)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submission Date</p>
                    <p className="mt-1 text-foreground">
                      {new Date(application.submittedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
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
                ? 'This will activate the account and email the approval notice.'
                : 'This will keep the account blocked and email the rejection notice.'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">{application.name}</p>
            <p className="text-muted-foreground">{application.email}</p>
          </div>

          {decisionType === 'reject' && (
            <div className="space-y-2">
              <label htmlFor="detail-review-reason" className="text-sm font-medium text-foreground">
                Rejection reason
              </label>
              <Textarea
                id="detail-review-reason"
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
