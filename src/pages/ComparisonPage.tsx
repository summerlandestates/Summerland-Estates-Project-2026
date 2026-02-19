import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Star, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { listings } from '../data/listings';
import { compareProfiles } from '../utils/profileComparison';
import type { ComparisonData } from '../types';

export default function ComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const { profileIds } = location.state || {};
    
    if (!profileIds || profileIds.length < 2) {
      navigate('/saved-profiles');
      return;
    }

    const profiles = listings.filter(l => profileIds.includes(l.id));
    const comparison = compareProfiles(profiles);
    setComparisonData(comparison);
  }, [location.state, navigate]);

  if (!comparisonData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <Button
            onClick={() => navigate('/saved-profiles')}
            variant="ghost"
            className="mb-8 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Saved Profiles
          </Button>

          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Profile Comparison
            </h1>
            <p className="text-lg text-muted-foreground">
              Comparing {comparisonData.profiles.length} profiles to help you make the best decision
            </p>
          </div>

          {/* Similarities */}
          {comparisonData.similarities.length > 0 && (
            <Card className="p-8 bg-card text-card-foreground mb-8">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-success" />
                Similarities
              </h2>
              <ul className="space-y-2">
                {comparisonData.similarities.map((similarity, index) => (
                  <li key={index} className="flex items-start text-foreground">
                    <span className="mr-3 text-success">•</span>
                    <span>{similarity}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {comparisonData.profiles.map((profile) => (
              <Card key={profile.id} className="bg-card text-card-foreground overflow-hidden">
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-1">
                      {profile.name}
                    </h3>
                    <p className="text-muted-foreground">{profile.role}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {profile.category}
                    </Badge>
                    {profile.verified && (
                      <Badge variant="outline" className="border-success text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-accent" />
                      {profile.location}
                    </div>
                    <div className="flex items-center text-foreground">
                      <Star className="w-4 h-4 mr-2 fill-accent text-accent" />
                      {profile.rating}/5.0
                    </div>
                    <div className="text-foreground">
                      {profile.experienceYears} years experience
                    </div>
                    {profile.hourlyRate && (
                      <div className="text-foreground font-semibold">
                        {profile.hourlyRate}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted"
                    onClick={() => navigate(`/profile/${profile.id}`)}
                  >
                    View Full Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pros */}
            <Card className="p-8 bg-card text-card-foreground">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center">
                <ThumbsUp className="w-6 h-6 mr-3 text-success" />
                Strengths
              </h2>
              <div className="space-y-6">
                {Object.entries(comparisonData.pros).map(([name, pros]) => (
                  <div key={name} className="border-l-2 border-success pl-4">
                    <h3 className="font-heading font-semibold text-foreground mb-2">
                      {name}
                    </h3>
                    <ul className="space-y-1">
                      {pros.map((pro, index) => (
                        <li key={index} className="text-sm text-foreground flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-success flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cons */}
            <Card className="p-8 bg-card text-card-foreground">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center">
                <ThumbsDown className="w-6 h-6 mr-3 text-warning" />
                Considerations
              </h2>
              <div className="space-y-6">
                {Object.entries(comparisonData.cons).map(([name, cons]) => (
                  <div key={name} className="border-l-2 border-warning pl-4">
                    <h3 className="font-heading font-semibold text-foreground mb-2">
                      {name}
                    </h3>
                    {cons.length > 0 ? (
                      <ul className="space-y-1">
                        {cons.map((con, index) => (
                          <li key={index} className="text-sm text-foreground flex items-start">
                            <XCircle className="w-4 h-4 mr-2 mt-0.5 text-warning flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No significant concerns</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Key Differences */}
          <Card className="p-8 bg-card text-card-foreground mt-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              Key Differences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(comparisonData.differences).map(([name, differences]) => (
                <div key={name} className="border-l-2 border-primary pl-4">
                  <h3 className="font-heading font-semibold text-foreground mb-3">
                    {name}
                  </h3>
                  <ul className="space-y-2">
                    {differences.map((diff, index) => (
                      <li key={index} className="text-sm text-foreground">
                        <span className="text-primary mr-2">•</span>
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="mt-12 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/saved-profiles')}
              className="border-border text-foreground hover:bg-muted"
            >
              Back to Saved Profiles
            </Button>
            <Button
              onClick={() => window.print()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Print Comparison
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
