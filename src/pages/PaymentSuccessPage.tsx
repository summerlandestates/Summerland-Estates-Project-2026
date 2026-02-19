import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Home } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

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

    const checkoutData = JSON.parse(checkoutDataStr);

    // Create account after successful payment
    createAccount(checkoutData);
  }, [searchParams, navigate]);

  const createAccount = async (checkoutData: any) => {
    try {
      // Generate a random password (user will reset via email)
      const randomPassword = Math.random().toString(36).slice(-12) + 
                            Math.random().toString(36).slice(-12).toUpperCase() + 
                            '!@#';

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: checkoutData.email,
        password: randomPassword,
        options: {
          data: {
            full_name: checkoutData.name,
            profile_type: checkoutData.profileType,
            tier: checkoutData.selectedTier,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create profile entry
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: checkoutData.email,
            full_name: checkoutData.name,
            phone: checkoutData.phone,
            location: checkoutData.location,
            bio: checkoutData.bio,
            role: checkoutData.role || null,
            profile_type: checkoutData.profileType,
            tier: checkoutData.selectedTier,
            email_verified: false,
          });

        if (profileError) throw profileError;
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
    } catch (error: any) {
      console.error('Account creation error:', error);
      setProcessing(false);
      toast.error('Account Creation Failed', {
        description: error.message || 'Please contact support',
      });
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
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600 text-lg mb-8">
                    Your account has been created successfully. Check your email to verify your account.
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-[#D97706] hover:bg-[#B45309] text-white px-8 py-4 text-lg rounded-xl"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go to Homepage
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-500 text-3xl">✕</span>
                  </div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                    Something Went Wrong
                  </h1>
                  <p className="text-gray-600 text-lg mb-8">
                    Please contact support for assistance
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
                  >
                    Go to Homepage
                  </Button>
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
