import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Briefcase,
  Plus,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Eye,
  EyeOff,
  Pencil,
  Loader2,
} from 'lucide-react';

interface MyJob {
  id: string;
  job_title: string;
  job_category: string;
  location: string;
  salary_range: string;
  status: string;
  created_at: string;
  applicantCount: number;
}

export default function MyJobsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent('/my-jobs')}`);
      return;
    }
    fetchJobs();
  }, [authLoading, user]);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: jobsData, error } = await supabase
        .from('job_postings')
        .select('id, job_title, job_category, location, salary_range, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const jobIds = (jobsData || []).map((j) => j.id);
      let counts: Record<string, number> = {};
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('job_applications')
          .select('job_posting_id')
          .in('job_posting_id', jobIds);
        counts = (apps || []).reduce((acc: Record<string, number>, a) => {
          acc[a.job_posting_id] = (acc[a.job_posting_id] || 0) + 1;
          return acc;
        }, {});
      }

      setJobs(
        (jobsData || []).map((j) => ({
          ...j,
          applicantCount: counts[j.id] || 0,
        }))
      );
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (job: MyJob) => {
    setActionLoading(job.id);
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ status: newStatus })
        .eq('id', job.id);
      if (error) throw error;
      toast.success(`Job ${newStatus === 'active' ? 'published' : 'unpublished'}`);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job status');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="My Jobs - Summerland Estates"
        description="Manage the jobs you have posted."
        canonical="/my-jobs"
        noIndex={true}
      />
      <NavBar currentPage="" />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">My Jobs</h1>
              <p className="text-muted-foreground">
                Jobs you have posted — view applicants, edit, or unpublish.
              </p>
            </div>
            <Button
              onClick={() => navigate('/post-job')}
              className="bg-[#A89F91] text-white hover:bg-[#8A8279]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#A89F91]" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="bg-white p-12 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No jobs posted yet</h3>
              <p className="mb-4 text-gray-500">Post your first job to start receiving applicants.</p>
              <Button
                onClick={() => navigate('/post-job')}
                className="bg-[#A89F91] text-white hover:bg-[#8A8279]"
              >
                Post a Job
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{job.job_title}</h3>
                        <Badge
                          className={
                            job.status === 'active'
                              ? 'border-0 bg-green-100 text-green-700'
                              : 'border-0 bg-gray-100 text-gray-600'
                          }
                        >
                          {job.status === 'active' ? 'Published' : 'Closed'}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3.5 w-3.5" />
                          {formatDate(job.created_at)}
                        </span>
                        <button
                          onClick={() => navigate(`/my-jobs/${job.id}/applicants`)}
                          className="flex items-center text-[#A89F91] hover:underline"
                        >
                          <Users className="mr-1 h-3.5 w-3.5" />
                          {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
                        </button>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {actionLoading === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={() => navigate(`/job/${job.id}`)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/my-jobs/${job.id}/applicants`)}
                          className="cursor-pointer"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Applicants ({job.applicantCount})
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/my-jobs/edit/${job.id}`)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePublishToggle(job)}
                          className="cursor-pointer"
                        >
                          {job.status === 'active' ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
