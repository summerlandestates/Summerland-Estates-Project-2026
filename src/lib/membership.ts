import type { User } from '@supabase/supabase-js';
import { getPlanById } from '@/data/pricing';
import type { CheckoutData, SerializedApplicationData } from '@/types';

type ProfileLike = {
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  role?: string | null;
  profile_type?: string | null;
  tier?: string | null;
  status?: string | null;
  honorary_until?: string | null;
  honorary_tier?: string | null;
  application_data?: Record<string, unknown> | null;
};

export type MembershipPaymentStatus = 'pending' | 'paid' | 'not_required';

export function isComplimentaryTier(tier?: string | null) {
  return Boolean(tier && (tier.includes('free') || tier.includes('community') || tier === 'professional-basic'));
}

export function isHonoraryMember(profile?: ProfileLike | null) {
  const until =
    profile?.honorary_until ||
    (typeof profile?.application_data?.honorary_until === 'string'
      ? profile.application_data.honorary_until
      : null);
  if (!until) return false;
  return new Date(until) > new Date();
}

export function getMergedApplicationData(profile?: ProfileLike | null, authUser?: User | null) {
  return {
    ...(authUser?.user_metadata?.application_data || {}),
    ...(profile?.application_data || {}),
  } as SerializedApplicationData;
}

export function getSelectedTier(profile?: ProfileLike | null, authUser?: User | null) {
  const applicationData = getMergedApplicationData(profile, authUser);
  return (
    profile?.tier ||
    authUser?.user_metadata?.tier ||
    (typeof applicationData.selected_tier === 'string' ? applicationData.selected_tier : null)
  );
}

export function getAccountStatus(profile?: ProfileLike | null, authUser?: User | null) {
  const applicationData = getMergedApplicationData(profile, authUser);
  return (
    profile?.status ||
    (typeof applicationData.account_status === 'string' ? applicationData.account_status : null) ||
    authUser?.user_metadata?.account_status ||
    (Object.keys(applicationData).length ? 'pending' : null)
  );
}

export function getPaymentStatus(profile?: ProfileLike | null, authUser?: User | null): MembershipPaymentStatus {
  const applicationData = getMergedApplicationData(profile, authUser);
  const selectedTier = getSelectedTier(profile, authUser);
  const explicitStatus =
    (typeof applicationData.payment_status === 'string' ? applicationData.payment_status : null) ||
    authUser?.user_metadata?.payment_status ||
    null;

  if (explicitStatus === 'paid' || explicitStatus === 'pending' || explicitStatus === 'not_required') {
    return explicitStatus;
  }

  if (isHonoraryMember(profile)) {
    return 'not_required';
  }

  if (isComplimentaryTier(selectedTier)) {
    return 'not_required';
  }

  return selectedTier ? 'pending' : 'not_required';
}

export function requiresMembershipPayment(profile?: ProfileLike | null, authUser?: User | null) {
  if (isHonoraryMember(profile)) return false;
  const selectedTier = getSelectedTier(profile, authUser);
  return Boolean(selectedTier && !isComplimentaryTier(selectedTier) && getPaymentStatus(profile, authUser) !== 'paid');
}

export function buildCheckoutDataFromMembership(profile?: ProfileLike | null, authUser?: User | null): CheckoutData | null {
  const applicationData = getMergedApplicationData(profile, authUser);
  const selectedTier = getSelectedTier(profile, authUser);

  if (!selectedTier) {
    return null;
  }

  const selectedPlan = getPlanById(selectedTier as never);
  const name =
    profile?.full_name ||
    authUser?.user_metadata?.full_name ||
    (typeof applicationData.name === 'string' ? applicationData.name : '') ||
    '';
  const email =
    profile?.email ||
    authUser?.email ||
    (typeof applicationData.email === 'string' ? applicationData.email : '') ||
    '';

  return {
    name,
    email,
    password: '',
    phone:
      profile?.phone ||
      (typeof applicationData.phone === 'string' ? applicationData.phone : '') ||
      '',
    location:
      profile?.location ||
      (typeof applicationData.location === 'string' ? applicationData.location : '') ||
      '',
    role:
      profile?.role ||
      (typeof applicationData.role === 'string' ? applicationData.role : undefined),
    bio: typeof applicationData.bio === 'string' ? applicationData.bio : '',
    profileType:
      profile?.profile_type ||
      (typeof applicationData.profile_type === 'string' ? applicationData.profile_type : '') ||
      '',
    selectedTier,
    planName: selectedPlan?.name || formatTierLabel(selectedTier),
    planPrice: selectedPlan?.price || '$0',
    applicationData,
  };
}

export function formatTierLabel(tier?: string | null) {
  return (tier || 'membership').replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
