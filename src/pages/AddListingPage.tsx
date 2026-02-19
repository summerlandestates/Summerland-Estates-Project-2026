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
    content: 'Discretion is a requirement. Content that compromises trust is removed.'
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
    title: 'Standards & Conduct',
    content: 'Public marketing tactics and aggressive outreach are not permitted.'
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
    title: 'Responsibility Notice',
    content: 'Misaligned outreach or pressure-based tactics are not permitted.'
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
    title: 'Privacy Assurance',
    content: 'Privacy is enforced. Content and conduct are actively moderated.'
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

  // Profile type selection (for non-logged-in users)
  if (profileType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-5xl">
            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                {isCommunityOnly ? 'Create Profile to Join Community' : 'Apply for Membership'}
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
                onClick={() => setProfileType('professional')}
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
                onClick={() => setProfileType('service-provider')}
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
                onClick={() => setProfileType('agency')}
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
                onClick={() => setProfileType('estates')}
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
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
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
                          <Input
                            id="role"
                            name="role"
                            placeholder="Estate Manager, Private Chef"
                            required
                            className="bg-background text-foreground border-border"
                          />
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
                      </>
                    )}

                    {profileType === 'service-provider' && (
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
                    : 'Proceed to Payment'}
                </Button>

                {!isCommunityOnly && !selectedTier.includes('free') && (
                  <p className="text-sm text-muted-foreground text-center">
                    Your profile will be published after payment is processed
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
