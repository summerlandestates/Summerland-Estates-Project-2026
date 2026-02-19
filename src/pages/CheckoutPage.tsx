import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role?: string;
  bio: string;
  profileType: string;
  selectedTier: string;
  planName: string;
  planPrice: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    // Get data from location state
    if (location.state?.checkoutData) {
      setCheckoutData(location.state.checkoutData);
    } else {
      toast.error('No checkout data found');
      navigate('/add-listing');
    }
  }, [location.state, navigate]);

  const handleCreateAccount = async () => {
    if (!checkoutData) return;

    setLoading(true);

    try {
      // Check if this is a free/community plan
      const isFree = checkoutData.selectedTier.includes('free') || 
                     checkoutData.selectedTier.includes('community');

      if (isFree) {
        // Map profile type to database role
        const roleMapping: { [key: string]: string } = {
          'professional': 'professional',
          'service-provider': 'business',
          'agency': 'agency',
          'estates': 'estates'
        };

        const dbRole = roleMapping[checkoutData.profileType] || 'professional';

        // Generate secure random password
        const randomPassword = 
          Math.random().toString(36).slice(-8) + 
          Math.random().toString(36).slice(-8).toUpperCase() + 
          '!@#$%' + 
          Math.floor(Math.random() * 1000);

        // Create auth user (skip email confirmation)
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: checkoutData.email,
          password: randomPassword,
          options: {
            data: {
              full_name: checkoutData.name,
              email_verified: false,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (!authData.user) {
          throw new Error('Failed to create user account');
        }

        // Wait for Supabase trigger to create initial profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the profile with correct role and data
        // (Supabase trigger creates profile with default values, we update it)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: checkoutData.name,
            phone: checkoutData.phone || null,
            location: checkoutData.location || null,
            bio: checkoutData.bio || null,
            role: dbRole,
            profile_type: checkoutData.profileType,
            tier: checkoutData.selectedTier,
            email_verified: false,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // If update fails, try insert as fallback
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: checkoutData.email,
              full_name: checkoutData.name,
              phone: checkoutData.phone || null,
              location: checkoutData.location || null,
              bio: checkoutData.bio || null,
              role: dbRole,
              profile_type: checkoutData.profileType,
              tier: checkoutData.selectedTier,
              email_verified: false,
            });

          if (insertError) {
            console.error('Profile insert error:', insertError);
            throw new Error(`Failed to create profile: ${insertError.message}`);
          }
        }

        // Check if we got a session from signup (happens when email confirmation is disabled)
        if (authData.session) {
          toast.success('Account Created!', {
            description: 'Welcome to Summerland Estates',
          });
          // Force hard reload to ensure auth state is refreshed
          window.location.href = '/';
          return;
        }

        // If no session from signup, try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: checkoutData.email,
          password: randomPassword,
        });

        if (signInError) {
          console.error('Auto sign-in error:', signInError);
          
          // Email confirmation required - store credentials temporarily for easy login
          sessionStorage.setItem('pendingLogin', JSON.stringify({
            email: checkoutData.email,
            password: randomPassword,
            message: 'Account created! Please check your email to confirm, then log in.'
          }));
          
          toast.success('Account Created!', {
            description: 'Please check your email to confirm your account, then log in.',
          });
          
          // Redirect to login page
          navigate('/login', { state: { email: checkoutData.email, needsConfirmation: true } });
          return;
        }

        // Verify session is established
        if (signInData.session) {
          toast.success('Account Created!', {
            description: 'Welcome to Summerland Estates',
          });

          // Force hard reload to ensure auth state is refreshed
          window.location.href = '/';
        } else {
          toast.info('Account Created!', {
            description: 'Please log in with your credentials',
          });
          navigate('/login', { state: { email: checkoutData.email } });
        }
      } else {
        // For paid plans, redirect to Stripe Checkout
        // Store checkout data in sessionStorage for after payment
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        // Extract price from planPrice (e.g., "$1.99" -> "1.99")
        const priceAmount = checkoutData.planPrice.replace(/[^0-9.]/g, '');

        // Call API route to create Stripe Checkout Session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceAmount,
            email: checkoutData.email,
            metadata: {
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

        // Use the checkout URL directly from Stripe
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL returned from Stripe');
        }
      }
    } catch (error: any) {
      console.error('Account creation/payment error:', error);
      
      let errorMessage = 'Please try again';
      if (error.message) {
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
              {isFree ? 'Complete Registration' : 'Complete Payment'}
            </h1>
            <p className="text-xl text-gray-600">
              {isFree 
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

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#A89F91]">
                      {checkoutData.planPrice}
                    </span>
                  </div>
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
                  Review your information before {isFree ? 'creating account' : 'proceeding to payment'}
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
                          Proceed to Payment
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
