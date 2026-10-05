import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import LinkedInAuthButton from '@/components/LinkedInAuthButton';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const { user, loading: authLoading, signIn, signInWithGoogle, signInWithLinkedIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for pending login from account creation
    const pendingLogin = sessionStorage.getItem('pendingLogin');
    if (pendingLogin) {
      const { email: pendingEmail } = JSON.parse(pendingLogin);
      setEmail(pendingEmail);
      setShowConfirmationMessage(true);
      // Clear after reading
      sessionStorage.removeItem('pendingLogin');
    }

    // Check for state from navigation
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.needsConfirmation) {
      setShowConfirmationMessage(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (authLoading || !user) return;

    const redirectLoggedInUser = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    };

    redirectLoggedInUser();
  }, [authLoading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Login Failed', {
        description: error.message,
      });
      setLoading(false);
    } else {
      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();

      if (!signedInUser) {
        toast.error('Login Failed', {
          description: 'Could not load your account after sign-in.',
        });
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status, rejection_reason, application_data')
        .eq('id', signedInUser.id)
        .maybeSingle();

      // One-time backfill: if signup-time profile writes failed (e.g. email
      // confirmation was on), sync application_data from auth metadata so the
      // profile page shows their info.
      const metaApplicationData = signedInUser.user_metadata?.application_data;
      if (profile && !profile.application_data && metaApplicationData) {
        await supabase
          .from('profiles')
          .update({
            application_data: metaApplicationData,
            ...(profile.role ? {} : { role: signedInUser.user_metadata?.profile_type || null }),
          })
          .eq('id', signedInUser.id);
        profile.application_data = metaApplicationData;
      }

      // Admins bypass application status checks entirely
      if (profile?.role !== 'admin') {
        const accountStatus =
          profile?.status ||
          profile?.application_data?.account_status ||
          signedInUser.user_metadata?.account_status ||
          (!profile && signedInUser.user_metadata?.application_data ? 'pending' : null);
        const rejectionReason =
          profile?.rejection_reason ||
          profile?.application_data?.rejection_reason ||
          signedInUser.user_metadata?.rejection_reason;

        if (accountStatus === 'pending') {
          await signOut();
          toast.info('Account under review', {
            description: 'Your registration is still pending admin approval.',
          });
          setLoading(false);
          navigate('/registration-pending', { state: { email } });
          return;
        }

        if (accountStatus === 'rejected') {
          await signOut();
          toast.error('Application not approved', {
            description: rejectionReason || 'Your registration was not approved. Please contact support.',
          });
          setLoading(false);
          return;
        }
      }

      toast.success('Login Successful!', {
        description: 'Welcome back to Summerland Estates',
      });
      setTimeout(() => navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'), 500);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error('Google Sign-In Failed', {
        description: error.message,
      });
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setLoading(true);

    const { error } = await signInWithLinkedIn();

    if (error) {
      toast.error('LinkedIn Sign-In Failed', {
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead title="Sign In - Summerland Estates" description="Sign in to your Summerland Estates account." canonical="/login" noIndex={true} />
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-heading font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to your Summerland Estates account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showConfirmationMessage && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium">Account created successfully!</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Please check your email and click the confirmation link, then log in here.
                  </p>
                </div>
              )}

              <GoogleAuthButton onClick={handleGoogleSignIn} disabled={loading} />
              <LinkedInAuthButton onClick={handleLinkedInSignIn} disabled={loading} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link to="/add-listing" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </div>

              <div className="rounded-xl border border-[#E8DED1] bg-[#FBF8F4] p-4 text-center">
                <p className="text-sm font-medium text-foreground">Looking to apply for membership?</p>
                <Link to="/add-listing" className="mt-2 inline-flex text-sm font-semibold text-[#8A8279] hover:underline">
                  Start the application
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
