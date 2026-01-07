import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { pricingPlans, getPlansByUserType } from '../data/pricing';
import type { UserType, PricingTier } from '../types';

export default function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    (location.state?.userType as UserType) || null
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelectTier = (tierId: PricingTier) => {
    localStorage.setItem('selectedTier', tierId);
    
    navigate('/add-listing', { 
      state: { 
        selectedTier: tierId,
        fromPricing: true 
      } 
    });
  };

  const handleJoinCommunity = () => {
    // Redirect to profile type selection with community intent
    navigate('/add-listing', {
      state: {
        communityOnly: true
      }
    });
  };

  const getUserTypeLabel = (type: UserType): string => {
    switch (type) {
      case 'professional':
        return 'Private Estate Professionals';
      case 'business':
        return 'Estate Services Businesses';
      case 'agency':
        return 'Agencies';
      case 'estates':
        return 'Estate Principals';
    }
  };

  if (!selectedUserType) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="pricing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-5xl">
            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                Participation Levels
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access varies by participation level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <Card 
                className="p-12 bg-card text-card-foreground cursor-pointer border border-border/50 hover:border-primary/50 transition-all"
                onClick={() => setSelectedUserType('professional')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h2 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
                    Private Estate Professionals
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Seeking placements in private estates
                  </p>
                  <Button className="w-full bg-primary text-primary-foreground px-8 py-4">
                    View Plans
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-12 bg-card text-card-foreground cursor-pointer border border-border/50 hover:border-primary/50 transition-all"
                onClick={() => setSelectedUserType('business')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🏢</span>
                  </div>
                  <h2 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
                    Estate Services Businesses
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Providing services to private estates
                  </p>
                  <Button className="w-full bg-secondary text-secondary-foreground px-8 py-4">
                    View Plans
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-12 bg-card text-card-foreground cursor-pointer border border-border/50 hover:border-primary/50 transition-all"
                onClick={() => setSelectedUserType('agency')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
                    Agencies
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Placing professionals in estates
                  </p>
                  <Button className="w-full bg-accent text-accent-foreground px-8 py-4">
                    View Plans
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-12 bg-card text-card-foreground cursor-pointer border border-border/50 hover:border-primary/50 transition-all"
                onClick={() => setSelectedUserType('estates')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-tertiary/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🏰</span>
                  </div>
                  <h2 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
                    Estate Principals
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Hiring for private estates
                  </p>
                  <Button className="w-full bg-tertiary text-tertiary-foreground px-8 py-4">
                    View Plans
                  </Button>
                </div>
              </Card>
            </div>

            {/* Community-Only Card */}
            <Card className="p-12 bg-muted border-border/50 max-w-3xl mx-auto">
              <div className="text-center">
                <h2 className="text-4xl font-heading font-medium text-foreground mb-6 tracking-tight">
                  Just Join the Community
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Not looking for placements or hiring? Join the community to connect with your local estate network.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Professionals</p>
                    <p className="text-3xl font-heading font-medium text-foreground mb-4">
                      $1<span className="text-lg text-muted-foreground">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm text-foreground text-left">
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>Community access only</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>No placements or interviews</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Agencies & Principals</p>
                    <p className="text-3xl font-heading font-medium text-foreground mb-4">
                      $3.99<span className="text-lg text-muted-foreground">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm text-foreground text-left">
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>Community access only</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>No hiring or messaging tools</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={handleJoinCommunity}
                  size="lg"
                  className="bg-primary text-primary-foreground px-12 py-4"
                >
                  Join Community
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const plans = getPlansByUserType(selectedUserType);

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="pricing" />
      
      <main className="pt-48 pb-32">
        <div className="container mx-auto px-12 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => setSelectedUserType(null)}
            className="mb-12 text-foreground"
          >
            ← Back to User Types
          </Button>

          <div className="mb-16 text-center">
            <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
              {getUserTypeLabel(selectedUserType)}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Select your participation level.
            </p>
          </div>

          <div className={`grid grid-cols-1 ${plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3 max-w-6xl mx-auto' : plans.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8 mb-16`}>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="p-8 bg-card text-card-foreground border border-border/50 hover:border-primary/50 transition-all"
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

                <Button
                  onClick={() => handleSelectTier(plan.id)}
                  className="w-full bg-primary text-primary-foreground px-8 py-4"
                >
                  Continue
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-12 bg-muted border-border/50 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <p className="text-lg text-foreground leading-relaxed">
                Paid access provides tools, not placements.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Access varies by participation level. Features are unlocked according to your selected tier.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
