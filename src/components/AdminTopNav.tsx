import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface AdminTopNavProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  link: string;
  created_at: string;
}

const reportLabels: Record<string, string> = {
  profile: 'profile',
  job: 'job posting',
  message: 'message',
  service_request: 'service request',
  review: 'review',
  event: 'event',
  article: 'article',
  post: 'post',
};

export default function AdminTopNav({ onMenuToggle, pageTitle = 'Admin' }: AdminTopNavProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('adminReadNotifications') || '[]'))
  );
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // Real admin alerts: open member reports + pending membership applications
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const items: AdminNotification[] = [];

      const { data: reports } = await supabase
        .from('reports')
        .select('id, target_type, target_label, reason, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);

      for (const r of reports || []) {
        items.push({
          id: `report-${r.id}`,
          title: `Reported ${reportLabels[r.target_type] || 'content'}`,
          message: `${r.target_label || 'Content'} — ${r.reason}`,
          type: 'warning',
          link: '/admin/reports',
          created_at: r.created_at,
        });
      }

      try {
        const res = await fetch('/api/admin-membership-applications');
        if (res.ok) {
          const data = await res.json();
          const pending = (data.applications || [])
            .filter((a: any) => a.status === 'pending')
            .slice(0, 10);
          for (const a of pending) {
            items.push({
              id: `app-${a.id}`,
              title: 'Membership application pending',
              message: `${a.full_name || a.email} applied for membership.`,
              type: 'info',
              link: '/admin/applications',
              created_at: a.created_at,
            });
          }
        }
      } catch {
        // admin applications API unavailable — skip
      }

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(items.slice(0, 15));
    };

    load();
    const id = setInterval(load, 120000);
    return () => clearInterval(id);
  }, [user]);

  const markRead = (id: string, link: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('adminReadNotifications', JSON.stringify([...next]));
      return next;
    });
    setNotificationsOpen(false);
    navigate(link);
  };

  const markAllRead = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
    localStorage.setItem('adminReadNotifications', JSON.stringify([...all]));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8E2D9] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-[#5C554A] hover:bg-[#F2EDE4] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#2C2820]">{pageTitle}</h1>
          <p className="hidden sm:block text-xs text-[#9A9183]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#5C554A] hover:bg-[#F2EDE4] hover:text-[#2C2820] transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Site
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-[#5C554A] hover:bg-[#F2EDE4] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white rounded-xl border border-[#E8E2D9] shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9]">
                <h3 className="font-semibold text-[#2C2820]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-medium text-[#A89F91] hover:text-[#8A8279]"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-[#9A9183]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isRead = readIds.has(notification.id);
                    return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markRead(notification.id, notification.link)}
                      className={`w-full text-left px-4 py-3 border-b border-[#F2EDE4] hover:bg-[#FBF9F6] transition-colors ${
                        isRead ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            notification.type === 'success'
                              ? 'bg-green-500'
                              : notification.type === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-[#A89F91]'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2C2820]">{notification.title}</p>
                          <p className="text-xs text-[#9A9183] mt-0.5">{notification.message}</p>
                          <p className="text-[10px] text-[#B8AFA3] mt-1">
                            {new Date(notification.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#A89F91] shrink-0" />
                        )}
                      </div>
                    </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#F2EDE4] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#A89F91] text-white flex items-center justify-center text-xs font-semibold">
              {getInitials(user?.email || 'AD')}
            </div>
            <ChevronDown className="w-4 h-4 text-[#9A9183] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E8E2D9] shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8E2D9]">
                <p className="text-sm font-medium text-[#2C2820] truncate">{user?.email || 'Admin'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-[#A89F91]" />
                  <span className="text-[10px] font-medium text-[#A89F91] uppercase tracking-wider">
                    Administrator
                  </span>
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5C554A] hover:bg-[#F2EDE4] hover:text-[#2C2820]"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  to="/my-profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5C554A] hover:bg-[#F2EDE4] hover:text-[#2C2820]"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
