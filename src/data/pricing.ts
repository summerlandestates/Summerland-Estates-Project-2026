import type { PricingPlan, UserType } from '../types';

export const pricingPlans: PricingPlan[] = [
  // Professional Plans
  {
    id: 'professional-basic',
    name: 'Basic Plan',
    price: '$0',
    period: '/month',
    features: [
      'Limited Profile Visibility to Hiring Managers',
      'Unlimited Open Role searches',
      'Unlimited Messaging',
      'Multiple Photos & Videos',
      'Calendar, Booking, Interviews',
      'Networking',
      'Apply to 5 Open Roles a month',
      'Bid on 2 Service Requests',
      'Optional Feature Add-Ons'
    ],
    userType: 'professional'
  },
  {
    id: 'professional-pro',
    name: 'Pro Plan',
    price: '$1.99',
    period: '/month',
    features: [
      'Access to Jobs first',
      'Apply to Jobs first',
      'Get sent jobs that match your resume',
      'Notifications',
      'Analytics - who\'s viewed my profile',
      'Community Access',
      'Add 1 Article',
      'Unlimited Profile Visibility',
      'Unlimited Applications',
      'Unlimited Bidding',
      'Download 4 Templates',
      'Optional Feature Add-Ons'
    ],
    userType: 'professional'
  },

  // Service Provider / Business Plans
  {
    id: 'business-free',
    name: 'Free / Basic',
    price: '$0',
    period: '/month',
    features: [
      'Business name & services',
      'Location & contact info',
      'Upload 1 photo',
      'Limited search visibility',
      'View 1 service request',
      'Limited inquiries & responses',
      'Calendar, Booking',
      'Networking',
      'Optional Feature Add-Ons'
    ],
    userType: 'business'
  },
  {
    id: 'business-pro',
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: [
      'One Location',
      'Notifications',
      'Analytics - who\'s viewed my profile',
      'Community Access',
      'Add 1 Article',
      'Unlimited Profile Visibility',
      'Unlimited Messaging',
      'Multiple Photos & Videos',
      'Calendar, Booking, Interviews',
      'Add 1 job posting/month',
      'Bid on 4 jobs/month',
      'Optional Feature Add-Ons'
    ],
    userType: 'business'
  },
  {
    id: 'business-enterprise',
    name: 'Enterprise / Multi-Location',
    price: '$14.99',
    period: '/month',
    features: [
      'Notifications',
      'Analytics - who\'s viewed my profile',
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

  // Agency Owner / Recruiter Plans
  {
    id: 'agency-free',
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      'View 2 profiles (limited info)',
      'No messaging',
      'Public profile',
      '1 city/service location'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-basic',
    name: 'Basic',
    price: '$12.99',
    period: '/month',
    features: [
      'Unlimited view of candidates (limited info)',
      'Message 5 professionals',
      'Post 1 role',
      'Post 1 Service Request',
      '1 city/service location',
      'Pay $199 per hire'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-hiring',
    name: 'Hiring',
    price: '$19.99',
    period: '/month',
    features: [
      'Unlimited view of candidates (limited info)',
      'Contact 25 professionals',
      'Post 8 roles',
      'Community Access',
      'Post 5 Service Requests',
      '4 city/service locations',
      'Pay $129 per hire'
    ],
    userType: 'agency'
  },
  {
    id: 'agency-pro',
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    features: [
      'Unlimited view of candidates (limited info)',
      'Unlimited outreach',
      'Unlimited job posts',
      'Verification credits included',
      'Community Access',
      'Unlimited templates',
      'Unlimited Service Requests',
      'Unlimited service locations',
      'Pay $99 per hire'
    ],
    userType: 'agency'
  },

  // Estates Plans
  {
    id: 'estates-free',
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      'View 2 profiles (limited info)',
      'No messaging',
      'Public profile'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-basic',
    name: 'Basic',
    price: '$14.99',
    period: '/month',
    features: [
      'Unlimited view of candidates (limited info)',
      'Message 5 professionals',
      'Post 1 role',
      'Post 1 Service Request',
      'Download 4 templates',
      'Pay $199 per hire'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-hiring',
    name: 'Hiring',
    price: '$24.99',
    period: '/month',
    features: [
      'Unlimited view of candidates (limited info)',
      'Contact 25 professionals',
      'Post 10 roles',
      'Community Access',
      'Post 5 Service Requests',
      'Download 5 Templates',
      'Pay $199 per hire'
    ],
    userType: 'estates'
  },
  {
    id: 'estates-pro',
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    features: [
      'Unlimited view of candidates (limited info)',
      'Unlimited outreach',
      'Unlimited job posts',
      'Verification credits included',
      'Community Access',
      'Unlimited templates',
      'Unlimited Service Requests',
      'Download 8 Templates',
      'Pay $199 per hire'
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
