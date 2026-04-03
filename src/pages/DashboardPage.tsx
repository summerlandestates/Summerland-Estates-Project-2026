import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatTierLabel, getAccountStatus, requiresMembershipPayment } from '@/lib/membership';
import { getPlanById } from '@/data/pricing';
import { getAddOnsByUserType } from '@/data/addons';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase, 
  FileText, 
  Bell, 
  Bookmark, 
  Users, 
  Newspaper, 
  Download, 
  Settings, 
  PenSquare,
  MessageCircle,
  Eye,
  TrendingUp,
  Star,
  Shield,
  BadgeCheck,
  Sparkles
} from 'lucide-react';

type DashboardUserType = 'professional' | 'business' | 'agency' | 'estates';

interface DashboardStats {
  jobsApplied: number;
  serviceRequestsApplied: number;
  savedProfiles: number;
  savedJobs: number;
  savedArticles: number;
  templatesDownloaded: number;
  profileViews: number;
  postedJobs: number;
  postedServiceRequests: number;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  activityDate: string;
  sortDate: string;
  status: string;
}

interface SavedItem {
  id: string;
  title: string;
  type: string;
  savedDate: string;
}

interface QuickAction {
  label: string;
  route: string;
  icon: typeof Briefcase;
}

const readStoredCollection = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapStoredItems = (items: unknown[], defaultType: string): SavedItem[] =>
  items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `${defaultType}-${index}`,
        title: item,
        type: defaultType,
        savedDate: 'Recently',
      };
    }

    if (item && typeof item === 'object') {
      const entry = item as Record<string, unknown>;
      return {
        id: String(entry.id || `${defaultType}-${index}`),
        title: String(entry.title || entry.name || 'Saved item'),
        type: String(entry.type || entry.category || defaultType),
        savedDate: String(entry.savedDate || entry.downloadedDate || entry.createdAt || 'Recently'),
      };
    }

    return {
      id: `${defaultType}-${index}`,
      title: 'Saved item',
      type: defaultType,
      savedDate: 'Recently',
    };
  });

const normalizeProfileType = (profileType: string): DashboardUserType => {
  if (profileType === 'service-provider' || profileType === 'business') return 'business';
  if (profileType === 'agency' || profileType === 'agency-owner') return 'agency';
  if (profileType === 'estate' || profileType === 'estates') return 'estates';
  return 'professional';
};

const formatStatusLabel = (status: string) =>
  status
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getQuickActions = (userType: DashboardUserType): QuickAction[] => {
  switch (userType) {
    case 'business':
      return [
        { label: 'Open Service Leads', route: '/service-requests', icon: FileText },
        { label: 'Post a Job', route: '/post-job', icon: Briefcase },
        { label: 'Community', route: '/collective', icon: Bell },
        { label: 'Saved Profiles', route: '/saved-profiles', icon: Bookmark },
        { label: 'Edit Business', route: '/my-profile', icon: Users },
        { label: 'Templates', route: '/tools', icon: Download },
      ];
    case 'agency':
      return [
        { label: 'Find Talent', route: '/search', icon: Users },
        { label: 'Post a Role', route: '/post-job', icon: Briefcase },
        { label: 'Service Request', route: '/service-requests', icon: FileText },
        { label: 'Community', route: '/collective', icon: Bell },
        { label: 'Saved Profiles', route: '/saved-profiles', icon: Bookmark },
        { label: 'Account', route: '/account', icon: Settings },
      ];
    case 'estates':
      return [
        { label: 'Find Talent', route: '/search', icon: Users },
        { label: 'Post a Role', route: '/post-job', icon: Briefcase },
        { label: 'Service Request', route: '/service-requests', icon: FileText },
        { label: 'Community', route: '/collective', icon: Bell },
        { label: 'Saved Profiles', route: '/saved-profiles', icon: Bookmark },
        { label: 'Templates', route: '/tools', icon: Download },
      ];
    default:
      return [
        { label: 'Browse Jobs', route: '/open-roles', icon: Briefcase },
        { label: 'Service Requests', route: '/service-requests', icon: FileText },
        { label: 'Community', route: '/collective', icon: Bell },
        { label: 'Saved Profiles', route: '/saved-profiles', icon: Bookmark },
        { label: 'Edit Profile', route: '/my-profile', icon: Users },
        { label: 'Templates', route: '/tools', icon: Download },
      ];
  }
};

