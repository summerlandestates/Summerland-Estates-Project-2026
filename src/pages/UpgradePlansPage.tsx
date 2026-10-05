import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getPlansByUserType, getPlanById } from '@/data/pricing';
import { getAddOnsByUserType } from '@/data/addons';
import { buildCheckoutDataFromMembership, formatTierLabel } from '@/lib/membership';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import type { PricingTier, UserType } from '@/types';

const profileTypeToUserType: Record<string, UserType> = {
  professional: 'professional',
  'service-provider': 'business',
  business: 'business',
  agency: 'agency',
  estates: 'estates',
};

export default function UpgradePlansPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name, phone, location, role, profile_type, tier, status, application_data')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        toast.error('Unable to load your membership', { description: error.message });
      }
      setProfile(data);
      setLoading(false);
    };

    load();
  }, [authLoading, user, navigate]);

  const userType: UserType = useMemo(() => {
    const raw = profile?.profile_type || profile?.role || user?.user_metadata?.profile_type || 'professional';
    return profileTypeToUserType[raw] || 'professional';
  }, [profile, user]);

  const currentTier = profile?.tier || user?.user_metadata?.tier || null;
  const currentPlan = currentTier ? getPlanById(currentTier as PricingTier) : null;
  const plans = useMemo(() => getPlansByUserType(userType), [userType]);
  const addOns = useMemo(() => getAddOnsByUserType(userType), [userType]);

  const baseCheckoutData = useMemo(
    () => buildCheckoutDataFromMembership(profile, user),
    [profile, user]
  );

  const handleSelectPlan = (planId: PricingTier) => {
    const plan = getPlanById(planId);
    if (!plan) return;

    const checkoutData = {
      ...(baseCheckoutData || {}),
      name: profile?.full_name || user?.user_metadata?.full_name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.application_data?.bio || '',
      profileType: profile?.profile_type || '',
      applicationData: profile?.application_data || {},
      selectedTier: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      password: '',
    };

    sessionStorage.setItem('checkoutDataDraft', JSON.stringify(checkoutData));
    navigate('/checkout', { state: { checkoutData } });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Upgrade Your Plan - Summerland Estates"
        description="Choose the plan that fits your membership."
        noIndex={true}
      />
      <NavBar currentPage="" />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8A8279] text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Membership Plans
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#2C2820] mb-3">
              Upgrade Your Plan
            </h1>
            <p className="text-[#6b665f] max-w-xl mx-auto">
              Choose the plan that fits your {userType === 'business' ? 'service provider' : userType}{' '}
              membership. Add-on features can be selected at checkout.
            </p>
            {currentPlan && (
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#9A9183]">
                <Shield className="w-4 h-4" />
                Current plan:
                <span className="font-semibold text-[#2C2820]">
                  {currentPlan.name}
                </span>
              </div>
            )}
          </div>

          {/* Plans */}
          <div
            className={`grid gap-6 mb-16 ${
              plans.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : plans.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {plans.map((plan) => {
              const isCurrent = plan.id === currentTier;
              const isFreeTier = plan.price === '$0' || plan.price === 'Complimentary';
              return (
                <Card
                  key={plan.id}
                  className={`relative border-[#E8E2D9] bg-white flex flex-col ${
                    isCurrent ? 'ring-2 ring-[#A89F91]' : 'hover:shadow-lg transition-shadow'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#A89F91] text-white border-0">Current Plan</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-heading font-semibold text-[#2C2820]">
                      {plan.name}
                    </h3>
                    <div className="mt-2 mb-5">
                      <span className="text-3xl font-bold text-[#2C2820]">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-[#9A9183]">{plan.period}</span>
                      )}
                    </div>
                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-[#5C554A]">
                          <Check className="w-4 h-4 text-[#A89F91] mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrent}
                      className={`mt-6 w-full ${
                        isCurrent
                          ? 'bg-[#F2EDE4] text-[#9A9183] cursor-default'
                          : 'bg-[#A89F91] hover:bg-[#8A8279] text-white'
                      }`}
                    >
                      {isCurrent
                        ? 'Your Plan'
                        : isFreeTier
                        ? 'Select Free Plan'
                        : 'Upgrade to This Plan'}
                      {!isCurrent && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add-ons */}
          {addOns.length > 0 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8A8279] text-sm font-medium mb-3">
                  <Sparkles className="w-4 h-4" />
                  Add-On Features
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#2C2820]">
                  Boost Your Membership
                </h2>
                <p className="text-sm text-[#9A9183] mt-2">
                  Available add-ons for your account type — select them during checkout.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addOns.map((addon) => (
                  <Card key={addon.id} className="border-[#E8E2D9] bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-[#2C2820] text-sm">{addon.name}</h3>
                        <span className="text-sm font-bold text-[#A89F91] whitespace-nowrap">
                          {addon.price}
                          <span className="text-xs font-normal text-[#9A9183]">
                            {addon.priceType === 'monthly'
                              ? '/mo'
                              : addon.priceType === 'per-item'
                              ? ' each'
                              : ''}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-[#9A9183] mt-2 leading-relaxed">
                        {addon.description}
                      </p>
                      {addon.badge && (
                        <Badge className="mt-3 bg-[#F2EDE4] text-[#5C554A] border-0 text-[10px]">
                          Badge: {addon.badge}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
