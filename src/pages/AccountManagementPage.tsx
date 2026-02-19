import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { listings } from '../data/listings';
import type { PricingTier, UserType } from '../types';

type ExitStep = 'outcome' | 'select-profile' | 'community-offer' | 'confirm-delete';

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [userType, setUserType] = useState<UserType>('professional');
  const [showExitFlow, setShowExitFlow] = useState(false);
  const [exitStep, setExitStep] = useState<ExitStep>('outcome');
  const [hireOccurred, setHireOccurred] = useState<boolean | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('');

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
    setExitStep('outcome');
    setHireOccurred(null);
    setSelectedProfile('');
  };

  const handleOutcomeSelection = (occurred: boolean) => {
    setHireOccurred(occurred);
    if (occurred) {
      setExitStep('select-profile');
    } else {
      setExitStep('community-offer');
    }
  };

  const handleProfileSelection = () => {
    if (!selectedProfile) {
      alert('Please select a profile');
      return;
    }
    setExitStep('confirm-delete');
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
    // Store hire confirmation if applicable
    if (hireOccurred && selectedProfile) {
      const confirmation = {
        userId: '1', // Mock current user
        hiredProfileId: selectedProfile,
        confirmedDate: new Date().toISOString()
      };
      localStorage.setItem('exit_hire_confirmation', JSON.stringify(confirmation));
    }

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
    setExitStep('outcome');
    setHireOccurred(null);
    setSelectedProfile('');
  };

  const isProfessional = userType === 'professional';
  const isHiringRole = userType === 'agency' || userType === 'estates';

  // Get eligible profiles for selection
  const eligibleProfiles = isProfessional
    ? listings.filter(l => l.category === 'Agency' || l.category === 'Estates' || l.profileStatus === 'actively-hiring')
    : listings.filter(l => l.category === 'Staff' || l.profileStatus === 'available-for-hire');

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
                <span className="text-muted-foreground">user@example.com</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Location</span>
                </div>
                <span className="text-muted-foreground">Beverly Hills, CA</span>
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
          {/* Step 1: Outcome */}
          {exitStep === 'outcome' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-heading font-medium text-foreground tracking-tight">
                  {isProfessional ? 'Did you get hired?' : 'Did you hire a candidate?'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  This helps us understand outcomes within the network.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div
                  onClick={() => handleOutcomeSelection(true)}
                  className="p-6 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full" />
                    </div>
                    <span className="text-lg font-medium text-foreground">Yes</span>
                  </div>
                </div>

                <div
                  onClick={() => handleOutcomeSelection(false)}
                  className="p-6 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full" />
                    </div>
                    <span className="text-lg font-medium text-foreground">No</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
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

          {/* Step 2: Select Profile */}
          {exitStep === 'select-profile' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-heading font-medium text-foreground tracking-tight">
                  {isProfessional ? 'Who hired you?' : 'Who did you hire?'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Select the profile involved.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-6 max-h-[400px] overflow-y-auto">
                {eligibleProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProfile === profile.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.profilePhoto}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{profile.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{profile.role}</p>
                      </div>
                      {selectedProfile === profile.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setExitStep('outcome')}
                  className="flex-1 text-muted-foreground"
                >
                  Back
                </Button>
                <Button
                  onClick={handleProfileSelection}
                  disabled={!selectedProfile}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Community Offer */}
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

              {hireOccurred && selectedProfile && (
                <Card className="p-6 bg-success/10 border-success/20 mt-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-foreground font-medium mb-2">
                        Hire confirmation recorded
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isProfessional ? 'Hired by: ' : 'Hired: '}
                        {listings.find(l => l.id === selectedProfile)?.name}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

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
