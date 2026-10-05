import type { PricingPlan, PricingTier, UserType } from '../types';

export const pricingPlans: PricingPlan[] = [
  // Professional Plans
  {
    id: 'professional-basic',
    name: 'Basic Plan',
    price: 'Complimentary',
    period: '',
    features: [
      'Profile Visibility Limited',
      'Unlimited Open Role Searches',
      'Unlimited Messaging',
      'Multiple Photos & Videos',
      'Calendar, Booking, Interviews',
      'Networking',
      'Apply to 5 Open Roles/Month',
      'Bid on 2 Service Requests/Month',
      'Optional Feature Add-Ons'
    ],
    userType: 'professional'
  },
  {
    id: 'professional-pro',
    name: 'Pro Plan',
    price: '$0.99',
    period: '/month',
    features: [
      'Get Sent Jobs That Match Your Resume',
      'Notifications Sent via Text or Email',
      'Analytics - Who\'s Viewed My Profile',
      'Community Access',
      'Add 5 Articles',
      'Unlimited Profile Visibility to Hiring Managers',
      'Unlimited Applications',
      'Unlimited Bidding',
      'Optional Feature Add-Ons'
    ],
    userType: 'professional'
  },

  // Service Provider / Business Plans
  {
    id: 'business-free',
    name: 'Basic Plan',
    price: 'Complimentary',
    period: '',
    features: [
      'Business Name & Services',
      'Location & Contact Information',
      'Upload 1 Photo',
      'Limited Profile Visibility',
      'View and Bid on 2 Service Requests/Month',
      'Limited Messaging',
      'Calendar, Booking',
      'Networking',
      'Optional Feature Add-Ons'
    ],
    userType: 'business'
  },
  {
    id: 'business-pro',
    name: 'Pro',
    price: '$6.99',
    period: '/month',
    features: [
      'One Service Location',
      'Notifications',
      'Analytics - Who\'s Viewed My Profile',
      'Community Access',
      'Add 1 Article',
      'Unlimited Profile Visibility',
      'Unlimited Messaging',
      'Multiple Photos & Videos',
      'Calendar, Booking, Interviews',
      'Add 1 Job Posting/Month',
      'Bid on 4 Jobs/Month',
      'Optional Feature Add-Ons'
    ],
    userType: 'business'
  },
  {
    id: 'business-enterprise',
    name: 'Enterprise / Multi-Location',
    price: '$9.99',
    period: '/month',
    features: [
      'Notifications',
      'Analytics - Who\'s Viewed My Profile',
      'Community Access',
      'Add 1 Article',
      'Unlimited Profile Visibility',
      'Unlimited Messaging',
      'Multiple Photos & Videos',
      'Calendar, Booking, Interviews',
      'Unlimited Job Posting',
      'Unlimited Job Bidding',
      '3 Service Locations',
      'Optional Feature Add-Ons'
    ],
    userType: 'business'
  },

  // Agency / Recruiter Plans
  {
    id: 'agency-free',
    name: 'Basic',
    price: 'Complimentary',
    period: '',
    features: [
      'Search & View 3 Profiles/Month',
      'No Messaging',
      'Public Profile',
      '1 City/Service Location'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-basic',
    name: 'Pro',
    price: '$7.99',
    period: '/month',
    features: [
      'Unlimited Profile Searches',
      'Message 5 Profiles/Month',
      'Post 1 Open Role/Month',
      'Post 1 Service Request/Month',
      '1 City/Service Location'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-hiring',
    name: 'Elite',
    price: '$10.99',
    period: '/month',
    features: [
      'Unlimited Profile Searches',
      'Message 25 Profiles/Month',
      'Post 8 Open Roles/Month',
      'Community Access',
      'Post 5 Service Requests/Month',
      '4 City/Service Locations'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-pro',
    name: 'Enterprise',
    price: '$14.99',
    period: '/month',
    features: [
      'Unlimited Profile Searches',
      'Unlimited Outreach',
      'Unlimited Job Posts',
      'Community Access',
      'Unlimited Service Requests',
      'Unlimited Service Locations'
    ],
    userType: 'agency'
  },

  // Estates Plans
  {
    id: 'estates-free',
    name: 'Basic',
    price: 'Complimentary',
    period: '',
    features: [
      'Search & View 3 Profiles/Month',
      'No Messaging',
      'Public Profile'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-basic',
    name: 'Pro',
    price: '$7.99',
    period: '/month',
    features: [
      'Unlimited Profile Searches',
      'Message 5 Profiles/Month',
      'Post 1 Open Role/Month',
      'Post 1 Service Request/Month'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-hiring',
    name: 'Elite',
    price: '$10.99',
    period: '/month',
    features: [
      'Unlimited Profile Searches',
      'Message 25 Profiles/Month',
      'Post 10 Open Roles/Month',
      'Community Access',
      'Post 5 Service Requests/Month'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-pro',
    name: 'Enterprise',
    price: '$14.99',
    period: '/month',
    features: [
      'Unlimited Profile Searches',
      'Unlimited Outreach',
      'Unlimited Job Posts',
      'Community Access',
      'Unlimited Service Requests'
    ],
    userType: 'estates'
  }
];

export function getPlansByUserType(userType: UserType): PricingPlan[] {
  return pricingPlans.filter(plan => plan.userType === userType);
}

export function getPlanById(planId: PricingTier): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === planId);
}

export const freeTierByUserType: Record<UserType, PricingTier> = {
  professional: 'professional-basic',
  business: 'business-free',
  agency: 'agency-free',
  estates: 'estates-free',
};

export function getFreeTierForUserType(userType: UserType): PricingTier {
  return freeTierByUserType[userType] || `${userType}-free` as PricingTier;
}
