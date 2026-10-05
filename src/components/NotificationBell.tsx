import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const typeEmoji = (type: string): string => {
  if (type.includes('job')) return '💼';
  if (type.includes('service')) return '🛎️';
  if (type.includes('event')) return '📅';
  if (type.includes('message')) return '💬';
  if (type.includes('view')) return '👁️';
  if (type.includes('forum')) return '🗣️';
  return '🔔';
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
};

/**
 * Bell icon with unread badge + dropdown of the member's latest notifications.
 * Uses its own click-outside handling (matches LocationAutocomplete pattern)
 * so it works inside the navbar without extra deps.
 */
export default function NotificationBell({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, link, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    else setNotifications([]);
    // Poll lightly so new matches/messages surface without a refresh
    const id = setInterval(() => { if (user) load(); }, 60000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!user) return null;

  const markRead = async (n: AppNotification) => {
    if (!n.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
      );
    }
    setOpen(false);
    if (n.link) {
      // Stored links may be absolute (for emails) — strip the origin for the router
      const path = n.link.startsWith('http') ? new URL(n.link).pathname : n.link;
      navigate(path);
    }
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', ids);
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative text-foreground hover:bg-muted"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-[#A89F91] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#A89F91]" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                You're all caught up.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors flex gap-3 ${
                    n.is_read ? 'opacity-60' : ''
                  }`}
                >
                  <span aria-hidden="true" className="text-lg leading-none mt-0.5">
                    {typeEmoji(n.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#A89F91] flex-shrink-0" />
                      )}
                    </span>
                    {n.message && (
                      <span className="block text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </span>
                    )}
                    <span className="block text-[11px] text-muted-foreground mt-1">
                      {timeAgo(n.created_at)}
                    </span>
                  </span>
                  {n.is_read ? null : (
                    <Check className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
