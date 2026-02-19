import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
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
      toast.success('Login Successful!', {
        description: 'Welcome back to Summerland Estates',
      });
      setTimeout(() => navigate('/'), 500);
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

  return (
    <div className="min-h-screen bg-background page-transition">
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

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>

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
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Sign up
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
