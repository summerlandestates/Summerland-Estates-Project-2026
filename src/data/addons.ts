// Add-on features available for purchase
// These are available when users go to pay for their profile and checkout

export interface AddOnFeature {
  id: string;
  name: string;
  description: string;
  price: string;
  priceType: 'one-time' | 'monthly' | 'per-item';
  availableFor: ('professional' | 'business' | 'agency' | 'estates')[];
  badge?: string;
}

export const addOnFeatures: AddOnFeature[] = [
  // Background Check
  {
    id: 'background-check',
    name: 'Background Check',
    description: 'Get a verified background check badge on your profile that says "Background Check Available"',
    price: '$29',
    priceType: 'one-time',
    availableFor: ['professional', 'business', 'agency', 'estates'],
    badge: 'Background Check Available'
  },
  
  // Verification
  {
    id: 'verification',
    name: 'Verification',
    description: 'Get a verified checkmark next to your name on your profile',
    price: '$2.99',
    priceType: 'one-time',
    availableFor: ['professional'],
    badge: 'Verified'
  },
  {
    id: 'verification-business',
    name: 'Verification',
    description: 'Get a verified checkmark next to your name on your profile',
    price: '$4.99',
    priceType: 'one-time',
    availableFor: ['business', 'agency', 'estates'],
    badge: 'Verified'
  },
  
  // Community Forums Access
  {
    id: 'community-forums',
    name: 'Community Forums Access',
    description: 'Access to exclusive community forums and discussions',
    price: '$2.99',
    priceType: 'monthly',
    availableFor: ['professional', 'business', 'agency', 'estates']
  },
  
  // Profile Analytics
  {
    id: 'profile-analytics',
    name: 'Profile Analytics',
    description: 'See who\'s viewed your profile and who\'s opened your application/resume',
    price: '$1.99',
    priceType: 'one-time',
    availableFor: ['professional']
  },
  {
    id: 'profile-analytics-business',
    name: 'Profile Analytics',
    description: 'See who\'s viewed your profile and engagement metrics',
    price: '$4.99',
    priceType: 'one-time',
    availableFor: ['business', 'agency', 'estates']
  },
  
  // Priority Listing
  {
    id: 'priority-listing',
    name: 'Priority Listing',
    description: 'Appear in top 5 search results for your title and city (limited spots available)',
    price: '$6.99',
    priceType: 'monthly',
    availableFor: ['professional']
  },
  {
    id: 'priority-listing-business',
    name: 'Priority Listing',
    description: 'Appear in top 5 search results for your service type and city',
    price: '$15.99',
    priceType: 'monthly',
    availableFor: ['business']
  },
  {
    id: 'priority-listing-agency',
    name: 'Priority Listing',
    description: 'Appear in top search results',
    price: '$19.99',
    priceType: 'monthly',
    availableFor: ['agency', 'estates']
  },
  
  // Featured on Home Page
  {
    id: 'featured-homepage',
    name: 'Featured on Home Page',
    description: 'Get your profile featured on the home page for maximum visibility',
    price: '$9.99',
    priceType: 'monthly',
    availableFor: ['professional']
  },
  {
    id: 'featured-homepage-business',
    name: 'Featured on Home Page',
    description: 'Get your business featured on the home page',
    price: '$15.99',
    priceType: 'monthly',
    availableFor: ['business']
  },
  {
    id: 'featured-homepage-agency',
    name: 'Featured on Home Page',
    description: 'Get your agency/estate featured on the home page',
    price: '$19.99',
    priceType: 'monthly',
    availableFor: ['agency', 'estates']
  },
  
  // Articles
  {
    id: 'article-professional',
    name: 'Publish an Article',
    description: 'Write and publish an article to showcase your expertise',
    price: '$4.99',
    priceType: 'per-item',
    availableFor: ['professional']
  },
  {
    id: 'article-business',
    name: 'Publish an Article',
    description: 'Write and publish an article about your services',
    price: '$9.99',
    priceType: 'per-item',
    availableFor: ['business']
  },
  {
    id: 'article-agency',
    name: 'Publish an Article',
    description: 'Write and publish an article',
    price: '$14.99',
    priceType: 'per-item',
    availableFor: ['agency', 'estates']
  },
  
  // Privacy Options
  {
    id: 'privacy-blur',
    name: 'Private/Blurred Profile',
    description: 'Make your name or photo private/blurred, only visible to hiring managers/agencies',
    price: '$1.99',
    priceType: 'one-time',
    availableFor: ['professional']
  },
  {
    id: 'privacy-blur-agency',
    name: 'Private/Blurred Profile',
    description: 'Make your name or photo private/blurred',
    price: '$4.99',
    priceType: 'one-time',
    availableFor: ['agency', 'estates']
  },
  
  // Marketing Add-ons
  {
    id: 'instagram-boost',
    name: 'Boost on Instagram',
    description: 'Get your profile/post boosted on our Instagram account',
    price: '$24.99',
    priceType: 'per-item',
    availableFor: ['professional']
  },
  {
    id: 'instagram-boost-business',
    name: 'Boost on Instagram',
    description: 'Get your business boosted on our Instagram account',
    price: '$34.99',
    priceType: 'per-item',
    availableFor: ['business', 'agency', 'estates']
  },
  {
    id: 'email-blast',
    name: 'Email Blast',
    description: 'Send an email blast to our contact list',
    price: '$12.99',
    priceType: 'per-item',
    availableFor: ['professional']
  },
  {
    id: 'email-blast-business',
    name: 'Email Blast',
    description: 'Send an email blast to our contact list',
    price: '$13.99',
    priceType: 'per-item',
    availableFor: ['business']
  },
  {
    id: 'email-blast-agency',
    name: 'Email Blast',
    description: 'Send an email blast to our contact list',
    price: '$19.99',
    priceType: 'per-item',
    availableFor: ['agency', 'estates']
  },
  {
    id: 'newsletter',
    name: 'Weekly Newsletter Feature',
    description: 'Get featured in our weekly newsletter',
    price: '$9.99',
    priceType: 'per-item',
    availableFor: ['professional', 'business', 'agency', 'estates']
  },
  
  // Business-specific Add-ons
  {
    id: 'service-area-expansion',
    name: 'Service Area Expansion',
    description: 'Expand your service area to additional locations',
    price: '$9.99',
    priceType: 'monthly',
    availableFor: ['business']
  },
  {
    id: 'license-verification',
    name: 'Background/License Verification',
    description: 'Get your business license and credentials verified',
    price: '$9.99',
    priceType: 'one-time',
    availableFor: ['business']
  }
];

// Get add-ons available for a specific user type
export function getAddOnsByUserType(userType: 'professional' | 'business' | 'agency' | 'estates'): AddOnFeature[] {
  return addOnFeatures.filter(addon => addon.availableFor.includes(userType));
}

// Get a specific add-on by ID
export function getAddOnById(id: string): AddOnFeature | undefined {
  return addOnFeatures.find(addon => addon.id === id);
}