const getRoleCopy = (userType: DashboardUserType) => {
  switch (userType) {
    case 'business':
      return {
        heading: 'Business Dashboard',
        description: 'Track bids, visibility, and business activity across the network.',
        activityTitle: 'Recent Business Activity',
        activityDescription: 'Your latest bids, requests, and profile activity.',
        contentDescription: 'Publish updates, articles, and community conversations for your business.',
        featuresDescription: 'Choose add-ons that expand visibility, trust, and lead flow for your business.',
      };
    case 'agency':
      return {
        heading: 'Agency Dashboard',
        description: 'Manage roles, service requests, and outreach from one place.',
        activityTitle: 'Recent Hiring Activity',
        activityDescription: 'Review your latest postings and service activity.',
        contentDescription: 'Publish agency insight and keep your local community updated.',
        featuresDescription: 'Agency add-ons to support visibility, hiring reach, and branded trust.',
      };
    case 'estates':
      return {
        heading: 'Estate Dashboard',
        description: 'Manage hiring activity, service requests, and private network access.',
        activityTitle: 'Recent Estate Activity',
        activityDescription: 'Your latest role postings and service request activity.',
        contentDescription: 'Share estate insight and participate in community conversations.',
        featuresDescription: 'Enhance estate visibility and access with the right add-ons.',
      };
    default:
      return {
        heading: 'Professional Dashboard',
        description: 'Track your applications, visibility, and community activity.',
        activityTitle: 'Recent Applications',
        activityDescription: 'Your latest job and service request applications.',
        contentDescription: 'Share expertise, publish articles, and build your community presence.',
        featuresDescription: 'Choose profile upgrades that improve trust, visibility, and reach.',
      };
  }
};

