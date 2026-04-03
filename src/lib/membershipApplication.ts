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

export async function submitMembershipApplication(checkoutData: CheckoutData) {
  const dbRole = roleMapping[checkoutData.profileType] || 'professional';
  const paymentStatus = isComplimentaryTier(checkoutData.selectedTier) ? 'not_required' : 'pending';
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

  const profilePayload = {
    full_name: checkoutData.name,
    role: dbRole,
    phone: checkoutData.phone,
    location: checkoutData.location,
    profile_type: checkoutData.profileType,
    tier: checkoutData.selectedTier,
    application_data: profileApplicationData,
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

  return {
    userId: authData.user.id,
    paymentStatus,
  };
}
