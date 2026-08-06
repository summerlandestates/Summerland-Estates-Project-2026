import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import ArticleManager from '@/components/ArticleManager';
import ProfileAnalytics from '@/components/ProfileAnalytics';
import MatchedJobs from '@/components/MatchedJobs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Activity, 
  User, 
  Edit3, 
  LogOut,
  Settings,
  Search,
  Bell,
  Bookmark,
  Briefcase,
  MessageSquare,
  Calendar,
  Handshake,
  Send,
  Award,
  Crown,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  Eye,
  Loader2,
  Plus,
  DollarSign,
  Mail,
  Star,
  Trash2,
  MoreVertical
} from 'lucide-react';

// Types
interface UserStats {
  totalApplications: number;
  activeApplications: number;
  savedProfiles: number;
  messages: number;
  appointments: number;
  totalArticles: number;
  publishedArticles: number;
}

interface MyEvent {
  id: string;
  event_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  event: {
    title: string;
    date: string;
    location: string;
    event_type: string;
    image_url: string | null;
  };
}

interface MySponsorship {
  id: string;
  company_name: string;
  sponsorship_type: string;
  status: 'pending' | 'contacted' | 'negotiating' | 'active' | 'closed';
  budget_range: string;
  created_at: string;
  admin_notes: string | null;
}

interface MyEmailBlast {
  id: string;
  subject: string;
  status: 'draft' | 'pending_review' | 'approved' | 'sent' | 'rejected';
  payment_status: 'pending' | 'paid' | 'failed';
  amount_paid: number;
  created_at: string;
  sent_at: string | null;
}

interface MyRecognition {
  id: string;
  nominee_name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface MyPlan {
  id: string;
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  amount_paid: number;
}

interface MySubmittedEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  image_url: string | null;
}

