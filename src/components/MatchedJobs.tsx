import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Briefcase, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { getTierLimits } from '@/utils/tierAccess';
import type { PricingTier } from '@/types';

interface JobPosting {
  id: string;
  job_title: string;
  job_category: string;
  job_description: string;
  location: string;
  salary_range: string;
  created_at: string;
  employment_types?: string[];
  match_score: number;
}

interface MatchedJobsProps {
  userId: string;
  userTier: PricingTier;
  maxResults?: number;
}

export default function MatchedJobs({ userId, userTier, maxResults = 5 }: MatchedJobsProps) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const limits = getTierLimits(userTier);

  useEffect(() => {
    if (!limits.canUseComparisons && userTier !== 'professional-pro') {
      setLoading(false);
      return;
    }
    fetchMatchedJobs();
  }, [userId, userTier]);

  const fetchMatchedJobs = async () => {
    setLoading(true);
    try {
      const [{ data: profileData, error: profileError }, { data: jobsData, error: jobsError }] = await Promise.all([
        supabase.from('profiles').select('location, bio, role, application_data').eq('id', userId).maybeSingle(),
        supabase.from('job_postings').select('*').eq('status', 'active').order('created_at', { ascending: false })
      ]);

      if (profileError) throw profileError;
      if (jobsError) throw jobsError;

      const resumeText = buildResumeText(profileData);
      const keywords = extractKeywords(resumeText);
      const profileLocation = profileData?.location || '';

      const scored = (jobsData || []).map((job: any) => {
        const jobText = `${job.job_title} ${job.job_category} ${job.job_description} ${job.location}`.toLowerCase();
        const locationMatch = profileLocation && job.location?.toLowerCase().includes(profileLocation.toLowerCase()) ? 1 : 0;
        const keywordMatches = keywords.filter(k => jobText.includes(k.toLowerCase())).length;
        const matchScore = locationMatch * 2 + keywordMatches;
        return { ...job, match_score: matchScore } as JobPosting;
      });

      const matched = scored.filter(j => j.match_score > 0).sort((a, b) => b.match_score - a.match_score).slice(0, maxResults);
      setJobs(matched);

      // Mark matches as notifications for Pro users
      for (const job of matched) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'job_match',
          title: `Job matched your resume: ${job.job_title}`,
          message: `${job.job_title} in ${job.location} looks like a great fit for your profile.`,
          link: `/job/${job.id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Matched jobs error:', error);
      toast.error('Failed to load matched jobs', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const buildResumeText = (profile: any): string => {
    const parts = [profile?.bio || '', profile?.role || ''];
    if (profile?.application_data) {
      const app = profile.application_data;
      if (typeof app === 'string') parts.push(app);
      else {
        if (app.skills) parts.push(Array.isArray(app.skills) ? app.skills.join(' ') : app.skills);
        if (app.experience) parts.push(app.experience);
        if (app.resume_text) parts.push(app.resume_text);
        if (app.headline) parts.push(app.headline);
        if (app.desired_role) parts.push(app.desired_role);
      }
    }
    return parts.filter(Boolean).join(' ');
  };

  const extractKeywords = (text: string): string[] => {
    const normalized = text.toLowerCase();
    const commonStopWords = new Set([
      'the', 'and', 'for', 'with', 'you', 'that', 'have', 'this', 'are', 'was',
      'will', 'can', 'from', 'they', 'she', 'her', 'his', 'him', 'been', 'has',
      'had', 'not', 'but', 'all', 'any', 'may', 'use', 'out', 'per'
    ]);
    return normalized
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !commonStopWords.has(w))
      .filter((w, i, arr) => arr.indexOf(w) === i);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!limits.canUseComparisons && userTier !== 'professional-pro') {
    return (
      <Card className="p-6 border-dashed border-2 border-[#A89F91]/30 bg-[#f9f6f2]">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#A89F91]" />
          <h3 className="text-lg font-semibold text-[#23231f] mb-1">Job Matching</h3>
          <p className="text-sm text-[#6b665f]">Upgrade to Pro to get jobs sent to you that match your resume.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-center h-24">
          <div className="w-6 h-6 border-2 border-[#A89F91] border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-6 border-gray-200">
        <h3 className="text-lg font-semibold text-[#23231f] mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#A89F91]" /> Jobs That Match Your Resume</h3>
        <p className="text-sm text-[#6b665f]">No current openings match your profile. Update your profile bio, role, and skills for better matches.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-[#A89F91]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#23231f] flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#A89F91]" /> Jobs That Match Your Resume</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/open-roles')}>Browse All Jobs</Button>
      </div>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-[#A89F91] hover:shadow-sm transition-all cursor-pointer bg-white"
            onClick={() => navigate(`/job/${job.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-[#23231f] mb-1">{job.job_title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6b665f] mb-2">
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{job.location}</span>
                  <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1" />{job.salary_range}</span>
                  <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1" />{job.job_category}</span>
                  <span className="text-xs text-[#A89F91]">{formatDate(job.created_at)}</span>
                </div>
                <p className="text-sm text-[#6b665f] line-clamp-2">{job.job_description}</p>
              </div>
              <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-0 whitespace-nowrap">{job.match_score} matches</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
