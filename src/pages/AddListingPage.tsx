import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, ArrowLeft, ArrowRight, Check, User, Building2, Briefcase, Home } from 'lucide-react';
import { getPlansByUserType } from '../data/pricing';
import { professionalTitles, genderOptions, languages, workAvailability, workPreference, certifications, animalExperience, comfortLevels, cookingExperience } from '../data/profileOptions';
import type { OnboardingType, OnboardingStep, UserType, PricingTier, ApplicationFormData } from '../types';

type ProfileType = 'professional' | 'service-provider' | 'agency' | 'estates' | null;
type EstatesSubType = 'estate-manager' | 'chief-of-staff' | 'personal-assistant' | 'executive-assistant' | 'principal' | null;

const profileTypeToUserType: { [key: string]: UserType } = {
  'professional': 'professional',
  'service-provider': 'business',
  'agency': 'agency',
  'estates': 'estates'
};

const professionalSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A private network for professionals trusted in discreet households.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'This is not a public job board.',
    subContent: 'Profiles are reviewed.\nPlacements are selective.\nVisibility is controlled.'
  },
  {
    id: 3,
    title: 'What Membership Provides',
    content: 'Membership may include access to private placements, controlled visibility, and private correspondence.',
    note: 'Access varies by membership level.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

const serviceProviderSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A trusted environment for businesses serving private estates.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'This is not advertising. Businesses are presented by reputation and alignment.'
  },
  {
    id: 3,
    title: 'What Participation Provides',
    content: 'Participation may include quiet visibility, association with a vetted network, and opportunity-based exposure.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

const agencySteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A considered framework for private placements.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'Volume is not the objective. Introductions are intentional. Reputation is protected.'
  },
  {
    id: 3,
    title: 'What Participation Provides',
    content: 'Introduction to a vetted network.\nA structured environment for private placements.\nPlatform standards that protect credibility.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

const estatesSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A secure environment for private hiring.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'This is not public hiring. Placements may remain anonymous. Visibility is controlled.'
  },
  {
    id: 3,
    title: 'What the Network Supports',
    content: 'The network supports vetted professionals, private placement workflows, and controlled correspondence.',
    note: 'Tools and correspondence access depend on membership level.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

export default function AddListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [estatesSubType, setEstatesSubType] = useState<EstatesSubType>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({});
  const [isCommunityOnly, setIsCommunityOnly] = useState(false);
  const [showStandardsNotice, setShowStandardsNotice] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if coming from community join flow
    if (location.state?.communityOnly) {
      setIsCommunityOnly(true);
    }
  }, [location.state]);

  const getSteps = (): OnboardingStep[] => {
    if (profileType === 'professional') return professionalSteps;
    if (profileType === 'service-provider') return serviceProviderSteps;
    if (profileType === 'agency') return agencySteps;
    if (profileType === 'estates') return estatesSteps;
    return [];
  };

  const steps = getSteps();
  const currentStepData = steps.find(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // After onboarding, auto-select community tier if community-only flow
      if (isCommunityOnly && profileType) {
        const userType = profileTypeToUserType[profileType];
        const communityTier = userType === 'professional' 
          ? 'professional-community' 
          : userType === 'business'
          ? 'business-free' // Businesses don't have community-only tier
          : `${userType}-community` as PricingTier;
        
        setSelectedTier(communityTier);
        setCurrentStep(999); // Skip to form
      } else {
        setShowPricing(true);
      }
    }
  };

  const handleBack = () => {
    if (showPricing) {
      setShowPricing(false);
      setCurrentStep(steps.length);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (profileType) {
      setProfileType(null);
      setEstatesSubType(null);
      setCurrentStep(1);
    } else {
      navigate('/');
    }
  };

  const handleTierSelection = (tierId: PricingTier) => {
    setSelectedTier(tierId);
  };

  const handleContinueFromPricing = () => {
    if (!selectedTier) {
      alert('Please select a participation level');
      return;
    }
    setShowPricing(false);
    setCurrentStep(999);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTier) {
      alert('Please select a participation level first');
      return;
    }

    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const plans = getPlansByUserType(profileTypeToUserType[profileType!]);
    const selectedPlan = plans.find(p => p.id === selectedTier);

    // Prepare checkout data
    const checkoutData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      location: formData.get('location') as string,
      role: formData.get('role') as string || undefined,
      bio: formData.get('bio') as string,
      profileType: profileType!,
      selectedTier: selectedTier,
      planName: selectedPlan?.name || '',
      planPrice: selectedPlan?.price || '',
    };

    // Navigate to checkout page with data
    navigate('/checkout', { state: { checkoutData } });
  };

  // If user is logged in and hasn't selected a profile type, show upgrade options
  if (user && profileType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-3xl">
            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                Upgrade Your Account
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                You're already a member! Explore upgrade options to unlock more features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-card text-card-foreground border border-gray-200 hover:border-[#A89F91] transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                    View Plans
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Explore available membership tiers and upgrade options
                  </p>
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                    onClick={() => navigate('/pricing')}
                  >
                    View Pricing
                  </Button>
                </div>
              </Card>

              <Card className="p-8 bg-card text-card-foreground border border-gray-200 hover:border-[#A89F91] transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                    Manage Account
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Update your profile, settings, and subscription
                  </p>
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                    onClick={() => navigate('/account-management')}
                  >
                    Account Settings
                  </Button>
                </div>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Need help? Contact our support team for assistance with your account.
              </p>
              <Button 
                variant="outline"
                className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Estates sub-type selection
  if (profileType === 'estates' && estatesSubType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-5xl">
            <Button
              variant="ghost"
              onClick={() => setProfileType(null)}
              className="mb-12 text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-6 tracking-tight">
                Estates
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Estate Principals and In-House Members Hiring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('principal')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Estate Principal
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Estate owners and high-net-worth individuals
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('estate-manager')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Estate Manager
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Hiring on behalf of the estate
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('chief-of-staff')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Chief of Staff
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Managing estate operations
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('personal-assistant')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Personal Assistant
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Coordinating hiring for the principal
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('executive-assistant')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Executive Assistant
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Managing recruitment and staffing
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Standards Notice screen (appears after profile type selection)
  if (showStandardsNotice && profileType !== null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-2xl">
            <Card className="p-12 bg-card text-card-foreground border border-border">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Shield className="w-10 h-10 text-[#A89F91]" />
                </div>
                <h1 className="text-4xl font-heading font-semibold text-foreground mb-6">
                  Standards Notice
                </h1>
                <div className="space-y-4 text-left mb-8">
                  <p className="text-lg text-foreground leading-relaxed">
                    <strong>Discretion is a requirement.</strong>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Content that compromises trust is removed.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Membership may be revoked at any time.
                  </p>
                </div>
                <Button
                  onClick={() => setShowStandardsNotice(false)}
                  className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-12 py-4 text-lg rounded-xl"
                >
                  I Understand
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Profile type selection (for non-logged-in users)
  if (profileType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-5xl">
            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                {isCommunityOnly ? 'Create Profile to Join Community' : 'Participation Levels'}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {isCommunityOnly 
                  ? 'Select your profile type to access community features.'
                  : 'Membership is reviewed to preserve the integrity of the network.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('professional'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Professional
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Private estate professionals
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('service-provider'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Service Provider
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Estate service businesses
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('agency'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Agency Owner
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Private placement agencies
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('estates'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Estates
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Principals and hiring staff
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Pricing selection (after onboarding, skip if community-only)
  if (showPricing && profileType && !isCommunityOnly) {
    const userType = profileTypeToUserType[profileType];
    const plans = getPlansByUserType(userType);

    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-7xl">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-12 text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                Select Participation Level
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Choose the level that fits your needs.
              </p>
            </div>

            <div className={`grid grid-cols-1 ${plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3 max-w-6xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8 mb-16`}>
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-8 bg-card text-card-foreground border transition-all cursor-pointer ${
                    selectedTier === plan.id
                      ? 'border-primary border-2 shadow-lg'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => handleTierSelection(plan.id)}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-6">
                      <span className="text-5xl font-heading font-medium text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground ml-2">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 min-h-[240px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-foreground">
                        <Check className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedTier === plan.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinueFromPricing}
                disabled={!selectedTier}
                size="lg"
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-16 py-6 text-lg disabled:opacity-50 rounded-xl"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <Card className="p-8 bg-muted border-border/50 max-w-3xl mx-auto mt-16">
              <p className="text-center text-foreground leading-relaxed">
                Access varies by participation level.
              </p>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Onboarding flow
  if (currentStep < steps.length) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-3xl">
            <div className="mb-12 text-center">
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`h-1 w-16 rounded-full ${
                      step.id <= currentStep ? 'bg-[#A89F91]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground tracking-wide uppercase">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <Card className="p-16 bg-card text-card-foreground border-border/50">
              <div className="text-center space-y-8">
                <h1 className="text-5xl font-heading font-medium text-foreground tracking-tight leading-tight">
                  {currentStepData?.title}
                </h1>
                
                <div className="space-y-6 max-w-2xl mx-auto">
                  <p className="text-2xl text-foreground leading-relaxed whitespace-pre-line">
                    {currentStepData?.content}
                  </p>
                  
                  {currentStepData?.subContent && (
                    <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
                      {currentStepData.subContent}
                    </p>
                  )}
                  
                  {currentStepData?.note && (
                    <p className="text-sm text-muted-foreground italic pt-4 border-t border-border/30">
                      {currentStepData.note}
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-4 pt-8">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-12 py-4 rounded-xl"
                  >
                    {currentStepData?.buttonText || 'Continue'}
                    {!currentStepData?.buttonText && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Account creation form (after pricing selection or auto-selected for community)
  if (currentStep === 999 && selectedTier) {
    const plans = getPlansByUserType(profileTypeToUserType[profileType!]);
    const selectedPlan = plans.find(p => p.id === selectedTier);

    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-12 max-w-3xl">
            <Button
              variant="ghost"
              onClick={() => {
                if (isCommunityOnly) {
                  setProfileType(null);
                  setCurrentStep(1);
                } else {
                  setCurrentStep(steps.length);
                  setShowPricing(true);
                }
              }}
              className="mb-8 text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="mb-12 text-center">
              <h1 className="text-5xl font-heading font-medium text-foreground mb-6 tracking-tight">
                Create Account
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {isCommunityOnly 
                  ? 'Complete your profile to access community features'
                  : 'Complete your profile to proceed to payment'}
              </p>
            </div>

            <Card className="p-8 bg-card text-card-foreground border-border/50">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-heading font-medium text-foreground tracking-tight mb-4">
                      Basic Information
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground text-sm">
                        {profileType === 'professional' && 'Full Name'}
                        {profileType === 'service-provider' && 'Business Name'}
                        {profileType === 'agency' && 'Full Name'}
                        {profileType === 'estates' && 'Full Name'}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter name"
                        required
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    {profileType === 'professional' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-foreground text-sm">Professional Title</Label>
                          <Select name="role" required>
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select your title" />
                            </SelectTrigger>
                            <SelectContent className="bg-card max-h-[300px]">
                              {professionalTitles.map((title) => (
                                <SelectItem key={title} value={title.toLowerCase().replace(/\s+/g, '-')}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-foreground text-sm">Gender</Label>
                          <Select name="gender">
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                              {genderOptions.map((gender) => (
                                <SelectItem key={gender} value={gender.toLowerCase()}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                            <Input
                              id="linkedin_url"
                              name="linkedin_url"
                              type="url"
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website_url" className="text-foreground text-sm">Website URL</Label>
                            <Input
                              id="website_url"
                              name="website_url"
                              type="url"
                              placeholder="https://yourwebsite.com"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skills" className="text-foreground text-sm">Skills</Label>
                          <Textarea
                            id="skills"
                            name="skills"
                            placeholder="List your key skills and expertise..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="personality" className="text-foreground text-sm">Personality</Label>
                          <Textarea
                            id="personality"
                            name="personality"
                            placeholder="Describe your personality and work style..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                          <p className="text-xs text-muted-foreground">Take the 16 Personalities test and share your results here</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="years_experience" className="text-foreground text-sm">Years Experience in this Field</Label>
                          <Input
                            id="years_experience"
                            name="years_experience"
                            type="number"
                            min="0"
                            max="50"
                            placeholder="e.g. 15"
                            required
                            className="bg-background text-foreground border-border"
                          />
                          <p className="text-xs text-muted-foreground">This will be displayed on your profile</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="available_date" className="text-foreground text-sm">Date Available to Start</Label>
                          <Input
                            id="available_date"
                            name="available_date"
                            type="date"
                            required
                            className="bg-background text-foreground border-border"
                          />
                          <p className="text-xs text-muted-foreground">Shows "Available Now" if today or past, otherwise shows the date</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resume" className="text-foreground text-sm">Resume Upload (PDF)</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="resume"
                              name="resume"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                            />
                            <label htmlFor="resume" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload resume</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">Resume will be visible on your profile for employers to view</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="portfolio" className="text-foreground text-sm">Portfolio Photos</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="portfolio"
                              name="portfolio"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                            <label htmlFor="portfolio" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload portfolio photos</p>
                              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 10MB each)</p>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="birthday" className="text-foreground text-sm">Birthday (Month/Day)</Label>
                            <Input
                              id="birthday"
                              name="birthday"
                              type="text"
                              placeholder="MM/DD"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="originally_from" className="text-foreground text-sm">Originally From</Label>
                            <Input
                              id="originally_from"
                              name="originally_from"
                              placeholder="City, State"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Animal Experience</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="animal-dogs" name="animal_experience" value="Dogs" />
                              <Label htmlFor="animal-dogs" className="text-sm text-foreground cursor-pointer">Dogs</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="animal-cats" name="animal_experience" value="Cats" />
                              <Label htmlFor="animal-cats" className="text-sm text-foreground cursor-pointer">Cats</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="animal-farm" name="animal_experience" value="Farm Animals" />
                              <Label htmlFor="animal-farm" className="text-sm text-foreground cursor-pointer">Farm Animals</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="animal-exotic" name="animal_experience" value="Exotic" />
                              <Label htmlFor="animal-exotic" className="text-sm text-foreground cursor-pointer">Exotic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="animal-birds" name="animal_experience" value="Birds" />
                              <Label htmlFor="animal-birds" className="text-sm text-foreground cursor-pointer">Birds</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="animal-reptiles" name="animal_experience" value="Reptiles" />
                              <Label htmlFor="animal-reptiles" className="text-sm text-foreground cursor-pointer">Reptiles</Label>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="medication_experience" name="medication_experience" />
                          <Label htmlFor="medication_experience" className="text-sm text-foreground cursor-pointer">Experience Handling Medications</Label>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Comfortable With</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-groups" name="comfortable_with" value="Big Groups" />
                              <Label htmlFor="comfort-groups" className="text-sm text-foreground cursor-pointer">Big Groups</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-events" name="comfortable_with" value="Large Events" />
                              <Label htmlFor="comfort-events" className="text-sm text-foreground cursor-pointer">Large Events</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-alone" name="comfortable_with" value="Alone" />
                              <Label htmlFor="comfort-alone" className="text-sm text-foreground cursor-pointer">Alone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-pets" name="comfortable_with" value="Pets" />
                              <Label htmlFor="comfort-pets" className="text-sm text-foreground cursor-pointer">Pets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-children" name="comfortable_with" value="Children" />
                              <Label htmlFor="comfort-children" className="text-sm text-foreground cursor-pointer">Children</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-travel" name="comfortable_with" value="Travel" />
                              <Label htmlFor="comfort-travel" className="text-sm text-foreground cursor-pointer">Travel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-livein" name="comfortable_with" value="Live-In" />
                              <Label htmlFor="comfort-livein" className="text-sm text-foreground cursor-pointer">Live-In</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-overnight" name="comfortable_with" value="Overnight" />
                              <Label htmlFor="comfort-overnight" className="text-sm text-foreground cursor-pointer">Overnight</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="comfort-tech" name="comfortable_with" value="Tech" />
                              <Label htmlFor="comfort-tech" className="text-sm text-foreground cursor-pointer">Tech</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Cooking Experience</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cooking-basic" name="cooking_experience" value="Basic" />
                              <Label htmlFor="cooking-basic" className="text-sm text-foreground cursor-pointer">Basic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cooking-intermediate" name="cooking_experience" value="Intermediate" />
                              <Label htmlFor="cooking-intermediate" className="text-sm text-foreground cursor-pointer">Intermediate</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cooking-expert" name="cooking_experience" value="Expert" />
                              <Label htmlFor="cooking-expert" className="text-sm text-foreground cursor-pointer">Expert</Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hobbies" className="text-foreground text-sm">Hobbies</Label>
                            <Textarea
                              id="hobbies"
                              name="hobbies"
                              placeholder="List your hobbies..."
                              rows={2}
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interests" className="text-foreground text-sm">Interests</Label>
                            <Textarea
                              id="interests"
                              name="interests"
                              placeholder="List your interests..."
                              rows={2}
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing To</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="willing-travel" name="willing_to" value="Travel" />
                              <Label htmlFor="willing-travel" className="text-sm text-foreground cursor-pointer">Travel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="willing-relocate" name="willing_to" value="Relocate" />
                              <Label htmlFor="willing-relocate" className="text-sm text-foreground cursor-pointer">Relocate</Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="salary_min" className="text-foreground text-sm">Salary Expectation (Min)</Label>
                            <Input
                              id="salary_min"
                              name="salary_min"
                              type="number"
                              placeholder="$50,000"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="salary_max" className="text-foreground text-sm">Salary Expectation (Max)</Label>
                            <Input
                              id="salary_max"
                              name="salary_max"
                              type="number"
                              placeholder="$80,000"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Work Preference</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="pref-fulltime" name="work_preference" value="Full Time" />
                              <Label htmlFor="pref-fulltime" className="text-sm text-foreground cursor-pointer">Full Time</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="pref-parttime" name="work_preference" value="Part Time" />
                              <Label htmlFor="pref-parttime" className="text-sm text-foreground cursor-pointer">Part Time</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="pref-contract" name="work_preference" value="Contract" />
                              <Label htmlFor="pref-contract" className="text-sm text-foreground cursor-pointer">Contract</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="pref-seasonal" name="work_preference" value="Seasonal" />
                              <Label htmlFor="pref-seasonal" className="text-sm text-foreground cursor-pointer">Seasonal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="pref-temporary" name="work_preference" value="Temporary" />
                              <Label htmlFor="pref-temporary" className="text-sm text-foreground cursor-pointer">Temporary</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="pref-remote" name="work_preference" value="Remote" />
                              <Label htmlFor="pref-remote" className="text-sm text-foreground cursor-pointer">Remote</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Vehicle & License</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="has-license" name="has_license" />
                              <Label htmlFor="has-license" className="text-sm text-foreground cursor-pointer">Valid Driver's License</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="has-car" name="has_car" />
                              <Label htmlFor="has-car" className="text-sm text-foreground cursor-pointer">Own Registered Car</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="has-insurance" name="has_insurance" />
                              <Label htmlFor="has-insurance" className="text-sm text-foreground cursor-pointer">Valid Insurance</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-cpr" name="certifications" value="CPR/AED" />
                              <Label htmlFor="cert-cpr" className="text-xs text-foreground cursor-pointer">CPR / AED</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-firstaid" name="certifications" value="First Aid" />
                              <Label htmlFor="cert-firstaid" className="text-xs text-foreground cursor-pointer">First Aid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-infantcpr" name="certifications" value="Infant & Child CPR" />
                              <Label htmlFor="cert-infantcpr" className="text-xs text-foreground cursor-pointer">Infant & Child CPR</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-pedfirstaid" name="certifications" value="Pediatric First Aid" />
                              <Label htmlFor="cert-pedfirstaid" className="text-xs text-foreground cursor-pointer">Pediatric First Aid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-bls" name="certifications" value="BLS" />
                              <Label htmlFor="cert-bls" className="text-xs text-foreground cursor-pointer">Basic Life Support (BLS)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-acls" name="certifications" value="ACLS" />
                              <Label htmlFor="cert-acls" className="text-xs text-foreground cursor-pointer">Advanced Cardiac Life Support</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-watersafety" name="certifications" value="Water Safety" />
                              <Label htmlFor="cert-watersafety" className="text-xs text-foreground cursor-pointer">Water Safety / Lifeguard</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-medication" name="certifications" value="Medication Administration" />
                              <Label htmlFor="cert-medication" className="text-xs text-foreground cursor-pointer">Medication Administration</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-eldercare" name="certifications" value="Elder Care" />
                              <Label htmlFor="cert-eldercare" className="text-xs text-foreground cursor-pointer">Elder Care / Dementia Care</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-ncs" name="certifications" value="NCS" />
                              <Label htmlFor="cert-ncs" className="text-xs text-foreground cursor-pointer">Newborn Care Specialist</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-doula" name="certifications" value="Postpartum Doula" />
                              <Label htmlFor="cert-doula" className="text-xs text-foreground cursor-pointer">Postpartum Doula</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-childdev" name="certifications" value="Child Development" />
                              <Label htmlFor="cert-childdev" className="text-xs text-foreground cursor-pointer">Child Development</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-specialneeds" name="certifications" value="Special Needs Care" />
                              <Label htmlFor="cert-specialneeds" className="text-xs text-foreground cursor-pointer">Special Needs Care</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-montessori" name="certifications" value="Montessori" />
                              <Label htmlFor="cert-montessori" className="text-xs text-foreground cursor-pointer">Montessori</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-ece" name="certifications" value="ECE" />
                              <Label htmlFor="cert-ece" className="text-xs text-foreground cursor-pointer">Early Childhood Education</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-foodhandler" name="certifications" value="Food Handler" />
                              <Label htmlFor="cert-foodhandler" className="text-xs text-foreground cursor-pointer">Food Handler</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-servsafe" name="certifications" value="ServSafe" />
                              <Label htmlFor="cert-servsafe" className="text-xs text-foreground cursor-pointer">ServSafe</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-haccp" name="certifications" value="HACCP" />
                              <Label htmlFor="cert-haccp" className="text-xs text-foreground cursor-pointer">HACCP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-butler" name="certifications" value="Butler Certification" />
                              <Label htmlFor="cert-butler" className="text-xs text-foreground cursor-pointer">Butler / Formal Service</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-hospitality" name="certifications" value="Luxury Hospitality" />
                              <Label htmlFor="cert-hospitality" className="text-xs text-foreground cursor-pointer">Luxury Hospitality</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-propmgmt" name="certifications" value="Property Management" />
                              <Label htmlFor="cert-propmgmt" className="text-xs text-foreground cursor-pointer">Property Management</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-cdl" name="certifications" value="CDL" />
                              <Label htmlFor="cert-cdl" className="text-xs text-foreground cursor-pointer">CDL (Commercial Driver)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-chauffeur" name="certifications" value="Chauffeur" />
                              <Label htmlFor="cert-chauffeur" className="text-xs text-foreground cursor-pointer">Chauffeur Certification</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-defensive" name="certifications" value="Defensive Driving" />
                              <Label htmlFor="cert-defensive" className="text-xs text-foreground cursor-pointer">Defensive Driving</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-execprotect" name="certifications" value="Executive Protection" />
                              <Label htmlFor="cert-execprotect" className="text-xs text-foreground cursor-pointer">Executive Protection</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-security" name="certifications" value="Security Officer" />
                              <Label htmlFor="cert-security" className="text-xs text-foreground cursor-pointer">Security Officer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-stcw" name="certifications" value="STCW" />
                              <Label htmlFor="cert-stcw" className="text-xs text-foreground cursor-pointer">STCW (Maritime)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-yachtmaster" name="certifications" value="Yachtmaster" />
                              <Label htmlFor="cert-yachtmaster" className="text-xs text-foreground cursor-pointer">Yachtmaster</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-captain" name="certifications" value="Captain's License" />
                              <Label htmlFor="cert-captain" className="text-xs text-foreground cursor-pointer">Captain's License</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-osha" name="certifications" value="OSHA" />
                              <Label htmlFor="cert-osha" className="text-xs text-foreground cursor-pointer">OSHA Safety</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-hvac" name="certifications" value="HVAC" />
                              <Label htmlFor="cert-hvac" className="text-xs text-foreground cursor-pointer">HVAC</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-electrical" name="certifications" value="Electrical" />
                              <Label htmlFor="cert-electrical" className="text-xs text-foreground cursor-pointer">Electrical</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-plumbing" name="certifications" value="Plumbing" />
                              <Label htmlFor="cert-plumbing" className="text-xs text-foreground cursor-pointer">Plumbing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-pool" name="certifications" value="Pool & Spa Operator" />
                              <Label htmlFor="cert-pool" className="text-xs text-foreground cursor-pointer">Pool & Spa Operator</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-wine" name="certifications" value="Wine & Spirits" />
                              <Label htmlFor="cert-wine" className="text-xs text-foreground cursor-pointer">Wine & Spirits (WSET)</Label>
                            </div>
                          </div>
                          <Input
                            id="other_certifications"
                            name="other_certifications"
                            placeholder="Other certifications (comma separated)"
                            className="bg-background text-foreground border-border mt-2"
                          />
                        </div>
                      </>
                    )}

                    {profileType === 'service-provider' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Business Type</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_company" name="is_company" />
                              <Label htmlFor="is_company" className="text-sm text-foreground cursor-pointer">Company</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_individual" name="is_individual" />
                              <Label htmlFor="is_individual" className="text-sm text-foreground cursor-pointer">Individual</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-foreground text-sm">Service Type</Label>
                          <Input
                            id="role"
                            name="role"
                            placeholder="Landscaping Services, Pool Maintenance"
                            required
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rate_min" className="text-foreground text-sm">Rate Range (Min)</Label>
                            <Input
                              id="rate_min"
                              name="rate_min"
                              type="number"
                              placeholder="$50"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rate_max" className="text-foreground text-sm">Rate Range (Max)</Label>
                            <Input
                              id="rate_max"
                              name="rate_max"
                              type="number"
                              placeholder="$200"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="year_founded" className="text-foreground text-sm">Business Year Founded</Label>
                          <Input
                            id="year_founded"
                            name="year_founded"
                            type="number"
                            min="1900"
                            max="2026"
                            placeholder="2015"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sp_linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                            <Input
                              id="sp_linkedin_url"
                              name="linkedin_url"
                              type="url"
                              placeholder="https://linkedin.com/company/yourcompany"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sp_website_url" className="text-foreground text-sm">Website URL</Label>
                            <Input
                              id="sp_website_url"
                              name="website_url"
                              type="url"
                              placeholder="https://yourwebsite.com"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="years_experience" className="text-foreground text-sm">Years Experience in this Field</Label>
                          <Input
                            id="years_experience"
                            name="years_experience"
                            type="number"
                            min="0"
                            max="50"
                            placeholder="e.g. 10"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business_hours" className="text-foreground text-sm">Business Hours</Label>
                          <Input
                            id="business_hours"
                            name="business_hours"
                            placeholder="Mon-Fri 8am-6pm"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rate_sheet" className="text-foreground text-sm">Rate Sheet Upload (PDF)</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="rate_sheet"
                              name="rate_sheet"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                            />
                            <label htmlFor="rate_sheet" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload rate sheet</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_portfolio" className="text-foreground text-sm">Portfolio Photos</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="sp_portfolio"
                              name="sp_portfolio"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                            <label htmlFor="sp_portfolio" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload portfolio photos</p>
                              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 10MB each)</p>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                          <Input
                            id="linkedin_url"
                            name="linkedin_url"
                            type="url"
                            placeholder="https://linkedin.com/company/yourcompany"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website_url" className="text-foreground text-sm">Website URL</Label>
                          <Input
                            id="website_url"
                            name="website_url"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Staff Options</Label>
                          <div className="flex gap-4">
                            {genderOptions.map((gender) => (
                              <div key={gender} className="flex items-center space-x-2">
                                <Checkbox id={`staff-${gender}`} name="staff_options" value={gender} />
                                <Label htmlFor={`staff-${gender}`} className="text-sm text-foreground cursor-pointer">
                                  {gender}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Availability</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {workAvailability.map((availability) => (
                              <div key={availability} className="flex items-center space-x-2">
                                <Checkbox id={`sp-availability-${availability}`} name="availability" value={availability} />
                                <Label htmlFor={`sp-availability-${availability}`} className="text-sm text-foreground cursor-pointer">
                                  {availability}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-availability-remote" name="availability" value="Remote" />
                              <Label htmlFor="sp-availability-remote" className="text-sm text-foreground cursor-pointer">
                                Remote
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Comfortable With</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-pets" name="comfortable_with" value="Pets" />
                              <Label htmlFor="sp-pets" className="text-sm text-foreground cursor-pointer">Pets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-children" name="comfortable_with" value="Children" />
                              <Label htmlFor="sp-children" className="text-sm text-foreground cursor-pointer">Children</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-licensed" name="certifications" value="Licensed" />
                              <Label htmlFor="sp-cert-licensed" className="text-sm text-foreground cursor-pointer">Licensed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-bonded" name="certifications" value="Bonded" />
                              <Label htmlFor="sp-cert-bonded" className="text-sm text-foreground cursor-pointer">Bonded</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-insured" name="certifications" value="Insured" />
                              <Label htmlFor="sp-cert-insured" className="text-sm text-foreground cursor-pointer">Insured</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-epa" name="certifications" value="EPA Certified" />
                              <Label htmlFor="sp-cert-epa" className="text-sm text-foreground cursor-pointer">EPA Certified</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-osha" name="certifications" value="OSHA Certified" />
                              <Label htmlFor="sp-cert-osha" className="text-sm text-foreground cursor-pointer">OSHA Certified</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-green" name="certifications" value="Green Certified" />
                              <Label htmlFor="sp-cert-green" className="text-sm text-foreground cursor-pointer">Green Certified</Label>
                            </div>
                          </div>
                          <Input
                            id="sp_other_certifications"
                            name="other_certifications"
                            placeholder="Other certifications (comma separated)"
                            className="bg-background text-foreground border-border mt-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing to Undergo</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp_background_check" name="background_check" />
                              <Label htmlFor="sp_background_check" className="text-sm text-foreground cursor-pointer">Background Check</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp_drug_test" name="drug_test" />
                              <Label htmlFor="sp_drug_test" className="text-sm text-foreground cursor-pointer">Drug Test</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_skills" className="text-foreground text-sm">Skills & Expertise</Label>
                          <Textarea
                            id="sp_skills"
                            name="skills"
                            placeholder="List your key skills and service expertise..."
                            rows={3}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_personality" className="text-foreground text-sm">Business Personality & Approach</Label>
                          <Textarea
                            id="sp_personality"
                            name="personality"
                            placeholder="Describe your business approach and work style..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sp_hobbies" className="text-foreground text-sm">Hobbies</Label>
                            <Input
                              id="sp_hobbies"
                              name="hobbies"
                              placeholder="Personal interests"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sp_interests" className="text-foreground text-sm">Interests</Label>
                            <Input
                              id="sp_interests"
                              name="interests"
                              placeholder="Professional interests"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {languages.slice(0, 12).map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`sp-lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`sp-lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_letters_rec" className="text-foreground text-sm">Letters of Recommendation</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="sp_letters_rec"
                              name="letters_of_rec"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              multiple
                              className="hidden"
                            />
                            <label htmlFor="sp_letters_rec" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Upload letters of recommendation</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB each)</p>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-foreground text-sm">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, State"
                        required
                        className="bg-background text-foreground border-border"
                      />
                      {isCommunityOnly && (
                        <p className="text-xs text-muted-foreground">
                          You will automatically join the community for this location
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-foreground text-sm">
                        {profileType === 'professional' && 'Professional Bio'}
                        {profileType === 'service-provider' && 'Business Description'}
                        {profileType === 'agency' && 'Agency Description'}
                        {profileType === 'estates' && 'About'}
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Describe your experience and expertise"
                        rows={4}
                        required
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    {profileType === 'agency' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Business Type</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_is_company" name="is_company" />
                              <Label htmlFor="agency_is_company" className="text-sm text-foreground cursor-pointer">Company</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_is_individual" name="is_individual" />
                              <Label htmlFor="agency_is_individual" className="text-sm text-foreground cursor-pointer">Individual</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_year_founded" className="text-foreground text-sm">Year Founded</Label>
                          <Input
                            id="agency_year_founded"
                            name="year_founded"
                            type="number"
                            min="1900"
                            max="2026"
                            placeholder="2010"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_years_experience" className="text-foreground text-sm">Years Experience in this Field</Label>
                          <Input
                            id="agency_years_experience"
                            name="years_experience"
                            type="number"
                            min="0"
                            max="50"
                            placeholder="e.g. 15"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                          <Input
                            id="agency_linkedin_url"
                            name="linkedin_url"
                            type="url"
                            placeholder="https://linkedin.com/company/youragency"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_website_url" className="text-foreground text-sm">Website URL</Label>
                          <Input
                            id="agency_website_url"
                            name="website_url"
                            type="url"
                            placeholder="https://youragency.com"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Staff Options</Label>
                          <div className="flex gap-4">
                            {genderOptions.map((gender) => (
                              <div key={gender} className="flex items-center space-x-2">
                                <Checkbox id={`agency-staff-${gender}`} name="staff_options" value={gender} />
                                <Label htmlFor={`agency-staff-${gender}`} className="text-sm text-foreground cursor-pointer">
                                  {gender}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_business_hours" className="text-foreground text-sm">Business Hours</Label>
                          <Input
                            id="agency_business_hours"
                            name="business_hours"
                            placeholder="Mon-Fri 9am-5pm"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Availability</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {workAvailability.map((availability) => (
                              <div key={availability} className="flex items-center space-x-2">
                                <Checkbox id={`agency-availability-${availability}`} name="availability" value={availability} />
                                <Label htmlFor={`agency-availability-${availability}`} className="text-sm text-foreground cursor-pointer">
                                  {availability}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Comfortable With</Label>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-pets" name="comfortable_with" value="Pets" />
                              <Label htmlFor="agency-pets" className="text-sm text-foreground cursor-pointer">Pets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-children" name="comfortable_with" value="Children" />
                              <Label htmlFor="agency-children" className="text-sm text-foreground cursor-pointer">Children</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-travel" name="comfortable_with" value="Travel" />
                              <Label htmlFor="agency-travel" className="text-sm text-foreground cursor-pointer">Travel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-livein" name="comfortable_with" value="Live-In" />
                              <Label htmlFor="agency-livein" className="text-sm text-foreground cursor-pointer">Live-In</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing to Undergo</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_background_check" name="background_check" />
                              <Label htmlFor="agency_background_check" className="text-sm text-foreground cursor-pointer">Background Check</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_drug_test" name="drug_test" />
                              <Label htmlFor="agency_drug_test" className="text-sm text-foreground cursor-pointer">Drug Test</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_skills" className="text-foreground text-sm">Skills & Expertise</Label>
                          <Textarea
                            id="agency_skills"
                            name="skills"
                            placeholder="List your agency's key skills and expertise areas..."
                            rows={3}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_personality" className="text-foreground text-sm">Agency Culture & Personality</Label>
                          <Textarea
                            id="agency_personality"
                            name="personality"
                            placeholder="Describe your agency's culture and approach..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="agency_hobbies" className="text-foreground text-sm">Hobbies</Label>
                            <Input
                              id="agency_hobbies"
                              name="hobbies"
                              placeholder="Team activities, interests"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="agency_interests" className="text-foreground text-sm">Interests</Label>
                            <Input
                              id="agency_interests"
                              name="interests"
                              placeholder="Industry focus areas"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {languages.slice(0, 12).map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`agency-lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`agency-lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications & Credentials</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-licensed" name="certifications" value="Licensed" />
                              <Label htmlFor="agency-cert-licensed" className="text-sm text-foreground cursor-pointer">Licensed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-bonded" name="certifications" value="Bonded" />
                              <Label htmlFor="agency-cert-bonded" className="text-sm text-foreground cursor-pointer">Bonded</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-insured" name="certifications" value="Insured" />
                              <Label htmlFor="agency-cert-insured" className="text-sm text-foreground cursor-pointer">Insured</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-verified" name="certifications" value="Verified Agency" />
                              <Label htmlFor="agency-cert-verified" className="text-sm text-foreground cursor-pointer">Verified Agency</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-bbb" name="certifications" value="BBB Accredited" />
                              <Label htmlFor="agency-cert-bbb" className="text-sm text-foreground cursor-pointer">BBB Accredited</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-member" name="certifications" value="Industry Association Member" />
                              <Label htmlFor="agency-cert-member" className="text-sm text-foreground cursor-pointer">Industry Association</Label>
                            </div>
                          </div>
                          <Input
                            id="agency_other_certifications"
                            name="other_certifications"
                            placeholder="Other certifications (comma separated)"
                            className="bg-background text-foreground border-border mt-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_letters_rec" className="text-foreground text-sm">Letters of Recommendation</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="agency_letters_rec"
                              name="letters_of_rec"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              multiple
                              className="hidden"
                            />
                            <label htmlFor="agency_letters_rec" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Upload letters of recommendation</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB each)</p>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {profileType === 'estates' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Role Type</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_principal" name="is_principal" />
                              <Label htmlFor="is_principal" className="text-sm text-foreground cursor-pointer">Principal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_estate_staff" name="is_estate_staff" />
                              <Label htmlFor="is_estate_staff" className="text-sm text-foreground cursor-pointer">Estate Staff</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_title" className="text-foreground text-sm">If Estate Staff, what is your title?</Label>
                          <Select name="estates_title">
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select your title" />
                            </SelectTrigger>
                            <SelectContent className="bg-card max-h-[300px]">
                              {professionalTitles.map((title) => (
                                <SelectItem key={title} value={title.toLowerCase().replace(/\s+/g, '-')}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                          <Input
                            id="estates_linkedin_url"
                            name="linkedin_url"
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_website_url" className="text-foreground text-sm">Website URL</Label>
                          <Input
                            id="estates_website_url"
                            name="website_url"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border border-border rounded-lg p-3">
                            {languages.map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`estates-lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`estates-lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_hobbies" className="text-foreground text-sm">Hobbies</Label>
                          <Textarea
                            id="estates_hobbies"
                            name="hobbies"
                            placeholder="List your hobbies..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_interests" className="text-foreground text-sm">Interests</Label>
                          <Textarea
                            id="estates_interests"
                            name="interests"
                            placeholder="List your interests..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>
                      </>
                    )}

                    {profileType === 'professional' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                          <Input
                            id="linkedin_url"
                            name="linkedin_url"
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website_url" className="text-foreground text-sm">Website URL</Label>
                          <Input
                            id="website_url"
                            name="website_url"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skills" className="text-foreground text-sm">Skills</Label>
                          <Textarea
                            id="skills"
                            name="skills"
                            placeholder="List your key skills and expertise..."
                            rows={3}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="salary_min" className="text-foreground text-sm">Salary Expectation (Min)</Label>
                            <Input
                              id="salary_min"
                              name="salary_min"
                              type="number"
                              placeholder="$50,000"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="salary_max" className="text-foreground text-sm">Salary Expectation (Max)</Label>
                            <Input
                              id="salary_max"
                              name="salary_max"
                              type="number"
                              placeholder="$100,000"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Work Availability</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {workAvailability.map((availability) => (
                              <div key={availability} className="flex items-center space-x-2">
                                <Checkbox id={`availability-${availability}`} name="work_availability" value={availability} />
                                <Label htmlFor={`availability-${availability}`} className="text-sm text-foreground cursor-pointer">
                                  {availability}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Work Preference</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {workPreference.map((pref) => (
                              <div key={pref} className="flex items-center space-x-2">
                                <Checkbox id={`preference-${pref}`} name="work_preference" value={pref} />
                                <Label htmlFor={`preference-${pref}`} className="text-sm text-foreground cursor-pointer">
                                  {pref}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing To</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="willing_travel" name="willing_travel" />
                              <Label htmlFor="willing_travel" className="text-sm text-foreground cursor-pointer">Travel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="willing_relocate" name="willing_relocate" />
                              <Label htmlFor="willing_relocate" className="text-sm text-foreground cursor-pointer">Relocate</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing to Undergo</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="background_check" name="background_check" />
                              <Label htmlFor="background_check" className="text-sm text-foreground cursor-pointer">Background Check</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="drug_test" name="drug_test" />
                              <Label htmlFor="drug_test" className="text-sm text-foreground cursor-pointer">Drug Test</Label>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="valid_drivers_license" name="valid_drivers_license" />
                          <Label htmlFor="valid_drivers_license" className="text-sm text-foreground cursor-pointer">
                            Valid Driver's License or Identification Card
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="own_car" name="own_car" />
                          <Label htmlFor="own_car" className="text-sm text-foreground cursor-pointer">
                            Own current registered car
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="valid_insurance" name="valid_insurance" />
                          <Label htmlFor="valid_insurance" className="text-sm text-foreground cursor-pointer">
                            Valid/current insurance
                          </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="birthday_month" className="text-foreground text-sm">Birthday (Month/Day)</Label>
                            <div className="flex gap-2">
                              <Input
                                id="birthday_month"
                                name="birthday_month"
                                type="number"
                                min="1"
                                max="12"
                                placeholder="MM"
                                className="bg-background text-foreground border-border w-20"
                              />
                              <Input
                                id="birthday_day"
                                name="birthday_day"
                                type="number"
                                min="1"
                                max="31"
                                placeholder="DD"
                                className="bg-background text-foreground border-border w-20"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="originally_from" className="text-foreground text-sm">Originally From</Label>
                            <Input
                              id="originally_from"
                              name="originally_from"
                              placeholder="City, State"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Animal Experience</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {animalExperience.map((animal) => (
                              <div key={animal} className="flex items-center space-x-2">
                                <Checkbox id={`animal-${animal}`} name="animal_experience" value={animal} />
                                <Label htmlFor={`animal-${animal}`} className="text-sm text-foreground cursor-pointer">
                                  {animal}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="medication_handling" name="medication_handling" />
                          <Label htmlFor="medication_handling" className="text-sm text-foreground cursor-pointer">
                            Experience Handling Medications
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Comfortable With</Label>
                          <div className="flex gap-4 flex-wrap">
                            {comfortLevels.map((level) => (
                              <div key={level} className="flex items-center space-x-2">
                                <Checkbox id={`comfort-${level}`} name="comfort_levels" value={level} />
                                <Label htmlFor={`comfort-${level}`} className="text-sm text-foreground cursor-pointer">
                                  {level}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cooking_experience" className="text-foreground text-sm">Cooking Experience</Label>
                          <Select name="cooking_experience">
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                              {cookingExperience.map((level) => (
                                <SelectItem key={level} value={level.toLowerCase()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4 border-t border-border pt-4 mt-4">
                          <h4 className="text-lg font-heading font-medium text-foreground">Previous Work History</h4>
                          <p className="text-xs text-muted-foreground">Add your previous work experience (you can add more after creating your profile)</p>
                          
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <div className="space-y-2">
                              <Label htmlFor="work_job_title" className="text-foreground text-sm">Job Title</Label>
                              <Input
                                id="work_job_title"
                                name="work_job_title"
                                placeholder="e.g. Estate Manager"
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="work_city" className="text-foreground text-sm">City Worked</Label>
                              <Input
                                id="work_city"
                                name="work_city"
                                placeholder="e.g. Beverly Hills, CA"
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="work_duties" className="text-foreground text-sm">Duties</Label>
                              <Textarea
                                id="work_duties"
                                name="work_duties"
                                placeholder="Describe your responsibilities..."
                                rows={2}
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 border-t border-border pt-4 mt-4">
                          <h4 className="text-lg font-heading font-medium text-foreground">References</h4>
                          <p className="text-xs text-muted-foreground">Add professional references (you can add more after creating your profile)</p>
                          
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="ref_name" className="text-foreground text-sm">Reference Name</Label>
                                <Input
                                  id="ref_name"
                                  name="ref_name"
                                  placeholder="Full name"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ref_relationship" className="text-foreground text-sm">Relationship</Label>
                                <Input
                                  id="ref_relationship"
                                  name="ref_relationship"
                                  placeholder="e.g. Former Employer"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="ref_phone" className="text-foreground text-sm">Phone Number</Label>
                                <Input
                                  id="ref_phone"
                                  name="ref_phone"
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ref_email" className="text-foreground text-sm">Email</Label>
                                <Input
                                  id="ref_email"
                                  name="ref_email"
                                  type="email"
                                  placeholder="email@example.com"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="letters_of_rec" className="text-foreground text-sm">Letters of Recommendation</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="letters_of_rec"
                              name="letters_of_rec"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              multiple
                              className="hidden"
                            />
                            <label htmlFor="letters_of_rec" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload letters of recommendation</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB each)</p>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4 border-t border-border pt-4 mt-4">
                          <h4 className="text-lg font-heading font-medium text-foreground">Software & Systems Experience</h4>
                          <p className="text-xs text-muted-foreground">Select the systems you have experience with</p>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Home Automation</p>
                              <div className="grid grid-cols-3 gap-2">
                                {['Lutron', 'Crestron', 'Control4', 'Savant', 'KNX', 'AMX'].map((system) => (
                                  <div key={system} className="flex items-center space-x-2">
                                    <Checkbox id={`system-${system}`} name="software_systems" value={system} />
                                    <Label htmlFor={`system-${system}`} className="text-xs text-foreground cursor-pointer">{system}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Audio/Video</p>
                              <div className="grid grid-cols-3 gap-2">
                                {['Sonos', 'Apple TV', 'Roku', 'Bang & Olufsen', 'Kaleidescape'].map((system) => (
                                  <div key={system} className="flex items-center space-x-2">
                                    <Checkbox id={`system-${system}`} name="software_systems" value={system} />
                                    <Label htmlFor={`system-${system}`} className="text-xs text-foreground cursor-pointer">{system}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Security</p>
                              <div className="grid grid-cols-3 gap-2">
                                {['Ring', 'Arlo', 'Nest Cam', 'ADT', 'Alarm.com', 'Avigilon'].map((system) => (
                                  <div key={system} className="flex items-center space-x-2">
                                    <Checkbox id={`system-${system}`} name="software_systems" value={system} />
                                    <Label htmlFor={`system-${system}`} className="text-xs text-foreground cursor-pointer">{system}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Climate & Pool</p>
                              <div className="grid grid-cols-3 gap-2">
                                {['Nest', 'Ecobee', 'Honeywell', 'iAquaLink', 'Pentair', 'Hayward'].map((system) => (
                                  <div key={system} className="flex items-center space-x-2">
                                    <Checkbox id={`system-${system}`} name="software_systems" value={system} />
                                    <Label htmlFor={`system-${system}`} className="text-xs text-foreground cursor-pointer">{system}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Productivity & Management</p>
                              <div className="grid grid-cols-3 gap-2">
                                {['Google Workspace', 'Microsoft 365', 'Notion', 'Airtable', 'Monday.com', 'QuickBooks'].map((system) => (
                                  <div key={system} className="flex items-center space-x-2">
                                    <Checkbox id={`system-${system}`} name="software_systems" value={system} />
                                    <Label htmlFor={`system-${system}`} className="text-xs text-foreground cursor-pointer">{system}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column - Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-heading font-medium text-foreground tracking-tight mb-4">
                      Contact Information
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Your email and phone are used for verification only. Not displayed publicly.
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        className="bg-background text-foreground border-border"
                      />
                      <p className="text-xs text-muted-foreground">Not displayed publicly</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground text-sm">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        required
                        className="bg-background text-foreground border-border"
                      />
                      <p className="text-xs text-muted-foreground">Not displayed publicly</p>
                    </div>

                    {profileType === 'professional' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border border-border rounded-lg p-3">
                            {languages.map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications</Label>
                          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto border border-border rounded-lg p-3">
                            {certifications.slice(0, 20).map((cert) => (
                              <div key={cert} className="flex items-center space-x-2">
                                <Checkbox id={`cert-${cert}`} name="certifications" value={cert} />
                                <Label htmlFor={`cert-${cert}`} className="text-xs text-foreground cursor-pointer">
                                  {cert}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Scroll for more options</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hobbies" className="text-foreground text-sm">Hobbies</Label>
                          <Textarea
                            id="hobbies"
                            name="hobbies"
                            placeholder="List your hobbies..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interests" className="text-foreground text-sm">Interests</Label>
                          <Textarea
                            id="interests"
                            name="interests"
                            placeholder="List your interests..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>
                      </>
                    )}

                    <div className="bg-muted rounded-lg p-4 mt-6">
                      <h4 className="font-heading font-semibold text-foreground mb-2 text-sm">
                        Selected Participation Level
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium text-sm">
                            {selectedPlan?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPlan?.price}
                            {selectedPlan?.period}
                          </p>
                        </div>
                        {!isCommunityOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowPricing(true);
                              setCurrentStep(steps.length);
                            }}
                            className="text-primary text-xs"
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-4 border-t border-border/30">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-relaxed">
                    I agree to the <a href="/terms" className="text-primary">Standards & Conduct</a> and <a href="/privacy" className="text-primary">Privacy & Confidentiality</a>. Access varies by participation level.
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-12 py-4 text-base rounded-xl"
                >
                  {isCommunityOnly || selectedTier.includes('community') || selectedTier.includes('free')
                    ? 'Create Account & Join Community'
                    : 'Submit Application'}
                </Button>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  Approvals within 1-12 hours. We will Email & Text Your Approval.
                </p>

                {!isCommunityOnly && !selectedTier.includes('free') && (
                  <p className="text-xs text-muted-foreground text-center">
                    Your profile will be published after approval and payment is processed
                  </p>
                )}
              </form>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Show pricing immediately after onboarding completes (unless community-only)
  if (currentStep === steps.length && !showPricing && !isCommunityOnly) {
    setShowPricing(true);
  }

  return null;
}
