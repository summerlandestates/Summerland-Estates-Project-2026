import { supabase } from '@/lib/supabase';
import { getPlan, METERED_FEATURE_LABELS, type MeteredFeature, type Plan } from './plans';

// "Try everything twice, then prompt to upgrade" metering.
// Basic-plan users get the plan's monthly allowance of each premium action
// (counted per feature, resetting on the 1st of each month). Paid plans are
// unmetered unless the plan sets a limit (e.g. Pro service-request bids).

function startOfMonthIso(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Advanced search has no server-side record — count uses locally per month.
export function recordAdvancedSearchUse(userId: string): void {
  try {
    const key = `usage:advancedSearch:${userId}:${monthKey()}`;
    localStorage.setItem(key, String((parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1));
  } catch {
    // localStorage unavailable — fail open
  }
}

function getAdvancedSearchCount(userId: string): number {
  try {
    return parseInt(localStorage.getItem(`usage:advancedSearch:${userId}:${monthKey()}`) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

async function getMonthlyNewConversationCount(userId: string): Promise<number> {
  const { data: myParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);
  const ids = (myParticipants || []).map((p) => p.conversation_id);
  if (ids.length === 0) return 0;

  const { count } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .in('id', ids)
    .gte('created_at', startOfMonthIso());
  return count || 0;
}

export async function getMonthlyUsage(userId: string, feature: MeteredFeature): Promise<number> {
  const since = startOfMonthIso();
  switch (feature) {
    case 'newConversations':
      return getMonthlyNewConversationCount(userId);
    case 'jobApplications': {
      const { count } = await supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('applicant_id', userId)
        .gte('created_at', since);
      return count || 0;
    }
    case 'serviceBids': {
      const { count } = await supabase
        .from('service_bids')
        .select('id', { count: 'exact', head: true })
        .eq('bidder_id', userId)
        .gte('created_at', since);
      return count || 0;
    }
    case 'jobPosts': {
      const { count } = await supabase
        .from('job_postings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', since);
      return count || 0;
    }
    case 'advancedSearch':
      return getAdvancedSearchCount(userId);
  }
}

export interface MeteredCheck {
  allowed: boolean;
  plan: Plan;
  isAdmin: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

/**
 * Check whether the user may perform a metered action right now.
 * Admins and unmetered plans always pass. Returns usage info so callers can
 * show an upgrade prompt when `allowed` is false.
 */
export async function checkMeteredAccess(
  userId: string,
  userTier: string | null | undefined,
  feature: MeteredFeature
): Promise<MeteredCheck> {
  // Admin accounts bypass metering entirely.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  const isAdmin = profile?.role === 'admin';

  const plan = getPlan(userTier);
  const limit = plan.allowances[feature];

  if (isAdmin || limit === null) {
    return { allowed: true, plan, isAdmin, used: 0, limit, remaining: null };
  }

  const used = await getMonthlyUsage(userId, feature);
  return {
    allowed: used < limit,
    plan,
    isAdmin,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/** Human-friendly sentence for upgrade prompts. */
export function meteredFeatureLabel(feature: MeteredFeature): string {
  return METERED_FEATURE_LABELS[feature];
}
