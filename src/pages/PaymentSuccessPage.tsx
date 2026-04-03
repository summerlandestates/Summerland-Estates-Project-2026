import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import type { CheckoutData } from '../types';
import { buildCheckoutDataFromMembership } from '@/lib/membership';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const MAX_RETRIES = 3;

function isSupabaseConnectionIssue(error: unknown) {
  const message = String((error as { message?: string })?.message || error || '');
  return /failed to fetch|network|name_not_resolved|dns|load failed/i.test(message);
}

function getSupabaseConnectionMessage() {
  return `Unable to reach the configured Supabase project at ${supabaseUrl || 'VITE_SUPABASE_URL'}. Please verify the URL/DNS in your .env file.`;
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  const clearStoredCheckout = () => {
    sessionStorage.removeItem('checkoutData');
    sessionStorage.removeItem('checkoutDataDraft');
  };

  const createLegacyPaidAccount = useCallback(
    async (data: CheckoutData) => {
      const accountPassword =
        data.password ||
        Math.random().toString(36).slice(-12) +
          Math.random().toString(36).slice(-12).toUpperCase() +
          '!@#';

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: accountPassword,
        options: {
          data: {
            full_name: data.name,
            account_status: 'pending',
            payment_status: 'paid',
            phone: data.phone || null,
            location: data.location || null,
            role: data.role || null,
            bio: data.bio || null,
            profile_type: data.profileType,
            tier: data.selectedTier,
            application_data: {
              ...data.applicationData,
              account_status: 'pending',
              payment_status: 'paid',
              profile_type: data.profileType,
              selected_tier: data.selectedTier,
              payment_completed_at: new Date().toISOString(),
            },
          },
        },
      });

      if (signUpError) {
        if (signUpError.message?.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw signUpError;
      }

      if (authData.user) {
        const roleMapping: Record<string, string> = {
          professional: 'professional',
          'service-provider': 'business',
          agency: 'agency',
          estates: 'estates',
        };
        const dbRole = roleMapping[data.profileType] || data.role || 'professional';
        const profileApplicationData = {
          ...data.applicationData,
          account_status: 'pending',
          rejection_reason: null,
          payment_status: 'paid',
          payment_completed_at: new Date().toISOString(),
          profile_type: data.profileType,
          selected_tier: data.selectedTier,
        };

        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: data.email,
          full_name: data.name,
          role: dbRole,
          phone: data.phone,
          location: data.location,
          profile_type: data.profileType,
          tier: data.selectedTier,
          application_data: profileApplicationData,
        });
      }

      await supabase.auth.signOut();
      clearStoredCheckout();
      setSuccess(true);
      setProcessing(false);

      toast.success('Payment received', {
        description: 'Your registration has been paid and is now pending admin approval.',
      });

      setTimeout(() => {
        navigate('/registration-pending', {
          state: {
            name: data.name,
            email: data.email,
            requiresPayment: false,
          },
        });
      }, 1200);
    },
    [navigate]
  );

  const markApprovedMembershipPaid = useCallback(
    async (storedCheckoutData?: CheckoutData | null) => {
      if (!user) {
        throw new Error('Unable to confirm the approved member account for this payment.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name, phone, location, role, profile_type, tier, application_data')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const resolvedCheckoutData = storedCheckoutData || buildCheckoutDataFromMembership(profile, user);

      if (!resolvedCheckoutData) {
        throw new Error('Unable to determine the approved membership details for this payment.');
      }

      const updatedApplicationData = {
        ...(profile?.application_data || {}),
        ...resolvedCheckoutData.applicationData,
        account_status: 'approved',
        payment_status: 'paid',
        payment_completed_at: new Date().toISOString(),
        selected_tier: resolvedCheckoutData.selectedTier,
        profile_type: resolvedCheckoutData.profileType,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tier: resolvedCheckoutData.selectedTier,
          profile_type: resolvedCheckoutData.profileType || profile?.profile_type,
          application_data: updatedApplicationData,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      clearStoredCheckout();
      setSuccess(true);
      setProcessing(false);

      toast.success('Membership activated', {
        description: 'Your payment has been received and your approved membership is now active.',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    },
    [navigate, user]
  );

  const processPaymentSuccess = useCallback(
    async (retry = 0) => {
      setProcessing(true);
      setError(null);
      setRetryCount(retry);

      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          toast.error('Invalid payment session');
          navigate(user ? '/dashboard' : '/add-listing');
          return;
        }

        const storedCheckoutData = sessionStorage.getItem('checkoutData');
        const parsedCheckoutData = storedCheckoutData ? (JSON.parse(storedCheckoutData) as CheckoutData) : null;
        setCheckoutData(parsedCheckoutData);

        if (user) {
          await markApprovedMembershipPaid(parsedCheckoutData);
          return;
        }

        if (!parsedCheckoutData) {
          throw new Error('Checkout data not found. Please sign in and complete payment again.');
        }

        await createLegacyPaidAccount(parsedCheckoutData);
      } catch (err: any) {
        console.error('Payment success handling error:', err);

        const isNetworkError =
          err.message?.includes('fetch') ||
          err.message?.includes('network') ||
          err.message?.includes('timeout') ||
          err.message?.includes('Unable to connect');

        if (isNetworkError && retry < MAX_RETRIES) {
          toast.info(`Connection issue. Retrying... (${retry + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            processPaymentSuccess(retry + 1);
          }, 2000 * (retry + 1));
          return;
        }

        setProcessing(false);
        setError(
          isSupabaseConnectionIssue(err)
            ? getSupabaseConnectionMessage()
            : err.message || 'An unexpected error occurred. Please try again.'
        );

        toast.error('Payment Confirmation Failed', {
          description: isSupabaseConnectionIssue(err)
            ? getSupabaseConnectionMessage()
            : err.message || 'Please contact support',
        });
      }
    },
    [createLegacyPaidAccount, markApprovedMembershipPaid, navigate, searchParams, user]
  );

  useEffect(() => {
    if (authLoading) return;
    processPaymentSuccess();
  }, [authLoading, processPaymentSuccess]);

  const handleRetry = () => {
    processPaymentSuccess(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentPage="payment-success" />

      <main className="pt-48 pb-32">
        <div className="container mx-auto px-12 max-w-2xl">
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              {processing ? (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-[#D97706] mx-auto mb-6" />
                  <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                    Processing Payment...
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Please wait while we create your account
                  </p>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                    Membership Confirmed
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    Thank you for supporting the integrity of the network.
                  </p>
                  <p className="text-gray-500 text-base mb-8">
                    Your access reflects a shared commitment to discretion, professionalism, and trust.
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 text-lg rounded-xl"
                  >
                    Proceed to Private Access
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                    Something Went Wrong
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {error || 'Please contact support for assistance'}
                  </p>
                  {error?.includes('connect') || error?.includes('network') || error?.includes('fetch') ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <p className="text-amber-800 text-sm">
                        <strong>Tip:</strong> Your payment was successful! This is just a temporary connection issue. 
                        Please try again or contact support with your payment confirmation.
                      </p>
                    </div>
                  ) : null}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleRetry}
                      className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 text-lg"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
                    >
                      Go to Homepage
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-6">
                    If the problem persists, please contact support at support@summerlandestates.com
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
