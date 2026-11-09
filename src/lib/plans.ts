// Canonical plan & pricing definition — the SINGLE source of truth for plans.
// Everything (pricing page, signup, account labels, upgrade prompts, metering)
// must read from here so plans can never drift apart.

export type PlanId = 'basic' | 'pro' | 'enterprise';

export interface PlanAllowances {
  /** Free uses per calendar month on the plan. null = unlimited. */
  newConversations: number | null;
  jobApplications: number | null;
  serviceBids: number | null;
  jobPosts: number | null;
  advancedSearch: number | null;
}

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  priceLabel: string;
  tagline: string;
  features: string[];
  allowances: PlanAllowances;
}

export const BILLING_NOTE =
  'Cancel anytime. No hidden fees. 7-day money-back guarantee on paid plans.';

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 0,
    priceLabel: 'Free',
    tagline: 'Everything you need to get started',
    features: [
      'Full profile in search — name, service, location & price',
      'Contact information visible to everyone',
      '1 photo',
      '2 new conversations per month',
      '2 job applications per month',
      '2 service-request bids per month',
      '2 job posts per month',
      '2 advanced search uses per month',
      'Save favorite profiles',
      'Standard calendar booking',
      'Standard support',
    ],
    allowances: {
      newConversations: 2,
      jobApplications: 2,
      serviceBids: 2,
      jobPosts: 2,
      advancedSearch: 2,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 6.99,
    priceLabel: '$6.99/month',
    tagline: 'For professionals and businesses that need more reach',
    features: [
      'Everything in Basic',
      'Priority placement in search results',
      'Unlimited photos',
      'Unlimited messaging',
      'Unlimited job applications',
      '15 service-request bids per month',
      'Unlimited job posts',
      'Advanced search filters included',
      'Advanced calendar booking',
      'Priority support',
      'Custom branding',
    ],
    allowances: {
      newConversations: null,
      jobApplications: null,
      serviceBids: 15,
      jobPosts: null,
      advancedSearch: null,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 9.99,
    priceLabel: '$9.99/month',
    tagline: 'For agencies, estates and teams at scale',
    features: [
      'Everything in Pro',
      'Featured listing',
      'Unlimited service-request bids',
      'Priority support + dedicated account manager',
      'Custom branding + white-label options',
      'Team management',
      'Advanced analytics',
      'API access',
    ],
    allowances: {
      newConversations: null,
      jobApplications: null,
      serviceBids: null,
      jobPosts: null,
      advancedSearch: null,
    },
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = {
  basic: PLANS[0],
  pro: PLANS[1],
  enterprise: PLANS[2],
};

// ─── Legacy tier mapping ──────────────────────────────────────────────────────
// The DB still stores legacy tier ids on profiles. Map every one of them onto
// the three canonical plans instead of changing stored data.

const BASIC_TIERS = new Set([
  'professional-basic',
  'professional-free',
  'professional-community',
  'business-free',
  'agency-free',
  'agency-community',
  'estates-free',
  'estates-community',
  'basic',
  'free',
]);

const ENTERPRISE_TIERS = new Set([
  'business-multi',
  'business-enterprise',
  'agency-pro',
  'estates-pro',
  'enterprise',
  'admin',
]);

const PRO_TIERS = new Set([
  'professional-pro',
  'professional-premium',
  'business-basic',
  'business-pro',
  'agency-basic',
  'agency-hiring',
  'estates-basic',
  'estates-hiring',
  'pro',
]);

export function normalizeTier(tier: string | null | undefined): PlanId {
  if (!tier) return 'basic';
  const t = tier.toLowerCase();
  if (ENTERPRISE_TIERS.has(t)) return 'enterprise';
  if (PRO_TIERS.has(t)) return 'pro';
  if (BASIC_TIERS.has(t)) return 'basic';
  // Unknown legacy ids default to basic so nothing gets over-promised.
  return 'basic';
}

export function getPlan(tier: string | null | undefined): Plan {
  return PLAN_BY_ID[normalizeTier(tier)];
}

export function getPlanLabel(tier: string | null | undefined): string {
  const plan = getPlan(tier);
  return `${plan.name} Member`;
}

// ─── Metered features ─────────────────────────────────────────────────────────

export type MeteredFeature = keyof PlanAllowances;

export const METERED_FEATURE_LABELS: Record<MeteredFeature, string> = {
  newConversations: 'new conversations',
  jobApplications: 'job applications',
  serviceBids: 'service-request bids',
  jobPosts: 'job posts',
  advancedSearch: 'advanced search filters',
};
