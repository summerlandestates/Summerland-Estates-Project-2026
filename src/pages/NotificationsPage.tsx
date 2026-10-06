import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadNotifications();
  }, [user, authLoading]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const toLocalPath = (link: string | null) => {
    if (!link) return null;
    try {
      const url = new URL(link);
      return url.origin === window.location.origin ? url.pathname + url.search : url.pathname + url.search;
    } catch {
      return link.startsWith('/') ? link : `/${link}`;
    }
  };

  const markRead = async (n: Notification) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      supabase.from('notifications').update({ is_read: true }).eq('id', n.id).then(() => {});
    }
    const path = toLocalPath(n.link);
    if (path) navigate(path);
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).in('id', unread);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Notifications" />
      <NavBar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-[#23231f] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#A89F91]" /> Notifications
          </h1>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-[#6b665f]">
              <Bell className="w-10 h-10 mx-auto mb-3 text-[#A89F91]/50" />
              No notifications yet. We'll let you know when something matches your interests.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  n.is_read
                    ? 'bg-white border-[#e8dfd3]'
                    : 'bg-[#f5efe7] border-[#A89F91]/30 font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#23231f]">{n.title}</p>
                    {n.message && <p className="text-sm text-[#6b665f] mt-0.5">{n.message}</p>}
                  </div>
                  <span className="text-xs text-[#6b665f] whitespace-nowrap shrink-0">
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
