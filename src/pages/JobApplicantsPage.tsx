import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  Mail,
  Phone,
  Users,
} from 'lucide-react';

interface Applicant {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
}

interface JobInfo {
  id: string;
  job_title: string;
  user_id: string;
}

export default function JobApplicantsPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/my-jobs/${jobId}/applicants`)}`);
      return;
    }
    load();
  }, [authLoading, user, jobId]);

  const load = async () => {
    if (!user || !jobId) return;
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      const isAdmin = profile?.role === 'admin';

      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('id, job_title, user_id')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError) throw jobError;
      if (!jobData || (jobData.user_id !== user.id && !isAdmin)) {
        setDenied(true);
        return;
      }
      setJob(jobData);

      const { data: apps, error: appsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_posting_id', jobId)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      setApplicants(apps || []);
    } catch (error) {
      console.error('Error loading applicants:', error);
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Applicants - Summerland Estates"
        description="View applicants for your job posting."
        canonical="/my-jobs"
        noIndex={true}
      />
      <NavBar currentPage="" />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-jobs')}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Jobs
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Applicants{job ? ` — ${job.job_title}` : ''}
            </h1>
            <p className="text-muted-foreground">
              {applicants.length} applicant{applicants.length === 1 ? '' : 's'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#A89F91]" />
            </div>
          ) : denied ? (
            <Card className="bg-white p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Not authorized</h3>
              <p className="mb-4 text-gray-500">
                You can only view applicants for your own jobs.
              </p>
              <Button
                onClick={() => navigate('/my-jobs')}
                className="bg-[#A89F91] text-white hover:bg-[#8A8279]"
              >
                Back to My Jobs
              </Button>
            </Card>
          ) : applicants.length === 0 ? (
            <Card className="bg-white p-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No applicants yet</h3>
              <p className="text-gray-500">
                Share your job link — new applications will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => (
                <Card key={app.id} className="bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{app.applicant_name}</h3>
                        <Badge className="border-0 bg-gray-100 text-gray-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(app.created_at)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                        <a
                          href={`mailto:${app.applicant_email}`}
                          className="flex items-center hover:text-[#A89F91] hover:underline"
                        >
                          <Mail className="mr-1.5 h-3.5 w-3.5" />
                          {app.applicant_email}
                        </a>
                        {app.applicant_phone && (
                          <a
                            href={`tel:${app.applicant_phone}`}
                            className="flex items-center hover:text-[#A89F91] hover:underline"
                          >
                            <Phone className="mr-1.5 h-3.5 w-3.5" />
                            {app.applicant_phone}
                          </a>
                        )}
                        {app.resume_url && (
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center font-medium text-[#A89F91] hover:underline"
                          >
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            Download Resume
                          </a>
                        )}
                      </div>
                      {app.cover_letter && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                            Cover Message
                          </p>
                          <p className="whitespace-pre-wrap">{app.cover_letter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
