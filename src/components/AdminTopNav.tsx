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
  CheckCircle2,
  X,
} from 'lucide-react';

interface AdminTopNavProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'New application received',
    message: 'A new professional membership application is pending review.',
    type: 'info',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    title: 'Promo code redeemed',
    message: 'A user redeemed promo code PRO-7X9A2B.',
    type: 'success',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    title: 'System update',
    message: 'Dashboard analytics are now live.',
    type: 'info',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export default function AdminTopNav({ onMenuToggle, pageTitle = 'Admin' }: AdminTopNavProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className={`w-full text-left px-4 py-3 border-b border-[#F2EDE4] hover:bg-[#FBF9F6] transition-colors ${
                        notification.read ? 'opacity-70' : ''
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
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[#A89F91] shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
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
