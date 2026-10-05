import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flag, CheckCircle2, XCircle, Loader2, Search, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  reporter_id: string | null;
  target_type: string;
  target_id: string;
  target_label: string | null;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  resolved_at?: string | null;
}

const TARGET_LABELS: Record<string, string> = {
  profile: 'Profile',
  job: 'Job',
  message: 'Message',
  service_request: 'Service Request',
  review: 'Review',
  event: 'Event',
  article: 'Article',
  post: 'Post',
};

const targetLink = (report: Report): string | null => {
  switch (report.target_type) {
    case 'profile':
      return `/profile/${report.target_id}`;
    case 'job':
      return `/job/${report.target_id}`;
    case 'service_request':
      return `/service-request/${report.target_id}`;
    case 'event':
      return `/event/${report.target_id}`;
    case 'article':
      return `/articles/${report.target_id}`;
    default:
      return null;
  }
};

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/admin/login');
      return;
    }
    checkAdminAccess();
  }, [authLoading, user]);

  const checkAdminAccess = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchReports();
  };

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reports', { description: error.message });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (report: Report, status: 'resolved' | 'dismissed') => {
    setActing(report.id);
    const { error } = await supabase
      .from('reports')
      .update({ status, resolved_at: new Date().toISOString(), resolved_by: user?.id })
      .eq('id', report.id);

    if (error) {
      toast.error('Update failed', { description: error.message });
    } else {
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status } : r))
      );
      toast.success(`Report ${status}`);
    }
    setActing(null);
  };

  const removeReviewedContent = async (report: Report) => {
    if (report.target_type !== 'review') return;
    setActing(report.id);
    const { error } = await supabase
      .from('reviews')
      .update({ removed: true, updated_at: new Date().toISOString() })
      .eq('id', report.target_id);
    if (error) {
      toast.error('Could not remove review', { description: error.message });
      setActing(null);
      return;
    }
    await updateStatus(report, 'resolved');
    toast.success('Review removed');
  };

  const filtered = reports.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.target_label?.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.target_type.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-[#A89F91] mx-auto mb-4" />
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div>
      <main>
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <Flag className="w-7 h-7 text-[#A89F91]" />
              Reported Content
            </h1>
            <p className="text-muted-foreground">
              Review member reports and take moderation action.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No {statusFilter === 'all' ? '' : statusFilter} reports</p>
              <p className="text-sm text-muted-foreground">New reports from members will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((report) => (
                <Card key={report.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary">{TARGET_LABELS[report.target_type] || report.target_type}</Badge>
                        <Badge
                          className={
                            report.status === 'open'
                              ? 'bg-amber-100 text-amber-700'
                              : report.status === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                          }
                        >
                          {report.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{report.target_label || report.target_id}</p>
                      <p className="text-sm text-muted-foreground">Reason: {report.reason}</p>
                      {report.details && (
                        <p className="text-sm text-muted-foreground mt-1">“{report.details}”</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {targetLink(report) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(targetLink(report)!, '_blank')}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      )}
                      {report.target_type === 'review' && report.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={acting === report.id}
                          onClick={() => removeReviewedContent(report)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Review
                        </Button>
                      )}
                      {report.status === 'open' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                            disabled={acting === report.id}
                            onClick={() => updateStatus(report, 'resolved')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={acting === report.id}
                            onClick={() => updateStatus(report, 'dismissed')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
