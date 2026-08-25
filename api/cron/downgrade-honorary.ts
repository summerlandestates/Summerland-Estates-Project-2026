import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const FREE_TIER_BY_PROFILE_TYPE: Record<string, string> = {
  professional: 'professional-basic',
  business: 'business-free',
  agency: 'agency-free',
  estates: 'estates-free',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = Array.isArray(req.headers.authorization)
      ? req.headers.authorization[0]
      : req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date().toISOString();

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, profile_type, tier, honorary_tier')
    .lte('honorary_until', now)
    .not('honorary_until', 'is', null);

  if (error) {
    console.error('Downgrade honorary error:', error);
    return res.status(500).json({ error: error.message });
  }

  let downgraded = 0;

  for (const profile of profiles || []) {
    const freeTier =
      FREE_TIER_BY_PROFILE_TYPE[profile.profile_type || ''] ||
      `${profile.profile_type || 'professional'}-free`;

    const currentlyHonorary =
      profile.honorary_tier === profile.tier ||
      /\b(pro|enterprise|hiring)\b/.test(profile.tier || '');

    if (!currentlyHonorary) {
      continue;
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        tier: freeTier,
        honorary_until: null,
        honorary_tier: null,
        subscription_status: 'inactive',
        payment_status: 'not_required',
      })
      .eq('id', profile.id);

    if (!updateError) {
      downgraded += 1;
    } else {
      console.error(`Failed to downgrade profile ${profile.id}:`, updateError);
    }
  }

  return res.status(200).json({ success: true, downgraded });
}
