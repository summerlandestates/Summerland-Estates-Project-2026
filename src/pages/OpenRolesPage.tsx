import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import FAQSection from '@/components/FAQSection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Building2,
  Users,
  Loader2
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

export default function OpenRolesPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active job postings (status = 'active' matches RLS policy)
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Jobs fetch error:', jobsError);
      }
      setJobs(jobsData || []);

      // Fetch open service requests (status = 'open' matches RLS policy)
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('Services fetch error:', servicesError);
      }
      setServiceRequests(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Open Roles - Summerland Estates"
        description="Browse open estate professional positions. Find private chef, housekeeper, estate manager, and other luxury household roles."
        canonical="/open-roles"
      />
      <NavBar currentPage="open-roles" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">
              Open Roles & Requests
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Browse available positions and service opportunities within the estate community
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-base bg-white border-gray-200 rounded-xl shadow-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="jobs" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Job Postings ({filteredJobs.length})
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Service Requests ({filteredServices.length})
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
                    <Card className="p-12 text-center bg-white border border-gray-100 rounded-2xl">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No Job Postings Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to post a job opportunity for the estate community.
                      </p>
                      <Button 
                        onClick={() => navigate('/post-job')}
                        className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                      >
                        Post a Job
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-6">
                      {filteredJobs.map((job) => (
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
                                  <h3 className="text-xl font-semibold text-foreground mb-1">
                                    {job.job_title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                    <span className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {job.location}
                                    </span>
                                    <span className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-1" />
                                      {job.salary_range}
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Posted {formatDate(job.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {job.job_description}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-0">
                                      {job.job_category}
                                    </Badge>
                                    {job.employment_types?.map((type, idx) => (
                                      <Badge key={idx} className={`${getEmploymentTypeBadge(type)} border-0`}>
                                        {type.replace('-', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button 
                              className="bg-[#A89F91] hover:bg-[#8A8279] text-white md:self-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/job/${job.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Service Requests Tab */}
                <TabsContent value="services">
                  {filteredServices.length === 0 ? (
                    <Card className="p-12 text-center bg-white border border-gray-100 rounded-2xl">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No Service Requests Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to post a service request for the estate community.
                      </p>
                      <Button 
                        onClick={() => navigate('/post-job')}
                        className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                      >
                        Create Service Request
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-6">
                      {filteredServices.map((service) => (
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
                                  <h3 className="text-xl font-semibold text-foreground mb-1">
                                    {service.service_needed}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                    <span className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {service.location}
                                    </span>
                                    {service.date_needed && (
                                      <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Needed by {formatDate(service.date_needed)}
                                      </span>
                                    )}
                                    {(service.budget_min || service.budget_max) && (
                                      <span className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        Budget: ${service.budget_min || 0} - ${service.budget_max || 'Open'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {service.details}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button 
                              className="bg-[#A89F91] hover:bg-[#8A8279] text-white md:self-center"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                navigate(`/service-request/${service.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
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
                <Button 
                  onClick={() => navigate('/post-job')}
                  className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
                <Button 
                  onClick={() => navigate('/post-job')}
                  variant="outline"
                  className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10"
                >
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