const getAddOnIcon = (addOnId: string) => {
  if (addOnId.includes('background') || addOnId.includes('license')) return Shield;
  if (addOnId.includes('verification')) return BadgeCheck;
  if (addOnId.includes('analytics')) return TrendingUp;
  if (addOnId.includes('priority')) return Star;
  if (addOnId.includes('featured') || addOnId.includes('newsletter') || addOnId.includes('instagram')) return Sparkles;
  if (addOnId.includes('community')) return MessageCircle;
  return FileText;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userTier, setUserTier] = useState<string>('professional-basic');
  const [profileType, setProfileType] = useState<string>('professional');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    jobsApplied: 0,
    serviceRequestsApplied: 0,
    savedProfiles: 0,
    savedJobs: 0,
    savedArticles: 0,
    templatesDownloaded: 0,
    profileViews: 0,
    postedJobs: 0,
    postedServiceRequests: 0,
  });
  const [appliedJobs, setAppliedJobs] = useState<ActivityItem[]>([]);
  const [serviceApplications, setServiceApplications] = useState<ActivityItem[]>([]);
  const [postedJobs, setPostedJobs] = useState<ActivityItem[]>([]);
  const [postedServiceRequests, setPostedServiceRequests] = useState<ActivityItem[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedItem[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedItem[]>([]);
  const [downloadedTemplates, setDownloadedTemplates] = useState<SavedItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setDashboardLoading(true);

    const [
      profileResult,
      jobApplicationsResult,
      serviceBidsResult,
      savedProfilesResult,
      jobPostingsResult,
      serviceRequestsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('tier, profile_type, role, status, application_data')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('job_applications')
        .select('id, status, created_at, job_postings(job_title, contact_name)')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('service_bids')
        .select('id, status, created_at, service_requests(service_needed, location)')
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('saved_profiles')
        .select('id, created_at, listings(name, role)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('job_postings')
        .select('id, status, created_at, job_title, location')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('service_requests')
        .select('id, status, created_at, service_needed, location')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    const profile = profileResult.data as any;

    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    const accountStatus = getAccountStatus(profile, user);
    if (accountStatus === 'pending') {
      navigate('/registration-pending');
      return;
    }

    if (accountStatus === 'rejected') {
      navigate('/login');
      return;
    }

    if (requiresMembershipPayment(profile, user)) {
      navigate('/checkout');
      return;
    }

    const jobApplications = jobApplicationsResult.data || [];
    const serviceBids = serviceBidsResult.data || [];
    const savedProfileRows = savedProfilesResult.data || [];
    const ownJobPosts = jobPostingsResult.data || [];
    const ownServiceRequests = serviceRequestsResult.data || [];

    const storedSavedJobs = mapStoredItems(readStoredCollection('savedJobs'), 'Job');
    const storedSavedArticles = mapStoredItems(readStoredCollection('savedArticles'), 'Article');
    const storedTemplates = mapStoredItems(readStoredCollection('downloadedTemplates'), 'Template');

    const resolvedTier = profile?.tier || localStorage.getItem('userTier') || 'professional-basic';
    const resolvedProfileType =
      profile?.profile_type ||
      (typeof profile?.application_data?.profile_type === 'string' ? profile.application_data.profile_type : null) ||
      localStorage.getItem('profileType') ||
      'professional';

    setUserTier(resolvedTier);
    setProfileType(resolvedProfileType);

    setStats({
      jobsApplied: jobApplications.length,
      serviceRequestsApplied: serviceBids.length,
      savedProfiles: savedProfileRows.length,
      savedJobs: storedSavedJobs.length,
      savedArticles: storedSavedArticles.length,
      templatesDownloaded: storedTemplates.length,
      profileViews: ownJobPosts.length + ownServiceRequests.length,
      postedJobs: ownJobPosts.length,
      postedServiceRequests: ownServiceRequests.length,
    });

    setAppliedJobs(
      jobApplications.map((application: any) => ({
        id: application.id,
        title: application.job_postings?.job_title || 'Job application',
        subtitle: application.job_postings?.contact_name || 'Summerland Estates',
        activityDate: new Date(application.created_at).toLocaleDateString(),
        sortDate: application.created_at,
        status: application.status || 'pending',
      }))
    );

    setServiceApplications(
      serviceBids.map((bid: any) => ({
        id: bid.id,
        title: bid.service_requests?.service_needed || 'Service request',
        subtitle: bid.service_requests?.location || 'Location pending',
        activityDate: new Date(bid.created_at).toLocaleDateString(),
        sortDate: bid.created_at,
        status: bid.status || 'pending',
      }))
    );

    setPostedJobs(
      ownJobPosts.map((posting: any) => ({
        id: posting.id,
        title: posting.job_title || 'Job posting',
        subtitle: posting.location || 'Location pending',
        activityDate: new Date(posting.created_at).toLocaleDateString(),
        sortDate: posting.created_at,
        status: posting.status || 'active',
      }))
    );

    setPostedServiceRequests(
      ownServiceRequests.map((request: any) => ({
        id: request.id,
        title: request.service_needed || 'Service request',
        subtitle: request.location || 'Location pending',
        activityDate: new Date(request.created_at).toLocaleDateString(),
        sortDate: request.created_at,
        status: request.status || 'open',
      }))
    );

    setSavedProfiles(
      savedProfileRows.map((item: any) => ({
        id: item.id,
        title: item.listings?.name || 'Saved profile',
        type: item.listings?.role || 'Profile',
        savedDate: new Date(item.created_at).toLocaleDateString(),
      }))
    );

    setSavedJobs(storedSavedJobs);
    setSavedArticles(storedSavedArticles);
    setDownloadedTemplates(storedTemplates);

    setDashboardLoading(false);
  };

  const normalizedUserType = normalizeProfileType(profileType);
  const roleCopy = getRoleCopy(normalizedUserType);
  const currentPlan = getPlanById(userTier as never);
  const quickActions = getQuickActions(normalizedUserType);
  const availableAddOns = getAddOnsByUserType(normalizedUserType);
  const planFeatures = currentPlan?.features || [];

  const primaryStats = useMemo(() => {
    if (normalizedUserType === 'professional') {
      return [
        { label: 'Jobs Applied', value: stats.jobsApplied, icon: Briefcase, tint: 'bg-blue-100 text-blue-600' },
        { label: 'Service Bids', value: stats.serviceRequestsApplied, icon: FileText, tint: 'bg-purple-100 text-purple-600' },
        { label: 'Profile Views', value: stats.profileViews, icon: Eye, tint: 'bg-green-100 text-green-600' },
        { label: 'Saved Profiles', value: stats.savedProfiles, icon: Bookmark, tint: 'bg-amber-100 text-amber-600' },
      ];
    }

    if (normalizedUserType === 'business') {
      return [
        { label: 'Jobs Posted', value: stats.postedJobs, icon: Briefcase, tint: 'bg-blue-100 text-blue-600' },
        { label: 'Bids Submitted', value: stats.serviceRequestsApplied, icon: FileText, tint: 'bg-purple-100 text-purple-600' },
        { label: 'Saved Profiles', value: stats.savedProfiles, icon: Bookmark, tint: 'bg-amber-100 text-amber-600' },
        { label: 'Plan Features', value: planFeatures.length, icon: Sparkles, tint: 'bg-emerald-100 text-emerald-600' },
      ];
    }

    return [
      { label: 'Roles Posted', value: stats.postedJobs, icon: Briefcase, tint: 'bg-blue-100 text-blue-600' },
      { label: 'Service Requests', value: stats.postedServiceRequests, icon: FileText, tint: 'bg-purple-100 text-purple-600' },
      { label: 'Saved Profiles', value: stats.savedProfiles, icon: Bookmark, tint: 'bg-amber-100 text-amber-600' },
      { label: 'Plan Features', value: planFeatures.length, icon: Sparkles, tint: 'bg-emerald-100 text-emerald-600' },
    ];
  }, [normalizedUserType, planFeatures.length, stats]);

  const overviewActivity = useMemo(() => {
    const items =
      normalizedUserType === 'professional'
        ? [...appliedJobs, ...serviceApplications]
        : normalizedUserType === 'business'
          ? [...postedJobs, ...serviceApplications]
          : [...postedJobs, ...postedServiceRequests];

    return items
      .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
      .slice(0, 4);
  }, [appliedJobs, postedJobs, postedServiceRequests, serviceApplications, normalizedUserType]);

  const primaryApplicationsColumn = normalizedUserType === 'professional'
    ? {
        title: 'Jobs Applied To',
        icon: Briefcase,
        items: appliedJobs,
        empty: 'No job applications yet.',
      }
    : {
        title: 'Job Postings',
        icon: Briefcase,
        items: postedJobs,
        empty: 'No job postings yet.',
      };

  const secondaryApplicationsColumn =
    normalizedUserType === 'agency' || normalizedUserType === 'estates'
      ? {
          title: 'Service Requests',
          icon: FileText,
          items: postedServiceRequests,
          empty: 'No service requests yet.',
        }
      : {
          title: normalizedUserType === 'business' ? 'Service Bids Submitted' : 'Service Requests Applied To',
          icon: FileText,
          items: serviceApplications,
          empty: normalizedUserType === 'business' ? 'No bids submitted yet.' : 'No service applications yet.',
        };

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  if (!user) return null;

  const isPaidMember = currentPlan ? currentPlan.price !== '$0' : !userTier.includes('free');

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="dashboard" />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                  {roleCopy.heading}
                </h1>
                <p className="text-muted-foreground">
                  {roleCopy.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`px-3 py-1 ${isPaidMember ? 'bg-[#A89F91] text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {currentPlan?.name || formatTierLabel(userTier)}
                </Badge>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/settings')}
                  className="border-[#A89F91] text-[#A89F91]"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {primaryStats.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.tint}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-[20px] border border-[#E7DED2] bg-[#FCFAF7] p-2">
              <TabsTrigger value="overview" className="rounded-2xl px-4 py-2.5 transition-all data-[state=active]:bg-[#A89F91] data-[state=active]:text-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-2xl px-4 py-2.5 transition-all data-[state=active]:bg-[#A89F91] data-[state=active]:text-white data-[state=active]:shadow-sm">Applications</TabsTrigger>
              <TabsTrigger value="saved" className="rounded-2xl px-4 py-2.5 transition-all data-[state=active]:bg-[#A89F91] data-[state=active]:text-white data-[state=active]:shadow-sm">Saved Items</TabsTrigger>
              <TabsTrigger value="content" className="rounded-2xl px-4 py-2.5 transition-all data-[state=active]:bg-[#A89F91] data-[state=active]:text-white data-[state=active]:shadow-sm">My Content</TabsTrigger>
              <TabsTrigger value="features" className="rounded-2xl px-4 py-2.5 transition-all data-[state=active]:bg-[#A89F91] data-[state=active]:text-white data-[state=active]:shadow-sm">Additional Features</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 rounded-[28px] border border-border/40 bg-white/70 p-1 animate-in fade-in-0 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts for your current membership.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.label}
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 cursor-pointer"
                            onClick={() => navigate(action.route)}
                          >
                            <Icon className="w-5 h-5 text-[#A89F91]" />
                            <span className="text-sm">{action.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <p className="text-sm text-blue-800">
                          {normalizedUserType === 'professional'
                            ? stats.jobsApplied > 0
                              ? `You have ${stats.jobsApplied} active job application${stats.jobsApplied > 1 ? 's' : ''}.`
                              : 'No job applications yet. Start browsing roles to build your activity.'
                            : normalizedUserType === 'business'
                              ? stats.postedJobs > 0
                                ? `You have ${stats.postedJobs} active job posting${stats.postedJobs > 1 ? 's' : ''}.`
                                : 'No job postings yet. Post a role when you need extra support.'
                              : stats.postedJobs > 0
                                ? `You have ${stats.postedJobs} live role posting${stats.postedJobs > 1 ? 's' : ''}.`
                                : 'No roles posted yet. Create a posting to start hiring.'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                        <p className="text-sm text-amber-800">
                          {normalizedUserType === 'professional'
                            ? stats.serviceRequestsApplied > 0
                              ? `You have ${stats.serviceRequestsApplied} active service bid${stats.serviceRequestsApplied > 1 ? 's' : ''}.`
                              : 'No service request applications yet.'
                            : normalizedUserType === 'business'
                              ? stats.serviceRequestsApplied > 0
                                ? `You have ${stats.serviceRequestsApplied} submitted bid${stats.serviceRequestsApplied > 1 ? 's' : ''}.`
                                : 'No submitted bids yet. Browse open service leads to respond quickly.'
                              : stats.postedServiceRequests > 0
                                ? `You have ${stats.postedServiceRequests} service request${stats.postedServiceRequests > 1 ? 's' : ''} in motion.`
                                : 'No service requests posted yet.'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-sm text-gray-800">
                          {stats.savedProfiles > 0
                            ? `You have ${stats.savedProfiles} saved profile${stats.savedProfiles > 1 ? 's' : ''} ready for follow-up.`
                            : 'You have not saved any profiles yet.'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="link" 
                      className="w-full mt-4 text-[#A89F91]"
                      onClick={() => navigate('/notification-settings')}
                    >
                      Manage Notifications
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>{roleCopy.activityTitle}</CardTitle>
                  <CardDescription>{roleCopy.activityDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overviewActivity.length > 0 ? (
                      overviewActivity.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-2xl border p-4">
                          <div>
                            <h4 className="font-medium text-foreground">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{item.activityDate}</span>
                            <Badge className={item.status === 'rejected' ? 'bg-red-100 text-red-700' : item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                              {formatStatusLabel(item.status)}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                        {normalizedUserType === 'professional'
                          ? 'No applications yet. Browse jobs and service requests to start tracking activity here.'
                          : 'No recent activity yet. Use the quick actions above to start building momentum.'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6 rounded-[28px] border border-border/40 bg-white/70 p-1 animate-in fade-in-0 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <primaryApplicationsColumn.icon className="w-5 h-5" />
                      {primaryApplicationsColumn.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {primaryApplicationsColumn.items.length > 0 ? (
                        primaryApplicationsColumn.items.map((item) => (
                          <div key={item.id} className="rounded-2xl border p-3 transition-colors hover:bg-muted/50">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                              </div>
                              <Badge className="bg-gray-100 text-gray-700" variant="outline">
                                {formatStatusLabel(item.status)}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          {primaryApplicationsColumn.empty}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <secondaryApplicationsColumn.icon className="w-5 h-5" />
                      {secondaryApplicationsColumn.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {secondaryApplicationsColumn.items.length > 0 ? (
                        secondaryApplicationsColumn.items.map((item) => (
                          <div key={item.id} className="rounded-2xl border p-3 transition-colors hover:bg-muted/50">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                              </div>
                              <Badge className="bg-gray-100 text-gray-700">
                                {formatStatusLabel(item.status)}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          {secondaryApplicationsColumn.empty}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Saved Items Tab */}
            <TabsContent value="saved" className="space-y-6 rounded-[28px] border border-border/40 bg-white/70 p-1 animate-in fade-in-0 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Saved Profiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {savedProfiles.length > 0 ? savedProfiles.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.type} • Saved {item.savedDate}</p>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          No saved profiles yet.
                        </div>
                      )}
                    </div>
                    <Button variant="link" className="w-full mt-4 text-[#A89F91]" onClick={() => navigate('/saved-profiles')}>
                      View All Saved Profiles
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5" />
                      Saved Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {savedJobs.length > 0 ? savedJobs.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.type} • Saved {item.savedDate}</p>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          No saved jobs yet.
                        </div>
                      )}
                    </div>
                    <Button variant="link" className="w-full mt-4 text-[#A89F91]" onClick={() => navigate('/open-roles')}>
                      Browse Open Roles
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5" />
                      Saved Articles & News
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {savedArticles.length > 0 ? savedArticles.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.type} • Saved {item.savedDate}</p>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          No saved articles yet.
                        </div>
                      )}
                    </div>
                    <Button variant="link" className="w-full mt-4 text-[#A89F91]" onClick={() => navigate('/news')}>
                      Browse More Articles
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Downloaded Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Downloaded Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {downloadedTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {downloadedTemplates.map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg">
                          <h4 className="font-medium text-sm">{template.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">Downloaded {template.savedDate}</p>
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            View Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                      No downloaded templates yet. Browse the resource library to build your toolkit.
                    </div>
                  )}
                  <Button variant="link" className="w-full mt-4 text-[#A89F91]" onClick={() => navigate('/tools')}>
                    Browse More Templates
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Content Tab */}
            <TabsContent value="content" className="space-y-6 rounded-[28px] border border-border/40 bg-white/70 p-1 animate-in fade-in-0 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenSquare className="w-5 h-5" />
                      Add Article
                    </CardTitle>
                    <CardDescription>
                      {isPaidMember ? roleCopy.contentDescription : 'Upgrade to a paid plan to publish articles and insights.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPaidMember ? (
                      <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] cursor-pointer">
                        <PenSquare className="w-4 h-4 mr-2" />
                        Write New Article
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full cursor-pointer" onClick={() => navigate('/pricing')}>
                        Upgrade to Publish Articles
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Add Forum Discussion
                    </CardTitle>
                    <CardDescription>
                      {isPaidMember ? 'Start a discussion inside your matched community forum.' : 'Upgrade to a paid plan to start community discussions.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPaidMember ? (
                      <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] cursor-pointer" onClick={() => navigate('/collective')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start New Discussion
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full cursor-pointer" onClick={() => navigate('/pricing')}>
                        Upgrade for Forum Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Plan Snapshot</CardTitle>
                  <CardDescription>
                    {currentPlan ? `${currentPlan.name} ${currentPlan.period || ''}`.trim() : 'Your membership benefits at a glance.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {planFeatures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {planFeatures.slice(0, 8).map((feature) => (
                        <div key={feature} className="rounded-2xl border bg-[#FCFAF7] px-4 py-3 text-sm text-foreground">
                          {feature}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Plan details are not available yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Features Tab */}
            <TabsContent value="features" className="space-y-6 rounded-[28px] border border-border/40 bg-white/70 p-1 animate-in fade-in-0 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Features</CardTitle>
                  <CardDescription>{roleCopy.featuresDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availableAddOns.map((addOn) => {
                      const Icon = getAddOnIcon(addOn.id);
                      const actionLabel =
                        addOn.priceType === 'monthly'
                          ? 'Request Subscription'
                          : addOn.priceType === 'per-item'
                            ? 'Request Feature'
                            : 'Request Purchase';

                      return (
                        <div key={addOn.id} className="rounded-2xl border p-4 transition-colors hover:border-[#A89F91]">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="rounded-xl bg-[#F3EDE6] p-2">
                              <Icon className="w-5 h-5 text-[#A89F91]" />
                            </div>
                            <div>
                              <h4 className="font-medium">{addOn.name}</h4>
                              <p className="text-sm text-[#A89F91] font-semibold">
                                {addOn.price}{addOn.priceType === 'monthly' ? '/mo' : ''}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{addOn.description}</p>
                          {addOn.badge && (
                            <Badge variant="secondary" className="mb-3 bg-[#A89F91]/10 text-[#A89F91]">
                              {addOn.badge}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full cursor-pointer"
                            onClick={() => navigate('/contact')}
                          >
                            {actionLabel}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[24px] border border-[#E7DED2] bg-[#FCFAF7] p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Need a custom activation path?</h3>
                        <p className="text-sm text-muted-foreground">
                          We can help with verification, campaign placement, or enterprise setup tailored to your membership.
                        </p>
                      </div>
                      <Button className="bg-[#A89F91] hover:bg-[#8A8279] cursor-pointer" onClick={() => navigate('/contact')}>
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}





