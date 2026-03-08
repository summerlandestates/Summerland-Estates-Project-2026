import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Home, RefreshCw, AlertCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      toast.error('Invalid payment session');
      navigate('/add-listing');
      return;
    }

    // Get checkout data from sessionStorage
    const checkoutDataStr = sessionStorage.getItem('checkoutData');
    if (!checkoutDataStr) {
      toast.error('Checkout data not found');
      navigate('/add-listing');
      return;
    }

    const parsedData = JSON.parse(checkoutDataStr);
    setCheckoutData(parsedData);

    // Create account after successful payment
    createAccount(parsedData);
  }, [searchParams, navigate]);

  const createAccount = useCallback(async (data: any, retry = 0) => {
    setProcessing(true);
    setError(null);
    setRetryCount(retry);

    try {
      // Check if Supabase is reachable first
      const healthCheck = await Promise.race([
        supabase.from('profiles').select('count').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
      ]).catch(() => null);

      if (!healthCheck) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

      // Generate a random password (user will reset via email)
      const randomPassword = Math.random().toString(36).slice(-12) + 
                            Math.random().toString(36).slice(-12).toUpperCase() + 
                            '!@#';

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: randomPassword,
        options: {
          data: {
            full_name: data.name,
            profile_type: data.profileType,
            tier: data.selectedTier,
          },
        },
      });

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message?.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw signUpError;
      }

      // Create profile entry
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.name,
            phone: data.phone,
            location: data.location,
            bio: data.bio,
            role: data.role || null,
            profile_type: data.profileType,
            tier: data.selectedTier,
            email_verified: false,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw - auth user was created, profile can be created later
        }
      }

      // Clear checkout data
      sessionStorage.removeItem('checkoutData');

      setSuccess(true);
      setProcessing(false);

      toast.success('Payment Successful!', {
        description: 'Your account has been created. Check your email for verification.',
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Account creation error:', err);
      
      // Check if it's a network error and we can retry
      const isNetworkError = err.message?.includes('fetch') || 
                             err.message?.includes('network') ||
                             err.message?.includes('timeout') ||
                             err.message?.includes('Unable to connect');
      
      if (isNetworkError && retry < MAX_RETRIES) {
        // Auto-retry after a delay
        toast.info(`Connection issue. Retrying... (${retry + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          createAccount(data, retry + 1);
        }, 2000 * (retry + 1)); // Exponential backoff
        return;
      }

      setProcessing(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      
      toast.error('Account Creation Failed', {
        description: err.message || 'Please contact support',
      });
    }
  }, [navigate]);

  const handleRetry = () => {
    if (checkoutData) {
      createAccount(checkoutData, 0);
    }
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
