import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Request Failed', {
        description: error.message,
      });
      setLoading(false);
    } else {
      toast.success('Email Sent!', {
        description: 'Check your email for the password reset link',
      });
      setSent(true);
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
              <CardTitle className="text-3xl font-heading font-bold">Forgot Password?</CardTitle>
              <CardDescription>
                {sent 
                  ? "We've sent you a password reset link"
                  : "Enter your email to receive a password reset link"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="space-y-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                    <Mail className="w-12 h-12 text-success mx-auto mb-2" />
                    <p className="text-sm text-success font-medium">
                      Password reset link sent to {email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Check your inbox and spam folder
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSent(false)}
                  >
                    Send to a different email
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to login
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <Link to="/login" className="text-primary hover:underline inline-flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
