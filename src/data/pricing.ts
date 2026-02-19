import type { PricingPlan, UserType } from '../types';

export const pricingPlans: PricingPlan[] = [
  // Professional Plans - Completely FREE with unlimited access
  {
    id: 'professional-free',
    name: 'Free',
    price: '$0',
    features: [
      'Unlimited photos',
      'Unlimited placements',
      'Unlimited messaging',
      'Full profile access',
      'Interview request tool',
      'Community access',
      'Notifications',
      'All features included'
    ],
    userType: 'professional'
  },

  // Business Plans
  {
    id: 'business-free',
    name: 'Free',
    price: '$0',
    features: [
      'Public business profile (1 photo)',
      'View 1 service request',
      '1 message to 2 profiles'
    ],
    userType: 'business'
  },
  {
    id: 'business-pro',
    name: 'Pro',
    price: '$3.99',
    period: '/month',
    features: [
      'Unlimited messaging',
      'Enhanced profile',
      'Booking request tool',
      'Bidding on service requests',
      'Notifications'
    ],
    userType: 'business'
  },
  {
    id: 'business-multi',
    name: 'Multi-Location',
    price: '$5.99',
    period: '/month',
    features: [
      'Multiple locations',
      'Unlimited messaging',
      'Enhanced profile',
      'Booking request tool',
      'Bidding',
      'Notifications'
    ],
    userType: 'business'
  },

  // Agency Plans
  {
    id: 'agency-free',
    name: 'Free',
    price: '$0',
    features: [
      'Public profile',
      'View limited candidates per search (blurred)'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-basic',
    name: 'Basic',
    price: '$19.99',
    period: '/month',
    features: [
      'View 6 candidates per search',
      'Message 3 professionals',
      'Interview 3 candidates',
      'Post 1 role'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-hiring',
    name: 'Hiring',
    price: '$39.99',
    period: '/month',
    features: [
      'Message 12 professionals',
      'Interview 12 candidates',
      'Post 4 roles',
      'Comparisons and notifications'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-pro',
    name: 'Pro',
    price: '$59.99',
    period: '/month',
    features: [
      'Unlimited outreach',
      'Unlimited role posting',
      'Verification credits'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-community',
    name: 'Just Join the Community',
    price: '$3.99',
    period: '/month',
    features: [
      'Community access only',
      'No hiring tools',
      'No messaging',
      'No posting tools'
    ],
    userType: 'agency'
  },

  // Estates Plans
  {
    id: 'estates-free',
    name: 'Free',
    price: '$0',
    features: [
      'Public profile',
      'View limited candidates per search (blurred)'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-basic',
    name: 'Basic',
    price: '$39.99',
    period: '/month',
    features: [
      'Message 3 professionals',
      'Interview 3 candidates',
      'Post 1 role and 1 service request'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-hiring',
    name: 'Hiring',
    price: '$59.99',
    period: '/month',
    features: [
      'Message 12 professionals',
      'Interview 12 candidates',
      'Post 4 roles and 4 service requests'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-pro',
    name: 'Pro',
    price: '$79.99',
    period: '/month',
    features: [
      'Unlimited outreach',
      'Unlimited role and service requests',
      'Community tools'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-community',
    name: 'Just Join the Community',
    price: '$3.99',
    period: '/month',
    features: [
      'Community access only',
      'No hiring tools',
      'No messaging',
      'No posting tools'
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
