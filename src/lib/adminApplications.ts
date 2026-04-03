export interface MembershipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileType: 'professional' | 'service-provider' | 'agency' | 'estates';
  estatesSubType?: string;
  selectedTier: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  bio?: string;
  role?: string;
  yearsExperience?: number;
  resume?: string;
  notes?: string;
  applicationData?: Record<string, unknown>;
}

export const parseApiResponse = async (response: Response) => {
  const responseText = await response.text();

  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      response.status === 404
        ? 'Membership applications API was not found. Restart the local API server.'
        : 'The API returned an invalid response. Restart the local API server and try again.'
    );
  }
};

export const mapMembershipApplication = (profile: any): MembershipApplication => ({
  id: profile.id,
  name: profile.full_name || 'Unnamed Applicant',
  email: profile.email,
  phone: profile.phone || profile.application_data?.phone || 'Not provided',
  location: profile.location || profile.application_data?.location || 'Not provided',
  profileType: (profile.profile_type ||
    profile.application_data?.profile_type ||
    'professional') as MembershipApplication['profileType'],
  estatesSubType: profile.application_data?.estates_sub_type || undefined,
  selectedTier: profile.tier || profile.application_data?.selected_tier || 'free',
  submittedDate: profile.created_at,
  status: (profile.status || profile.application_data?.account_status || 'pending') as MembershipApplication['status'],
  bio: profile.application_data?.bio || 'No description provided',
  role: profile.application_data?.role || profile.role,
  yearsExperience: Number(profile.application_data?.years_experience || 0) || undefined,
  notes:
    profile.rejection_reason ||
    profile.application_data?.rejection_reason ||
    undefined,
  applicationData: profile.application_data || {},
});

export const getProfileTypeLabel = (type: string) => {
  switch (type) {
    case 'professional':
      return 'Professional';
    case 'service-provider':
      return 'Service Provider';
    case 'agency':
      return 'Agency';
    case 'estates':
      return 'Estates';
    default:
      return type;
  }
};

export const getTierLabel = (tier: string) =>
  tier.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatApplicationFieldLabel = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

