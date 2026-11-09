import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import FAQSection from '../components/FAQSection';
import MapLocationLink from '../components/MapLocationLink';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Clock, DollarSign, Calendar, Search, Building2, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

const PAGE_SIZE = 10;

// Extract the first dollar number found in a salary/budget string for sorting/filtering.
const parseMoney = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const match = String(value).replace(/,/g, '').match(/\$?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return match[2] ? n * 1000 : n;
};

const SkeletonCard = () => (
  <Card className="p-6 bg-white border border-gray-100 rounded-2xl animate-pulse">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  </Card>
);

export default function OpenRolesPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  // Search (debounced, min 3 chars)
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Job filters
  const [jobLocation, setJobLocation] = useState('');
  const [jobCategory, setJobCategory] = useState('all');
  const [jobSalary, setJobSalary] = useState('all'); // 'all' | 'under50k' | '50k-100k' | '100k+'
  const [jobSort, setJobSort] = useState<'newest' | 'oldest'>('newest');
  const [jobPage, setJobPage] = useState(1);

  // Service filters
  const [svcLocation, setSvcLocation] = useState('');
  const [svcBudget, setSvcBudget] = useState('all'); // 'all' | 'under500' | '500-2000' | '2000+'
  const [svcSort, setSvcSort] = useState<'newest' | 'oldest'>('newest');
  const [svcPage, setSvcPage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  // Debounce search: only applies once 3+ chars typed (or cleared).
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const term = searchTerm.trim();
    if (term.length > 0 && term.length < 3) {
      // Not enough characters yet — keep previous results, no search.
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(() => {
      setAppliedSearch(term);
      setSearching(false);
      setJobPage(1);
      setSvcPage(1);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: jobsData, error: jobsError }, { data: servicesData, error: servicesError }] =
        await Promise.all([
          supabase.from('job_postings').select('*').eq('status', 'active').order('created_at', { ascending: false }),
          supabase.from('service_requests').select('*').eq('status', 'open').order('created_at', { ascending: false }),
        ]);
      if (jobsError) console.error('Jobs fetch error:', jobsError);
      if (servicesError) console.error('Services fetch error:', servicesError);
      setJobs(jobsData || []);
      setServiceRequests(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const jobCategories = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.job_category).filter(Boolean))).sort(),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    const loc = jobLocation.trim().toLowerCase();
    let list = jobs.filter((job) => {
      if (term && ![job.job_title, job.location, job.job_category, job.job_description]
        .some((f) => (f || '').toLowerCase().includes(term))) return false;
      if (loc && !(job.location || '').toLowerCase().includes(loc)) return false;
      if (jobCategory !== 'all' && job.job_category !== jobCategory) return false;
      if (jobSalary !== 'all') {
        const amount = parseMoney(job.salary_range);
        if (jobSalary === 'under50k' && (amount === null || amount >= 50000)) return false;
        if (jobSalary === '50k-100k' && (amount === null || amount < 50000 || amount > 100000)) return false;
        if (jobSalary === '100k+' && (amount === null || amount < 100000)) return false;
      }
      return true;
    });
    list.sort((a, b) =>
      jobSort === 'newest'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return list;
  }, [jobs, appliedSearch, jobLocation, jobCategory, jobSalary, jobSort]);

  const filteredServices = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    const loc = svcLocation.trim().toLowerCase();
    let list = serviceRequests.filter((svc) => {
      if (term && ![svc.service_needed, svc.location, svc.details]
        .some((f) => (f || '').toLowerCase().includes(term))) return false;
      if (loc && !(svc.location || '').toLowerCase().includes(loc)) return false;
      if (svcBudget !== 'all') {
        const max = svc.budget_max ?? svc.budget_min ?? null;
        if (svcBudget === 'under500' && (max === null || max >= 500)) return false;
        if (svcBudget === '500-2000' && (max === null || max < 500 || max > 2000)) return false;
        if (svcBudget === '2000+' && (max === null || max < 2000)) return false;
      }
      return true;
    });
    list.sort((a, b) =>
      svcSort === 'newest'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return list;
  }, [serviceRequests, appliedSearch, svcLocation, svcBudget, svcSort]);

  const pagedJobs = filteredJobs.slice((jobPage - 1) * PAGE_SIZE, jobPage * PAGE_SIZE);
  const jobPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const pagedServices = filteredServices.slice((svcPage - 1) * PAGE_SIZE, svcPage * PAGE_SIZE);
  const svcPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getEmploymentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-green-100 text-green-700',
      'part-time': 'bg-blue-100 text-blue-700',
      'contract': 'bg-purple-100 text-purple-700',
      'temporary': 'bg-orange-100 text-orange-700',
      'live-in': 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const hasJobFilters = jobLocation || jobCategory !== 'all' || jobSalary !== 'all';
  const hasSvcFilters = svcLocation || svcBudget !== 'all';

  const Pagination = ({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) => {
    if (pages <= 1) return null;
    const window = 5;
    const start = Math.max(1, Math.min(page - 2, pages - window + 1));
    const nums = Array.from({ length: Math.min(window, pages) }, (_, i) => start + i);
    return (
      <div className="mt-8 flex items-center justify-center gap-1.5">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)} className="border-gray-200">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {nums.map((n) => (
          <Button
            key={n}
            variant={n === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(n)}
            className={n === page ? 'bg-[#A89F91] text-white hover:bg-[#8A8279]' : 'border-gray-200'}
          >
            {n}
          </Button>
        ))}
        <Button variant="outline" size="sm" disabled={page === pages} onClick={() => onChange(page + 1)} className="border-gray-200">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const renderSkeletons = (count = 4) => (
    <div className="grid gap-6">{Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}</div>
  );

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Jobs - Summerland Estates"
        description="Browse open estate professional positions. Find private chef, housekeeper, estate manager, and other luxury household roles."
        canonical="/open-roles"
      />
      <NavBar currentPage="jobs" />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">
              Jobs & Service Requests
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Browse available positions and service opportunities within the estate community
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or keyword (min 3 characters)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-10 py-6 text-base bg-white border-gray-200 rounded-xl shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs ({filteredJobs.length})
              </TabsTrigger>
              <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 mr-2" />
                Service Requests ({filteredServices.length})
              </TabsTrigger>
            </TabsList>

            {/* Job filters */}
            <TabsContent value="jobs" className="mt-0">
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Filter by location..."
                  value={jobLocation}
                  onChange={(e) => { setJobLocation(e.target.value); setJobPage(1); }}
                  className="bg-white border-gray-200"
                />
                <Select value={jobCategory} onValueChange={(v) => { setJobCategory(v); setJobPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All categories</SelectItem>
                    {jobCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={jobSalary} onValueChange={(v) => { setJobSalary(v); setJobPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder="Any salary" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Any salary</SelectItem>
                    <SelectItem value="under50k">Under $50k</SelectItem>
                    <SelectItem value="50k-100k">$50k – $100k</SelectItem>
                    <SelectItem value="100k+">$100k+</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={jobSort} onValueChange={(v) => { setJobSort(v as 'newest' | 'oldest'); setJobPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasJobFilters && (
                <button onClick={() => { setJobLocation(''); setJobCategory('all'); setJobSalary('all'); }} className="mb-4 text-sm text-[#A89F91] hover:underline">
                  Clear filters
                </button>
              )}

              {loading || searching ? (
                renderSkeletons()
              ) : filteredJobs.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-gray-100 rounded-2xl">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-6">Try a different search or clear the filters.</p>
                  <Button onClick={() => navigate('/post-job')} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">Post a Job</Button>
                </Card>
              ) : (
                <>
                  <div className="grid gap-6">
                    {pagedJobs.map((job) => (
                      <Card
                        key={job.id}
                        className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/job/${job.id}`)}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-6 h-6 text-[#A89F91]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-semibold text-foreground mb-1">{job.job_title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                  <MapLocationLink location={job.location} iconClassName="w-4 h-4 mr-1" />
                                  <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />{job.salary_range}</span>
                                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />Posted {formatDate(job.created_at)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.job_description}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-0">{job.job_category}</Badge>
                                  {job.employment_types?.map((type, idx) => (
                                    <Badge key={idx} className={`${getEmploymentTypeBadge(type)} border-0`}>{type.replace('-', ' ')}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            className="bg-[#A89F91] hover:bg-[#8A8279] text-white md:self-center"
                            onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
                          >
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Pagination page={jobPage} pages={jobPages} onChange={setJobPage} />
                </>
              )}
            </TabsContent>

            {/* Service Requests Tab */}
            <TabsContent value="services" className="mt-0">
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input
                  placeholder="Filter by location..."
                  value={svcLocation}
                  onChange={(e) => { setSvcLocation(e.target.value); setSvcPage(1); }}
                  className="bg-white border-gray-200"
                />
                <Select value={svcBudget} onValueChange={(v) => { setSvcBudget(v); setSvcPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder="Any budget" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Any budget</SelectItem>
                    <SelectItem value="under500">Under $500</SelectItem>
                    <SelectItem value="500-2000">$500 – $2,000</SelectItem>
                    <SelectItem value="2000+">$2,000+</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={svcSort} onValueChange={(v) => { setSvcSort(v as 'newest' | 'oldest'); setSvcPage(1); }}>
                  <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasSvcFilters && (
                <button onClick={() => { setSvcLocation(''); setSvcBudget('all'); }} className="mb-4 text-sm text-[#A89F91] hover:underline">
                  Clear filters
                </button>
              )}

              {loading || searching ? (
                renderSkeletons()
              ) : filteredServices.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-gray-100 rounded-2xl">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No service requests found</h3>
                  <p className="text-muted-foreground mb-6">Try a different search or clear the filters.</p>
                  <Button onClick={() => navigate('/service-requests')} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
                    Create Service Request
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="grid gap-6">
                    {pagedServices.map((service) => (
                      <Card
                        key={service.id}
                        className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/service-request/${service.id}`)}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-6 h-6 text-[#A89F91]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-semibold text-foreground mb-1">{service.service_needed}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                  <MapLocationLink location={service.location} iconClassName="w-4 h-4 mr-1" />
                                  {service.date_needed && (
                                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />Needed by {formatDate(service.date_needed)}</span>
                                  )}
                                  {(service.budget_min || service.budget_max) && (
                                    <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />Budget: ${service.budget_min || 0} - ${service.budget_max || 'Open'}</span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{service.details}</p>
                              </div>
                            </div>
                          </div>
                          <Button
                            className="bg-[#A89F91] hover:bg-[#8A8279] text-white md:self-center"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/service-request/${service.id}`); }}
                          >
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Pagination page={svcPage} pages={svcPages} onChange={setSvcPage} />
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="p-8 bg-gradient-to-r from-[#A89F91]/10 to-[#A89F91]/5 border-0 rounded-2xl">
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
                Looking to Hire or Need a Service?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Post your job opening or service request to connect with qualified estate professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/post-job')} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
                <Button onClick={() => navigate('/service-requests')} variant="outline" className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10">
                  <Users className="w-4 h-4 mr-2" />
                  Create Service Request
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          category="Jobs & Services"
          title="Jobs & Services FAQs"
          subtitle="Common questions about posting jobs and service requests"
          maxItems={5}
          className="bg-muted/30"
        />
      </main>

      <Footer />
    </div>
  );
}