const defaultStats: UserStats = {
  totalApplications: 0,
  activeApplications: 0,
  savedProfiles: 0,
  messages: 0,
  appointments: 0,
  totalArticles: 0,
  publishedArticles: 0,
};

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'articles' | 'applications' | 'messages' | 'settings' | 'events' | 'sponsorships' | 'email-blasts' | 'recognition' | 'plans'>('overview');
  
  // Data states
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [mySubmittedEvents, setMySubmittedEvents] = useState<MySubmittedEvent[]>([]);
  const [mySponsorships, setMySponsorships] = useState<MySponsorship[]>([]);
  const [myEmailBlasts, setMyEmailBlasts] = useState<MyEmailBlast[]>([]);
  const [myRecognitions, setMyRecognitions] = useState<MyRecognition[]>([]);
  const [myPlans, setMyPlans] = useState<MyPlan[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [userTier, setUserTier] = useState<string>(localStorage.getItem('userTier') || 'professional-basic');
  
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    checkUserAccess();
  }, [authLoading, user]);

  const checkUserAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await Promise.all([
        loadUserStats(),
        loadMyEvents(),
        loadMySubmittedEvents(),
        loadMySponsorships(),
        loadMyEmailBlasts(),
        loadMyRecognitions(),
        loadMyPlans(),
        loadProfileData()
      ]);
    } catch (error) {
      console.error('User access check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Load article stats
      const storedArticles = localStorage.getItem('articles');
      let articleStats = { totalArticles: 0, publishedArticles: 0 };
      
      if (storedArticles) {
        const articles = JSON.parse(storedArticles);
        const userArticles = articles.filter((article: any) => article.authorId === user?.id);
        articleStats = {
          totalArticles: userArticles.length,
          publishedArticles: userArticles.filter((a: any) => a.status === 'published').length,
        };
      }

      setStats({
        ...defaultStats,
        ...articleStats,
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setProfileData(data);
      const tier = data?.tier || localStorage.getItem('userTier') || 'professional-basic';
      setUserTier(tier);
      localStorage.setItem('userTier', tier);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadMyEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(title, date, location, event_type, image_url)
        `)
        .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMyEvents(data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadMySubmittedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, event_type, date, time, location, status, created_at, image_url')
        .eq('submitted_by', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMySubmittedEvents(data || []);
    } catch (error) {
      console.error('Failed to load submitted events:', error);
    }
  };

  const loadMySponsorships = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*')
        .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMySponsorships(data || []);
    } catch (error) {
      console.error('Failed to load sponsorships:', error);
    }
  };

  const loadMyEmailBlasts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_blast_submissions')
        .select('*')
        .eq('sender_email', user?.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMyEmailBlasts(data || []);
    } catch (error) {
      console.error('Failed to load email blasts:', error);
    }
  };

  const loadMyRecognitions = async () => {
    try {
      const { data, error } = await supabase
        .from('recognitions')
        .select('*')
        .or(`submitter_id.eq.${user?.id},submitter_email.eq.${user?.email}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMyRecognitions(data || []);
    } catch (error) {
      console.error('Failed to load recognitions:', error);
    }
  };

  const loadMyPlans = async () => {
    try {
      // Fetch user profile to get membership tier info
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tier, subscription_status, created_at')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      // Transform profile data into plan format
      // Show plan if user has a tier (any tier besides null/undefined)
      if (profile?.tier) {
        const plan: MyPlan = {
          id: user?.id || '1',
          plan_name: profile.tier === 'estate' ? 'Estate Plan' : 
                     profile.tier === 'business' ? 'Business Plan' : 
                     profile.tier === 'premium' ? 'Premium Plan' : 
                     profile.tier === 'vendor' ? 'Vendor Plan' :
                     profile.tier === 'agency' ? 'Agency Plan' : 'Free Plan',
          status: (profile.subscription_status === 'active' || profile.subscription_status === 'trialing') ? 'active' : 
                  profile.subscription_status === 'cancelled' ? 'cancelled' :
                  profile.subscription_status === 'past_due' ? 'expired' : 'active',
          start_date: profile.created_at || new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          amount_paid: 0 // Could be fetched from payment records
        };
        setMyPlans([plan]);
      } else {
        setMyPlans([]);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      setMyPlans([]);
    }
  };

  // Delete handlers
  const handleDeleteSubmittedEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;
      toast.success('Event deleted successfully');
      loadMySubmittedEvents();
    } catch (error: any) {
      toast.error('Failed to delete event', { description: error.message });
    }
  };

  const handleDeleteSponsorship = async (id: string) => {
    try {
      const { error } = await supabase.from('sponsorships').delete().eq('id', id);
      if (error) throw error;
      toast.success('Sponsorship inquiry deleted');
      loadMySponsorships();
    } catch (error: any) {
      toast.error('Failed to delete', { description: error.message });
    }
  };

  const handleDeleteEmailBlast = async (id: string) => {
    try {
      const { error } = await supabase.from('email_blasts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Email blast deleted');
      loadMyEmailBlasts();
    } catch (error: any) {
      toast.error('Failed to delete', { description: error.message });
    }
  };

  const handleDeleteRecognition = async (id: string) => {
    try {
      const { error } = await supabase.from('recognitions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Recognition deleted');
      loadMyRecognitions();
    } catch (error: any) {
      toast.error('Failed to delete', { description: error.message });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'contacted': 'bg-blue-100 text-blue-800',
      'negotiating': 'bg-purple-100 text-purple-800',
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'sent': 'bg-green-100 text-green-800',
      'registered': 'bg-blue-100 text-blue-800',
      'attended': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'expired': 'bg-red-100 text-red-800',
      'paid': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f3ee]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    return profileData?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getProfileImage = () => {
    return profileData?.avatar_url || user?.user_metadata?.avatar_url || null;
  };

  return (
    <div className="flex min-h-screen bg-[#f7f3ee]">
      <SEOHead title="Dashboard - Summerland Estates" description="Your Summerland Estates member dashboard." canonical="/dashboard" noIndex={true} />
      
      {/* User Sidebar - Professional Design */}
      <div className="w-72 bg-white shadow-sm border-r border-[#e8dfd3] flex flex-col">
        {/* Profile Header */}
        <div className="p-6 border-b border-[#e8dfd3]">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-[#A89F91]">
              <AvatarImage src={getProfileImage()} alt={getUserDisplayName()} />
              <AvatarFallback className="bg-[#A89F91] text-white text-lg font-semibold">
                {getInitials(getUserDisplayName())}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[#23231f] truncate">{getUserDisplayName()}</h2>
              <p className="text-sm text-[#6b665f] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            <p className="px-3 text-xs font-semibold text-[#6b665f] uppercase tracking-wider mb-2">Main</p>
            
            <Button
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'overview' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('overview')}
            >
              <Activity className="w-4 h-4 mr-3" />
              Overview
            </Button>
            
            <Button
              variant={activeSection === 'events' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'events' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('events')}
            >
              <Calendar className="w-4 h-4 mr-3" />
              My Events
              {myEvents.length > 0 && (
                <Badge className="ml-auto bg-[#A89F91] text-white text-xs">{myEvents.length}</Badge>
              )}
            </Button>
            
            <Button
              variant={activeSection === 'sponsorships' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'sponsorships' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('sponsorships')}
            >
              <Handshake className="w-4 h-4 mr-3" />
              Sponsorships
              {mySponsorships.length > 0 && (
                <Badge className="ml-auto bg-[#A89F91] text-white text-xs">{mySponsorships.length}</Badge>
              )}
            </Button>
            
            <Button
              variant={activeSection === 'email-blasts' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'email-blasts' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('email-blasts')}
            >
              <Send className="w-4 h-4 mr-3" />
              Email Blasts
              {myEmailBlasts.length > 0 && (
                <Badge className="ml-auto bg-[#A89F91] text-white text-xs">{myEmailBlasts.length}</Badge>
              )}
            </Button>
            
            <Button
              variant={activeSection === 'recognition' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'recognition' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('recognition')}
            >
              <Award className="w-4 h-4 mr-3" />
              Recognition
              {myRecognitions.length > 0 && (
                <Badge className="ml-auto bg-[#A89F91] text-white text-xs">{myRecognitions.length}</Badge>
              )}
            </Button>
            
            <Button
              variant={activeSection === 'plans' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'plans' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('plans')}
            >
              <Crown className="w-4 h-4 mr-3" />
              My Plans
              {myPlans.length > 0 && (
                <Badge className="ml-auto bg-[#A89F91] text-white text-xs">{myPlans.length}</Badge>
              )}
            </Button>

            <Separator className="my-4 bg-[#e8dfd3]" />
            
            <p className="px-3 text-xs font-semibold text-[#6b665f] uppercase tracking-wider mb-2">Content</p>
            
            <Button
              variant={activeSection === 'articles' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'articles' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('articles')}
            >
              <Edit3 className="w-4 h-4 mr-3" />
              My Articles
            </Button>
            
            <Button
              variant={activeSection === 'applications' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'applications' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('applications')}
            >
              <Briefcase className="w-4 h-4 mr-3" />
              Applications
            </Button>
            
            <Button
              variant={activeSection === 'messages' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'messages' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('messages')}
            >
              <MessageSquare className="w-4 h-4 mr-3" />
              Messages
            </Button>

            <Separator className="my-4 bg-[#e8dfd3]" />
            
            <p className="px-3 text-xs font-semibold text-[#6b665f] uppercase tracking-wider mb-2">Settings</p>
            
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeSection === 'settings' ? 'bg-[#A89F91] hover:bg-[#8A8279] text-white' : 'text-[#23231f] hover:bg-[#f5efe7]'}`}
              onClick={() => setActiveSection('settings')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </nav>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#23231f] mb-2">
              Welcome back, {getUserDisplayName().split(' ')[0]}!
            </h1>
            <p className="text-[#6b665f]">Manage your account, track your activities, and explore opportunities.</p>
          </div>

          {activeSection === 'overview' && (
            <>
              {/* Stats Cards - Professional Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-[#e8dfd3] hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6b665f]">My Events</p>
                        <p className="text-2xl font-bold text-[#23231f]">{myEvents.length}</p>
                      </div>
                      <div className="p-2 bg-[#A89F91]/10 rounded-lg">
                        <Calendar className="w-6 h-6 text-[#A89F91]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e8dfd3] hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6b665f]">Sponsorships</p>
                        <p className="text-2xl font-bold text-[#23231f]">{mySponsorships.length}</p>
                      </div>
                      <div className="p-2 bg-[#6d7662]/10 rounded-lg">
                        <Handshake className="w-6 h-6 text-[#6d7662]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e8dfd3] hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6b665f]">Email Blasts</p>
                        <p className="text-2xl font-bold text-[#23231f]">{myEmailBlasts.length}</p>
                      </div>
                      <div className="p-2 bg-[#8B7355]/10 rounded-lg">
                        <Send className="w-6 h-6 text-[#8B7355]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#e8dfd3] hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6b665f]">Articles</p>
                        <p className="text-2xl font-bold text-[#23231f]">{stats.totalArticles}</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Edit3 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Analytics */}
              <div className="mb-8">
                <ProfileAnalytics
                  userId={user?.id || ''}
                  isPremium={user?.user_metadata?.tier?.includes('premium') || false}
                />
              </div>

              {/* Matched Jobs */}
              <div className="mb-8">
                <MatchedJobs
                  userId={user?.id || ''}
                  userTier={userTier as any}
                  maxResults={5}
                />
              </div>

              {/* Quick Actions - Fixed hover text color */}
              <Card className="mb-8 border-[#e8dfd3] bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#23231f]">
                    <Zap className="w-5 h-5 text-[#A89F91]" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Quickly access common tasks and features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/events')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#A89F91] hover:text-white hover:border-[#A89F91] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#A89F91]/10 group-hover:bg-white/20 transition-colors">
                        <Calendar className="w-6 h-6 text-[#A89F91] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Browse Events</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setActiveSection('articles')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#6d7662] hover:text-white hover:border-[#6d7662] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#6d7662]/10 group-hover:bg-white/20 transition-colors">
                        <Edit3 className="w-6 h-6 text-[#6d7662] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Write Article</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/sponsorship')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#8B7355] hover:text-white hover:border-[#8B7355] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#8B7355]/10 group-hover:bg-white/20 transition-colors">
                        <Handshake className="w-6 h-6 text-[#8B7355] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Sponsorship</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/email-blast')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#A89F91] hover:text-white hover:border-[#A89F91] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#A89F91]/10 group-hover:bg-white/20 transition-colors">
                        <Send className="w-6 h-6 text-[#A89F91] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Email Blast</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/recognition')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#6d7662] hover:text-white hover:border-[#6d7662] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#6d7662]/10 group-hover:bg-white/20 transition-colors">
                        <Award className="w-6 h-6 text-[#6d7662] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Recognition</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/open-roles')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#A89F91] hover:text-white hover:border-[#A89F91] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#A89F91]/10 group-hover:bg-white/20 transition-colors">
                        <Search className="w-6 h-6 text-[#A89F91] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Find Jobs</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/add-listing')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#8B7355] hover:text-white hover:border-[#8B7355] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#8B7355]/10 group-hover:bg-white/20 transition-colors">
                        <DollarSign className="w-6 h-6 text-[#8B7355] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Advertise</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setActiveSection('settings')}
                      className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-[#e8dfd3] hover:bg-[#6d7662] hover:text-white hover:border-[#6d7662] transition-all group"
                    >
                      <div className="p-3 rounded-full bg-[#6d7662]/10 group-hover:bg-white/20 transition-colors">
                        <Settings className="w-6 h-6 text-[#6d7662] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Summary */}
              <Card className="border-[#e8dfd3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#A89F91]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myEvents.length === 0 && mySponsorships.length === 0 && myEmailBlasts.length === 0 && myRecognitions.length === 0 ? (
                      <div className="text-center py-8 text-[#6b665f]">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-[#A89F91]/50" />
                        <p>No recent activity yet.</p>
                        <p className="text-sm mt-1">Start exploring events, sponsorships, and more!</p>
                      </div>
                    ) : (
                      <>
                        {myEvents.slice(0, 2).map((event) => (
                          <div key={event.id} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#23231f] truncate">Registered for {event.event.title}</p>
                              <p className="text-xs text-[#6b665f]">{new Date(event.event.date).toLocaleDateString()}</p>
                            </div>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          </div>
                        ))}
                        {mySponsorships.slice(0, 2).map((sponsorship) => (
                          <div key={sponsorship.id} className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Handshake className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#23231f] truncate">Sponsorship: {sponsorship.company_name}</p>
                              <p className="text-xs text-[#6b665f]">{new Date(sponsorship.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge className={getStatusColor(sponsorship.status)}>{sponsorship.status}</Badge>
                          </div>
                        ))}
                        {myEmailBlasts.slice(0, 2).map((blast) => (
                          <div key={blast.id} className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Send className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#23231f] truncate">Email Blast: {blast.subject}</p>
                              <p className="text-xs text-[#6b665f]">{new Date(blast.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge className={getStatusColor(blast.status)}>{blast.status}</Badge>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* My Events Section */}
          {activeSection === 'events' && (
            <div className="space-y-6">
              {/* Registered Events */}
              <Card className="border-[#e8dfd3]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#A89F91]" />
                      My Registered Events
                    </CardTitle>
                    <CardDescription>Events you've registered to attend</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/events')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Events
                  </Button>
                </CardHeader>
                <CardContent>
                  {myEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                      <p className="text-[#6b665f] text-lg">No events registered yet</p>
                      <p className="text-sm text-[#6b665f]/70 mt-1">Discover and join exclusive estate events</p>
                      <Button onClick={() => navigate('/events')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                        Explore Events
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-4 p-4 bg-[#f5efe7]/50 rounded-xl border border-[#e8dfd3] hover:shadow-md transition-shadow">
                          <div className="w-16 h-16 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            {event.event.image_url ? (
                              <img src={event.event.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Calendar className="w-8 h-8 text-[#A89F91]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#23231f] truncate">{event.event.title}</h3>
                            <p className="text-sm text-[#6b665f]">{new Date(event.event.date).toLocaleDateString()} • {event.event.location}</p>
                            <p className="text-xs text-[#6b665f] mt-1 capitalize">{event.event.event_type}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${event.event_id}`)}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submitted Events */}
              <Card className="border-[#e8dfd3]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#A89F91]" />
                      My Submitted Events
                    </CardTitle>
                    <CardDescription>Events you've submitted for approval</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/submit-event')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Event
                  </Button>
                </CardHeader>
                <CardContent>
                  {mySubmittedEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                      <p className="text-[#6b665f] text-lg">No events submitted yet</p>
                      <p className="text-sm text-[#6b665f]/70 mt-1">Share your estate industry events with our community</p>
                      <Button onClick={() => navigate('/submit-event')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                        Submit an Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mySubmittedEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-4 p-4 bg-[#f5efe7]/50 rounded-xl border border-[#e8dfd3] hover:shadow-md transition-shadow">
                          <div className="w-16 h-16 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            {event.image_url ? (
                              <img src={event.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Calendar className="w-8 h-8 text-[#A89F91]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#23231f] truncate">{event.title}</h3>
                            <p className="text-sm text-[#6b665f]">{new Date(event.date).toLocaleDateString()} • {event.time} • {event.location}</p>
                            <p className="text-xs text-[#6b665f] mt-1 capitalize">{event.event_type}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                            <p className="text-xs text-[#6b665f]">Submitted {new Date(event.created_at).toLocaleDateString()}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteSubmittedEvent(event.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* My Sponsorships Section */}
          {activeSection === 'sponsorships' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-[#A89F91]" />
                    My Sponsorships
                  </CardTitle>
                  <CardDescription>Track your sponsorship inquiries</CardDescription>
                </div>
                <Button onClick={() => navigate('/sponsorship')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                  <Plus className="w-4 h-4 mr-2" />
                  New Inquiry
                </Button>
              </CardHeader>
              <CardContent>
                {mySponsorships.length === 0 ? (
                  <div className="text-center py-12">
                    <Handshake className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                    <p className="text-[#6b665f] text-lg">No sponsorship inquiries yet</p>
                    <p className="text-sm text-[#6b665f]/70 mt-1">Partner with us to reach estate professionals</p>
                    <Button onClick={() => navigate('/sponsorship')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                      Explore Sponsorship
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mySponsorships.map((sponsorship) => (
                      <div key={sponsorship.id} className="p-4 bg-[#f5efe7]/50 rounded-xl border border-[#e8dfd3] hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Handshake className="w-6 h-6 text-[#A89F91]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#23231f]">{sponsorship.company_name}</h3>
                              <p className="text-sm text-[#6b665f] capitalize">{sponsorship.sponsorship_type.replace('_', ' ')} • {sponsorship.budget_range}</p>
                              <p className="text-xs text-[#6b665f] mt-1">Submitted {new Date(sponsorship.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(sponsorship.status)}>{sponsorship.status}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeleteSponsorship(sponsorship.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {sponsorship.admin_notes && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-[#e8dfd3]">
                            <p className="text-sm text-[#6b665f]"><span className="font-medium">Admin Note:</span> {sponsorship.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Email Blasts Section */}
          {activeSection === 'email-blasts' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#A89F91]" />
                    My Email Blasts
                  </CardTitle>
                  <CardDescription>Track your email marketing campaigns</CardDescription>
                </div>
                <Button onClick={() => navigate('/email-blast')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                  <Plus className="w-4 h-4 mr-2" />
                  New Blast
                </Button>
              </CardHeader>
              <CardContent>
                {myEmailBlasts.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                    <p className="text-[#6b665f] text-lg">No email blasts yet</p>
                    <p className="text-sm text-[#6b665f]/70 mt-1">Reach thousands of estate professionals</p>
                    <Button onClick={() => navigate('/email-blast')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                      Create Email Blast
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myEmailBlasts.map((blast) => (
                      <div key={blast.id} className="p-4 bg-[#f5efe7]/50 rounded-xl border border-[#e8dfd3] hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Mail className="w-6 h-6 text-[#A89F91]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#23231f] truncate">{blast.subject || 'Untitled Email'}</h3>
                              <p className="text-xs text-[#6b665f]">Submitted {new Date(blast.created_at).toLocaleDateString()}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getStatusColor(blast.status)}>{blast.status}</Badge>
                                <Badge variant="outline" className={blast.payment_status === 'paid' ? 'text-green-600 border-green-200' : ''}>
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {blast.payment_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-sm font-medium text-[#23231f]">${blast.amount_paid?.toFixed(2) || '0.00'}</p>
                            {blast.sent_at && (
                              <p className="text-xs text-green-600">Sent {new Date(blast.sent_at).toLocaleDateString()}</p>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeleteEmailBlast(blast.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Recognition Section */}
          {activeSection === 'recognition' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#A89F91]" />
                    My Recognition Submissions
                  </CardTitle>
                  <CardDescription>Nominations you've submitted</CardDescription>
                </div>
                <Button onClick={() => navigate('/recognition')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nominate Someone
                </Button>
              </CardHeader>
              <CardContent>
                {myRecognitions.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                    <p className="text-[#6b665f] text-lg">No recognition submissions yet</p>
                    <p className="text-sm text-[#6b665f]/70 mt-1">Celebrate outstanding professionals in the industry</p>
                    <Button onClick={() => navigate('/recognition')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                      Submit Recognition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRecognitions.map((recognition) => (
                      <div key={recognition.id} className="p-4 bg-[#f5efe7]/50 rounded-xl border border-[#e8dfd3] hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Star className="w-6 h-6 text-[#A89F91]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#23231f]">{recognition.nominee_name}</h3>
                              <p className="text-sm text-[#6b665f] capitalize">{recognition.category}</p>
                              <p className="text-xs text-[#6b665f] mt-1">Submitted {new Date(recognition.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(recognition.status)}>{recognition.status}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeleteRecognition(recognition.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Plans Section */}
          {activeSection === 'plans' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#A89F91]" />
                    My Plans & Subscriptions
                  </CardTitle>
                  <CardDescription>Your active memberships and plans</CardDescription>
                </div>
                <Button onClick={() => navigate('/add-listing')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                  <Plus className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </CardHeader>
              <CardContent>
                {myPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Crown className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                    <p className="text-[#6b665f] text-lg">No active plans</p>
                    <p className="text-sm text-[#6b665f]/70 mt-1">Upgrade to unlock premium features</p>
                    <Button onClick={() => navigate('/add-listing')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                      View Plans
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPlans.map((plan) => (
                      <div key={plan.id} className="p-4 bg-[#f5efe7]/50 rounded-xl border border-[#e8dfd3] hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-[#A89F91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Crown className="w-6 h-6 text-[#A89F91]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#23231f]">{plan.plan_name}</h3>
                              <p className="text-sm text-[#6b665f]">Started {new Date(plan.start_date).toLocaleDateString()}</p>
                              <p className="text-xs text-[#6b665f] mt-1">Expires {new Date(plan.end_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                            <p className="text-sm font-medium text-[#23231f] mt-2">${plan.amount_paid.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#A89F91]" />
                    My Applications
                  </CardTitle>
                  <CardDescription>Jobs you've applied for</CardDescription>
                </div>
                <Button onClick={() => navigate('/open-roles')} className="bg-[#A89F91] hover:bg-[#8A8279]">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                  <p className="text-[#6b665f] text-lg">No applications yet</p>
                  <p className="text-sm text-[#6b665f]/70 mt-1">Find your next opportunity</p>
                  <Button onClick={() => navigate('/open-roles')} className="mt-4 bg-[#A89F91] hover:bg-[#8A8279]">
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#A89F91]" />
                  Messages
                </CardTitle>
                <CardDescription>Your inbox and conversations (unlimited on all paid professional plans)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-[#A89F91]/30 mx-auto mb-4" />
                  <p className="text-[#6b665f] text-lg">Open your messaging inbox</p>
                  <p className="text-sm text-[#6b665f]/70 mt-1 mb-6">Connect with other professionals. Basic and Pro plans include unlimited messaging.</p>
                  <Button
                    onClick={() => navigate('/messaging')}
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#A89F91]" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-[#e8dfd3] hover:bg-[#f5efe7]"
                    onClick={() => navigate('/my-profile')}
                  >
                    <User className="w-5 h-5 mr-3 text-[#A89F91]" />
                    <div className="text-left">
                      <p className="font-medium">Profile Settings</p>
                      <p className="text-sm text-[#6b665f]">Update your personal information</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-[#6b665f]" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-[#e8dfd3] hover:bg-[#f5efe7]"
                    onClick={() => navigate('/notification-settings')}
                  >
                    <Bell className="w-5 h-5 mr-3 text-[#A89F91]" />
                    <div className="text-left">
                      <p className="font-medium">Notification Settings</p>
                      <p className="text-sm text-[#6b665f]">Manage email and push notifications</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-[#6b665f]" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-[#e8dfd3] hover:bg-[#f5efe7]"
                    onClick={() => navigate('/account')}
                  >
                    <FileText className="w-5 h-5 mr-3 text-[#A89F91]" />
                    <div className="text-left">
                      <p className="font-medium">Account Details</p>
                      <p className="text-sm text-[#6b665f]">View subscription and billing info</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-[#6b665f]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article Management Section */}
          {activeSection === 'articles' && (
            <Card className="border-[#e8dfd3]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-[#A89F91]" />
                      My Articles
                    </CardTitle>
                    <CardDescription>Create and manage your articles</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveSection('overview')}
                    className="border-[#e8dfd3]"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ArticleManager
                  userRole="user"
                  userId={user?.id || ''}
                  userName={getUserDisplayName()}
                  userAvatar={getProfileImage()}
                  userTier={userTier as any}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
