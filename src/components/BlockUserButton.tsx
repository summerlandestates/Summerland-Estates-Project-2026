import { useEffect, useState } from 'react';
import { Ban, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface BlockUserButtonProps {
  targetUserId?: string;
  targetListingId?: string;
  targetLabel?: string;
  className?: string;
}

const LOCAL_KEY = 'blockedProfiles';

export function getBlockedIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isBlocked(id?: string | null): boolean {
  if (!id) return false;
  return getBlockedIds().includes(id);
}

const setLocalBlock = (id: string, blocked: boolean) => {
  const ids = new Set(getBlockedIds());
  if (blocked) ids.add(id);
  else ids.delete(id);
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...ids]));
};

export default function BlockUserButton({
  targetUserId,
  targetListingId,
  targetLabel = 'this member',
  className = '',
}: BlockUserButtonProps) {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (targetUserId && user) {
        const { data } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetUserId)
          .maybeSingle();
        setBlocked(!!data);
      } else if (targetListingId) {
        setBlocked(isBlocked(targetListingId));
      }
    };
    check();
  }, [targetUserId, targetListingId, user]);

  const toggleBlock = async () => {
    const next = !blocked;
    setSaving(true);

    if (targetUserId && user) {
      if (next) {
        await supabase
          .from('blocked_users')
          .upsert({ blocker_id: user.id, blocked_id: targetUserId }, { onConflict: 'blocker_id,blocked_id' });
      } else {
        await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetUserId);
      }
    }

    if (targetListingId) {
      setLocalBlock(targetListingId, next);
    }

    setBlocked(next);
    setSaving(false);
    toast.success(next ? `${targetLabel} blocked` : `${targetLabel} unblocked`, {
      description: next
        ? 'You will no longer see this member in search or be able to message them.'
        : 'This member is visible to you again.',
    });
  };

  return (
    <Button
      variant="outline"
      className={`${blocked ? 'border-destructive text-destructive' : 'border-border text-foreground'} hover:bg-muted ${className}`}
      onClick={toggleBlock}
      disabled={saving || (!targetUserId && !targetListingId)}
    >
      {blocked ? <Undo2 className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
      {blocked ? 'Unblock' : 'Block'}
    </Button>
  );
}
