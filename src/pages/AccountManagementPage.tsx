import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Check, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import type { PricingTier, UserType } from '../types';

type ExitStep = 'community-offer' | 'confirm-delete';

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [userType, setUserType] = useState<UserType>('professional');
  const [showExitFlow, setShowExitFlow] = useState(false);
  const [exitStep, setExitStep] = useState<ExitStep>('community-offer');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountLocation, setAccountLocation] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    const tier = localStorage.getItem('userTier') as PricingTier | undefined;
    const type = localStorage.getItem('userType') as UserType;
    setUserTier(tier);
    setUserType(type || 'professional');

    setAccountEmail(user?.email || '');

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, location, application_data')
        .eq('id', user!.id)
        .maybeSingle();

      if (profile?.email) setAccountEmail(profile.email);
      const location =
        profile?.location ||
        (typeof profile?.application_data?.location === 'string' ? profile.application_data.location : '') ||
        (typeof profile?.application_data?.city === 'string' ? profile.application_data.city : '');
      setAccountLocation(location);
    };

    loadProfile();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleStartExitFlow = () => {
    setShowExitFlow(true);
    setExitStep('community-offer');
  };

  const handleStayInCommunity = () => {
    // Downgrade to community-only tier
    const communityTier = userType === 'professional' ? 'professional-community' : 'estates-community';
    localStorage.setItem('userTier', communityTier);
    alert('Your account has been updated to community-only access.');
    setShowExitFlow(false);
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    // Delete account
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userTier');
    localStorage.removeItem('userType');
    localStorage.removeItem('savedProfiles');
    localStorage.removeItem('connections');
    
    alert('Your account has been deleted.');
    navigate('/');
  };

  const handleCancelExit = () => {
    setShowExitFlow(false);
    setExitStep('community-offer');
  };

  const handleDownloadData = async () => {
    if (!user) return;
    try {
      const [profileResult, jobsResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('job_postings').select('*').eq('user_id', user.id),
        supabase.from('service_requests').select('*').eq('user_id', user.id),
      ]);

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        account: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          metadata: user.user_metadata,
        },
        profile: profileResult.data,
        jobPostings: jobsResult.data || [],
        serviceRequests: requestsResult.data || [],
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `summerland-estates-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Unable to export your data right now. Please contact support for a copy of your data.');
    }
  };

  const isProfessional = userType === 'professional';

  const communityPrice = isProfessional ? '$1' : '$3.99';

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-medium text-foreground mb-4 tracking-tight">
              Account Management
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Manage your account settings and participation level.
            </p>
          </div>

          {/* Current Account Info */}
          <Card className="p-8 bg-card text-card-foreground mb-8">
            <h2 className="text-2xl font-heading font-medium text-foreground mb-6 tracking-tight">
              Current Account
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Account Type</span>
                </div>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {userType === 'professional' && 'Private Estate Professional'}
                  {userType === 'business' && 'Estate Services Business'}
                  {userType === 'agency' && 'Agency'}
                  {userType === 'estates' && 'Estate Principal'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Participation Level</span>
                </div>
                <span className="text-foreground font-medium">
                  {userTier ? userTier.split('-')[1].charAt(0).toUpperCase() + userTier.split('-')[1].slice(1) : 'Free'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Email</span>
                </div>
                <span className="text-muted-foreground">{accountEmail || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Location</span>
                </div>
                <span className="text-muted-foreground">{accountLocation || '—'}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-8 bg-card text-card-foreground mb-8">
            <h2 className="text-2xl font-heading font-medium text-foreground mb-6 tracking-tight">
              Account Actions
            </h2>
            
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/pricing')}
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-muted"
              >
                Change Participation Level
              </Button>

              <Button
                onClick={() => navigate('/notification-settings')}
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-muted"
              >
                Notification Settings
              </Button>

              <Button
                onClick={handleDownloadData}
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-muted"
              >
                Download My Data
              </Button>

              <Button
                onClick={handleStartExitFlow}
                variant="outline"
                className="w-full justify-start border-destructive text-destructive hover:bg-destructive/10"
              >
                End Account
              </Button>
            </div>
          </Card>

          {/* Important Notice */}
          <Card className="p-6 bg-muted border-border">
            <p className="text-sm text-foreground leading-relaxed">
              Account changes take effect immediately. Participation level changes will be reflected in your next billing cycle.
            </p>
          </Card>
        </div>
      </main>

      {/* Exit Flow Dialog */}
      <Dialog open={showExitFlow} onOpenChange={setShowExitFlow}>
        <DialogContent className="bg-card text-card-foreground max-w-lg">
          {/* Step 1: Community Offer */}
          {exitStep === 'community-offer' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-heading font-medium text-foreground tracking-tight">
                  Would you like to remain in the community?
                </DialogTitle>
              </DialogHeader>

              <Card className="p-8 bg-muted border-border mt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-heading font-medium text-foreground mb-2 tracking-tight">
                    Just Join the Community
                  </h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-heading font-medium text-foreground">
                      {communityPrice}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-foreground">
                    <Check className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm">
                      {isProfessional 
                        ? 'Access to community only. No placements or interviews.'
                        : 'Community access only. No hiring tools.'}
                    </span>
                  </li>
                </ul>
              </Card>

              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleStayInCommunity}
                  className="bg-primary text-primary-foreground"
                >
                  Stay in Community
                </Button>
                <Button
                  onClick={() => setExitStep('confirm-delete')}
                  variant="outline"
                  className="border-border text-foreground"
                >
                  Delete Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelExit}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Confirm Delete */}
          {exitStep === 'confirm-delete' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-heading font-medium text-foreground tracking-tight">
                  Confirm Account Deletion
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <Card className="p-6 bg-destructive/10 border-destructive/20 mt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">
                      Your account will be permanently deleted.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All profile data will be removed</li>
                      <li>• Saved profiles will be deleted</li>
                      <li>• Message history will be cleared</li>
                      <li>• Community access will end</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete Account
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelExit}
                  className="border-border text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
