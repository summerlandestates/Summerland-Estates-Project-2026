import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Users,
  Clock,
  CheckCircle2,
  Gift,
  CreditCard,
  Briefcase,
  Calendar,
  Mail,
  ArrowRight,
  ClipboardList,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  pendingApplications: number;
  approvedMembers: number;
  activePromoCodes: number;
  promoRedemptions: number;
  activeJobs: number;
  upcomingEvents: number;
  newsletterSubscribers: number;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  tier: string | null;
  status: string | null;
  profile_type: string | null;
  created_at: string;
}

interface PromoCode {
  id: string;
  code: string;
  tier: string | null;
  is_active: boolean;
  used_count: number;
  max_uses: number | null;
  valid_until: string | null;
}

const initialStats: Stats = {
  totalUsers: 0,
  pendingApplications: 0,
  approvedMembers: 0,
  activePromoCodes: 0,
  promoRedemptions: 0,
  activeJobs: 0,
  upcomingEvents: 0,
  newsletterSubscribers: 0,
};

async function countRows(table: string, filter?: (q: any) => any): Promise<number> {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) query = filter(query);
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [pendingApps, setPendingApps] = useState<Profile[]>([]);
  const [recentMembers, setRecentMembers] = useState<Profile[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/admin/login');
      return;
    }
    loadDashboard();
  }, [authLoading, user]);

  const loadDashboard = async () => {
    try {
      const [
        totalUsers,
        pendingApplications,
        approvedMembers,
        activePromoCodes,
        promoRedemptions,
        activeJobs,
        upcomingEvents,
        newsletterSubscribers,
      ] = await Promise.all([
        countRows('profiles'),
        countRows('profiles', (q) => q.eq('status', 'pending')),
        countRows('profiles', (q) => q.eq('status', 'approved')),
        countRows('promo_codes', (q) => q.eq('is_active', true)),
        countRows('user_promo_codes'),
        countRows('job_postings', (q) => q.eq('status', 'active')),
        countRows('events', (q) => q.gte('date', new Date().toISOString().split('T')[0])),
        countRows('newsletter_subscribers'),
      ]);

      setStats({
        totalUsers,
        pendingApplications,
        approvedMembers,
        activePromoCodes,
        promoRedemptions,
        activeJobs,
        upcomingEvents,
        newsletterSubscribers,
      });

      const { data: pending } = await supabase
        .from('profiles')
        .select('id, email, full_name, tier, status, profile_type, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      setPendingApps(pending || []);

      const { data: members } = await supabase
        .from('profiles')
        .select('id, email, full_name, tier, status, profile_type, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentMembers(members || []);

      const { data: promos } = await supabase
        .from('promo_codes')
        .select('id, code, tier, is_active, used_count, max_uses, valid_until')
        .order('created_at', { ascending: false })
        .limit(4);
      setPromoCodes(promos || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-[#A89F91]/10',
      iconColor: 'text-[#A89F91]',
      href: '/admin/users',
    },
    {
      label: 'Pending Applications',
      value: stats.pendingApplications,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      href: '/admin/applications',
      highlight: stats.pendingApplications > 0,
    },
    {
      label: 'Approved Members',
      value: stats.approvedMembers,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      href: '/admin/users',
    },
    {
      label: 'Active Promo Codes',
      value: stats.activePromoCodes,
      icon: Gift,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/admin/promo-codes',
    },
    {
      label: 'Promo Redemptions',
      value: stats.promoRedemptions,
      icon: CreditCard,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/admin/promo-codes',
    },
    {
      label: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      href: '/admin/jobs',
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      href: '/admin/events',
    },
    {
      label: 'Newsletter Subscribers',
      value: stats.newsletterSubscribers,
      icon: Mail,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      href: '/admin/newsletter',
    },
  ];

  return (
    <div>
      {/* noindex + tab title provided by the Private route wrapper in App.tsx */}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#2C2820] mb-1">
          Dashboard Overview
        </h1>
        <p className="text-sm text-[#9A9183]">
          Welcome back. Here is what is happening across the platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.href} className="group">
              <Card
                className={`border-[#E8E2D9] bg-white transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  stat.highlight ? 'ring-1 ring-amber-300' : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#9A9183]">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-[#2C2820]">{stat.value}</p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#A89F91] opacity-0 group-hover:opacity-100 transition-opacity">
                    View details <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Applications */}
        <Card className="border-[#E8E2D9] bg-white xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#2C2820] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#A89F91]" />
              Pending Applications
            </CardTitle>
            <Link to="/admin/applications">
              <Button variant="ghost" size="sm" className="text-[#A89F91] hover:text-[#8A8279]">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApps.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9A9183]">
                No pending applications right now.
              </p>
            ) : (
              <div className="divide-y divide-[#F2EDE4]">
                {pendingApps.map((app) => (
                  <Link
                    key={app.id}
                    to={`/admin/applications/${app.id}`}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F2EDE4] text-[#A89F91] flex items-center justify-center text-xs font-semibold shrink-0">
                        {(app.full_name || app.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#2C2820] truncate">
                          {app.full_name || app.email}
                        </p>
                        <p className="text-xs text-[#9A9183] truncate">{app.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className="bg-[#F2EDE4] text-[#5C554A] border-0 capitalize">
                        {app.profile_type || 'member'}
                      </Badge>
                      <span className="text-xs text-[#B8AFA3] hidden sm:block">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#D4CCC0] group-hover:text-[#A89F91] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promo Codes */}
        <Card className="border-[#E8E2D9] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#2C2820] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#A89F91]" />
              Promo Codes
            </CardTitle>
            <Link to="/admin/promo-codes">
              <Button variant="ghost" size="sm" className="text-[#A89F91] hover:text-[#8A8279]">
                Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {promoCodes.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9A9183]">No promo codes yet.</p>
            ) : (
              <div className="space-y-3">
                {promoCodes.map((pc) => (
                  <div
                    key={pc.id}
                    className="flex items-center justify-between rounded-lg border border-[#F2EDE4] px-3 py-2.5"
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold text-[#2C2820]">{pc.code}</p>
                      <p className="text-xs text-[#9A9183]">
                        {pc.tier || 'pro'} • {pc.used_count}/{pc.max_uses ?? '∞'} used
                      </p>
                    </div>
                    <Badge
                      className={
                        pc.is_active
                          ? 'bg-green-100 text-green-700 border-0'
                          : 'bg-gray-100 text-gray-500 border-0'
                      }
                    >
                      {pc.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card className="border-[#E8E2D9] bg-white xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#2C2820] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#A89F91]" />
              Recent Subscribers
            </CardTitle>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="text-[#A89F91] hover:text-[#8A8279]">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMembers.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9A9183]">No approved members yet.</p>
            ) : (
              <div className="divide-y divide-[#F2EDE4]">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#A89F91]/10 text-[#A89F91] flex items-center justify-center text-xs font-semibold shrink-0">
                        {(member.full_name || member.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#2C2820] truncate">
                          {member.full_name || member.email}
                        </p>
                        <p className="text-xs text-[#9A9183] truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {member.tier && (
                        <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-0 capitalize">
                          {member.tier}
                        </Badge>
                      )}
                      <span className="text-xs text-[#B8AFA3] hidden sm:block">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-[#E8E2D9] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#2C2820]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Review applications', href: '/admin/applications', icon: ClipboardList },
                { label: 'Create promo code', href: '/admin/promo-codes', icon: Gift },
                { label: 'Send email blast', href: '/admin/email-blasts', icon: Mail },
                { label: 'Manage events', href: '/admin/events', icon: Calendar },
                { label: 'Edit site content', href: '/admin/content', icon: FileText },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href + action.label}
                    to={action.href}
                    className="flex items-center justify-between rounded-lg border border-[#F2EDE4] px-3 py-2.5 text-sm font-medium text-[#5C554A] hover:bg-[#F2EDE4] hover:text-[#2C2820] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#A89F91]" />
                      {action.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#D4CCC0]" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
