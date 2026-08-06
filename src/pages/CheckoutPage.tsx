import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, CreditCard, Shield, BadgeCheck, Star, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { CheckoutData } from '../types';
import {
  buildCheckoutDataFromMembership,
  getAccountStatus,
  getPaymentStatus,
  requiresMembershipPayment,
} from '@/lib/membership';
import { validateAndRedeemPromoCode } from '@/lib/membershipApplication';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

function isSupabaseConnectionIssue(error: unknown) {
  const message = String((error as { message?: string })?.message || error || '');
  return /failed to fetch|network|name_not_resolved|dns|load failed/i.test(message);
}

function getSupabaseConnectionMessage() {
  return `Unable to reach the configured Supabase project at ${supabaseUrl || 'VITE_SUPABASE_URL'}. Please verify the URL/DNS in your .env file.`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [checkoutContext, setCheckoutContext] = useState<'application' | 'approval'>('application');
  
  // Additional Features state
  const [addBackgroundCheck, setAddBackgroundCheck] = useState(false);
  const [addVerificationBadge, setAddVerificationBadge] = useState(false);
  const [addPriorityListing, setAddPriorityListing] = useState(false);
  
  // Pricing for additional features
  const additionalFeatures = {
    backgroundCheck: { price: 49.99, label: 'Background Check', description: 'Verified background check badge on your profile' },
    verificationBadge: { price: 29.99, label: 'Verification Badge', description: 'Premium verified checkmark next to your name' },
    priorityListing: { price: 19.99, label: 'Priority Listing', description: 'Appear at the top of search results for 30 days' },
  };
  
  const calculateTotal = () => {
    if (!checkoutData) return 0;
    let total = parseFloat(checkoutData.planPrice.replace(/[^0-9.]/g, '')) || 0;
    if (addBackgroundCheck) total += additionalFeatures.backgroundCheck.price;
    if (addVerificationBadge) total += additionalFeatures.verificationBadge.price;
    if (addPriorityListing) total += additionalFeatures.priorityListing.price;
    return total;
  };

  useEffect(() => {
    if (authLoading) return;

    const initializeCheckout = async () => {
      if (location.state?.checkoutData) {
        setCheckoutContext(user ? 'approval' : 'application');
        setCheckoutData(location.state.checkoutData);
        return;
      }

      const savedCheckoutData = sessionStorage.getItem('checkoutDataDraft');
      if (savedCheckoutData) {
        setCheckoutContext(user ? 'approval' : 'application');
        setCheckoutData(JSON.parse(savedCheckoutData));
        return;
      }

      if (!user) {
        toast.error('No checkout data found');
        navigate('/add-listing');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email, full_name, phone, location, role, profile_type, tier, status, application_data')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        toast.error('Unable to load membership checkout', {
          description: error.message,
        });
        navigate('/dashboard');
        return;
      }

      const accountStatus = getAccountStatus(profile, user);
      if (accountStatus !== 'approved') {
        navigate(accountStatus === 'pending' ? '/registration-pending' : '/dashboard');
        return;
      }

      if (!requiresMembershipPayment(profile, user)) {
        toast.info('Membership payment is not required for this account.');
        navigate('/dashboard');
        return;
      }

      const derivedCheckoutData = buildCheckoutDataFromMembership(profile, user);

      if (!derivedCheckoutData) {
        toast.error('Membership selection not found for this account.');
        navigate('/dashboard');
        return;
      }

      setCheckoutContext('approval');
      setCheckoutData(derivedCheckoutData);
    };

    initializeCheckout();
  }, [authLoading, location.state, navigate, user]);

  const handleCreateAccount = async () => {
    if (!checkoutData) return;

    setLoading(true);

    try {
      const isFree = checkoutData.selectedTier.includes('free') || checkoutData.selectedTier.includes('community') || checkoutData.planPrice === '$0' || !!checkoutData.promoCode;

      if (isFree) {
        sessionStorage.removeItem('checkoutData');
        sessionStorage.removeItem('checkoutDataDraft');

        if (user) {
          if (checkoutData.promoCode) {
            const promoResult = await validateAndRedeemPromoCode(checkoutData.promoCode, user.id);
            if (promoResult.valid) {
              const expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
              await supabase.from('profiles').update({
                tier: promoResult.tier || checkoutData.selectedTier,
                subscription_status: 'active',
                subscription_expires_at: expiresAt,
              }).eq('id', user.id);
              toast.success('Promo code applied', { description: 'Your profile has been upgraded to Pro for 6 months.' });
            } else {
              toast.error('Promo code failed', { description: promoResult.error || 'Could not apply promo code' });
            }
          } else {
            toast.success('No payment required', {
              description: 'Your current membership selection does not require checkout.',
            });
          }
          navigate('/dashboard');
          return;
        }

        toast.info('Applications are now submitted directly from the Apply page.');
        navigate('/add-listing');
        return;
      }

      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      const priceAmount = checkoutData.planPrice.replace(/[^0-9.]/g, '');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceAmount,
          email: checkoutData.email,
          metadata: {
            userId: user?.id || null,
            checkoutContext,
            paymentStatus: getPaymentStatus(null, user || null),
            name: checkoutData.name,
            phone: checkoutData.phone,
            location: checkoutData.location,
            role: checkoutData.role,
            bio: checkoutData.bio,
            profileType: checkoutData.profileType,
            selectedTier: checkoutData.selectedTier,
            planName: checkoutData.planName,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create checkout session: ${errorData}`);
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned from Stripe');
      }
    } catch (error: any) {
      console.error('Account creation/payment error:', error);
      
      let errorMessage = 'Please try again';
      if (isSupabaseConnectionIssue(error)) {
        errorMessage = getSupabaseConnectionMessage();
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      toast.error('Error', {
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  const isFree = checkoutData.selectedTier.includes('free') || 
                 checkoutData.selectedTier.includes('community');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentPage="checkout" />

      <main className="pt-48 pb-32">
        <div className="container mx-auto px-12 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              {checkoutContext === 'approval' ? 'Complete Membership Payment' : isFree ? 'Complete Registration' : 'Complete Payment'}
            </h1>
            <p className="text-xl text-gray-600">
              {checkoutContext === 'approval'
                ? 'Your application has been approved. Review your selected membership and complete payment to activate access.'
                : isFree
                ? 'Review your information and create your account'
                : 'Review your order and complete payment'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <Card className="lg:col-span-1 border-gray-200 h-fit">
              <CardHeader>
                <CardTitle className="text-gray-900">Order Summary</CardTitle>
                <CardDescription className="text-gray-600">Your selected plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium text-gray-900">{checkoutData.planName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profile Type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {checkoutData.profileType.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Additional Features */}
                {!isFree && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add-On Features
                    </h4>
                    <div className="space-y-3">
                      {/* Background Check */}
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          addBackgroundCheck 
                            ? 'border-[#A89F91] bg-[#A89F91]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setAddBackgroundCheck(!addBackgroundCheck)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={addBackgroundCheck}
                            onCheckedChange={(checked) => setAddBackgroundCheck(!!checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {additionalFeatures.backgroundCheck.label}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-[#A89F91]">
                                +${additionalFeatures.backgroundCheck.price}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {additionalFeatures.backgroundCheck.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Badge */}
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          addVerificationBadge 
                            ? 'border-[#A89F91] bg-[#A89F91]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setAddVerificationBadge(!addVerificationBadge)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={addVerificationBadge}
                            onCheckedChange={(checked) => setAddVerificationBadge(!!checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-[#A89F91]" />
                                <span className="text-sm font-medium text-gray-900">
                                  {additionalFeatures.verificationBadge.label}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-[#A89F91]">
                                +${additionalFeatures.verificationBadge.price}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {additionalFeatures.verificationBadge.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Priority Listing */}
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          addPriorityListing 
                            ? 'border-[#A89F91] bg-[#A89F91]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setAddPriorityListing(!addPriorityListing)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={addPriorityListing}
                            onCheckedChange={(checked) => setAddPriorityListing(!!checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {additionalFeatures.priorityListing.label}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-[#A89F91]">
                                +${additionalFeatures.priorityListing.price}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {additionalFeatures.priorityListing.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#A89F91]">
                      {isFree ? checkoutData.planPrice : `$${calculateTotal().toFixed(2)}`}
                    </span>
                  </div>
                  {(addBackgroundCheck || addVerificationBadge || addPriorityListing) && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Base plan:</span>
                        <span>{checkoutData.planPrice}</span>
                      </div>
                      {addBackgroundCheck && (
                        <div className="flex justify-between">
                          <span>Background Check:</span>
                          <span>+${additionalFeatures.backgroundCheck.price}</span>
                        </div>
                      )}
                      {addVerificationBadge && (
                        <div className="flex justify-between">
                          <span>Verification Badge:</span>
                          <span>+${additionalFeatures.verificationBadge.price}</span>
                        </div>
                      )}
                      {addPriorityListing && (
                        <div className="flex justify-between">
                          <span>Priority Listing:</span>
                          <span>+${additionalFeatures.priorityListing.price}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isFree && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">No payment required</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="lg:col-span-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Account Details</CardTitle>
                <CardDescription className="text-gray-600">
                  {checkoutContext === 'approval'
                    ? 'Review your approved application details before proceeding to payment'
                    : `Review your information before ${isFree ? 'creating account' : 'proceeding to payment'}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900 mt-1">{checkoutData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 mt-1">{checkoutData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900 mt-1">{checkoutData.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900 mt-1">{checkoutData.location}</p>
                  </div>
                  {checkoutData.role && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Role/Title</label>
                      <p className="text-gray-900 mt-1">{checkoutData.role}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <p className="text-gray-900 mt-1 text-sm">{checkoutData.bio}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 space-y-4">
                  {isFree ? (
                    <Button
                      onClick={handleCreateAccount}
                      disabled={loading}
                      className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white py-6 text-lg rounded-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateAccount}
                      disabled={loading}
                      className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white py-6 text-lg rounded-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          {checkoutContext === 'approval' ? 'Activate Membership' : 'Proceed to Payment'}
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => navigate('/add-listing')}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back to Form
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
