import { supabase } from '@/lib/supabase';
import type { CheckoutData } from '@/types';
import { isComplimentaryTier } from '@/lib/membership';

const roleMapping: Record<string, string> = {
  professional: 'professional',
  'service-provider': 'business',
  agency: 'agency',
  estates: 'estates',
};

function generateFallbackPassword() {
  return (
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8).toUpperCase() +
    '!@#$%' +
    Math.floor(Math.random() * 1000)
  );
}
export async function validateAndRedeemPromoCode(code: string, userId: string): Promise<{
  valid: boolean;
  tier?: string;
  promoCodeId?: string;
  error?: string;
}> {
  if (!code || !userId) return { valid: false };

  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.trim())
    .eq('is_active', true)
    .single();

  if (error || !promo) return { valid: false, error: 'Invalid promo code' };
  if (promo.valid_until && new Date(promo.valid_until) < new Date()) return { valid: false, error: 'Promo code expired' };
  if (promo.used_count >= promo.max_uses) return { valid: false, error: 'Promo code fully redeemed' };

  const { data: existing } = await supabase
    .from('user_promo_codes')
    .select('id')
    .eq('user_id', userId)
    .eq('promo_code_id', promo.id)
    .single();

  if (existing) return { valid: false, error: 'Promo code already used by this account' };

  const expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: redeemError } = await supabase.from('user_promo_codes').insert({
    user_id: userId,
    promo_code_id: promo.id,
    redeemed_at: new Date().toISOString(),
    expires_at: expiresAt,
  });

  if (redeemError) return { valid: false, error: redeemError.message };

  await supabase
    .from('promo_codes')
    .update({ used_count: (promo.used_count || 0) + 1 })
    .eq('id', promo.id);

  return { valid: true, tier: promo.tier || 'professional-pro', promoCodeId: promo.id };
}

export async function submitMembershipApplication(checkoutData: CheckoutData) {
  const dbRole = roleMapping[checkoutData.profileType] || 'professional';
  let promoResult: Awaited<ReturnType<typeof validateAndRedeemPromoCode>> | null = null;
  let promoTier = checkoutData.selectedTier;
  let promoExpiresAt: string | null = null;

  if (checkoutData.promoCode) {
    promoResult = {
      valid: false,
      error: 'Will validate after account creation',
    } as any;
  }

  const paymentStatus = isComplimentaryTier(checkoutData.selectedTier) || (promoResult?.valid)
    ? 'not_required'
    : 'pending';
  const accountPassword = checkoutData.password || generateFallbackPassword();
  const profileApplicationData = {
    ...checkoutData.applicationData,
    account_status: 'pending',
    rejection_reason: null,
    payment_status: paymentStatus,
    profile_type: checkoutData.profileType,
    selected_tier: checkoutData.selectedTier,
  };

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: checkoutData.email,
    password: accountPassword,
    options: {
      data: {
        full_name: checkoutData.name,
        email_verified: false,
        account_status: 'pending',
        payment_status: paymentStatus,
        phone: checkoutData.phone || null,
        location: checkoutData.location || null,
        role: checkoutData.role || null,
        bio: checkoutData.bio || null,
        profile_type: checkoutData.profileType,
        tier: checkoutData.selectedTier,
        application_data: profileApplicationData,
      },
    },
  });

  if (signUpError) {
    throw signUpError;
  }

  if (!authData.user) {
    throw new Error('Failed to create user account');
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (checkoutData.promoCode && authData.user) {
    promoResult = await validateAndRedeemPromoCode(
      checkoutData.promoCode,
      authData.user.id
    );
    if (promoResult.valid) {
      promoTier = promoResult.tier || promoTier;
      promoExpiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const finalPaymentStatus = promoResult?.valid ? 'not_required' : paymentStatus;
  const finalApplicationData = {
    ...profileApplicationData,
    payment_status: finalPaymentStatus,
    selected_tier: promoResult?.valid ? promoTier : checkoutData.selectedTier,
  };

  const profilePayload = {
    full_name: checkoutData.name,
    role: dbRole,
    phone: checkoutData.phone,
    location: checkoutData.location,
    profile_type: checkoutData.profileType,
    tier: promoResult?.valid ? promoTier : checkoutData.selectedTier,
    subscription_status: promoResult?.valid ? 'active' : undefined,
    subscription_expires_at: promoExpiresAt,
    application_data: finalApplicationData,
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profilePayload)
    .eq('id', authData.user.id);

  if (profileError) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: checkoutData.email,
      ...profilePayload,
    });

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }
  }

  await supabase.auth.signOut();

  // Send registration emails (welcome to user + notification to admin)
  try {
    await fetch('/api/send-registration-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: checkoutData.name,
        email: checkoutData.email,
        profileType: checkoutData.profileType,
        tier: checkoutData.selectedTier,
        phone: checkoutData.phone,
      }),
    });
  } catch (emailErr) {
    console.error('Failed to send registration emails:', emailErr);
  }

  return {
    userId: authData.user.id,
    paymentStatus,
  };
}
