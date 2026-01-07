import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Star, CheckCircle, Mail, Phone, Share2, Send, Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import UpgradePrompt from '../components/UpgradePrompt';
import { listings } from '../data/listings';
import { getVisibilityRules, formatNameForDisplay, canAccessProfile } from '@/utils/profileVisibility';
import type { PricingTier } from '../types';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = listings.find((l) => l.id === id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [isPublicView, setIsPublicView] = useState(true);
  const [profileIndex, setProfileIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check user tier
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsPublicView(!loggedIn);
    
    if (loggedIn) {
      const tier = localStorage.getItem('userTier') as PricingTier | undefined;
      setUserTier(tier);
    }

    // Get profile index for access control
    if (id) {
      const index = listings.findIndex(l => l.id === id);
      setProfileIndex(index);
    }
    
    const saved = localStorage.getItem('savedProfiles');
    if (saved && id) {
      const savedIds = JSON.parse(saved);
      setIsSaved(savedIds.includes(id));
    }

    const connections = localStorage.getItem('connections');
    if (connections && id) {
      const connectedIds = JSON.parse(connections);
      setIsConnected(connectedIds.includes(id));
    }
  }, [id]);

  // Check if user can access this profile
  const canAccess = canAccessProfile(userTier, profileIndex, isPublicView);
  const visibilityRules = getVisibilityRules(userTier, isPublicView);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const url = window.location.href;
    const subject = `Check out ${listing?.name}'s profile`;
    const body = `I thought you might be interested in this profile:\n\n${listing?.name} - ${listing?.role}\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRefer = () => {
    const url = window.location.href;
    const subject = `Referral: ${listing?.name} - ${listing?.role}`;
    const body = `I would like to refer ${listing?.name} for your consideration.\n\nProfile: ${url}\n\nReason for referral: [Please add your comments here]`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleToggleSave = () => {
    if (!id) return;
    
    const saved = localStorage.getItem('savedProfiles');
    let savedIds = saved ? JSON.parse(saved) : [];
    
    if (isSaved) {
      savedIds = savedIds.filter((savedId: string) => savedId !== id);
      setIsSaved(false);
    } else {
      savedIds.push(id);
      setIsSaved(true);
    }
    
    localStorage.setItem('savedProfiles', JSON.stringify(savedIds));
  };

  const handleToggleConnect = () => {
    if (!id) return;
    
    const connections = localStorage.getItem('connections');
    let connectedIds = connections ? JSON.parse(connections) : [];
    
    if (isConnected) {
      connectedIds = connectedIds.filter((connectedId: string) => connectedId !== id);
      setIsConnected(false);
    } else {
      connectedIds.push(id);
      setIsConnected(true);
    }
    
    localStorage.setItem('connections', JSON.stringify(connectedIds));
  };

  const getProfileStatusLabel = (status?: string) => {
    switch (status) {
      case 'available-for-hire':
        return 'Available for Hire';
      case 'actively-hiring':
        return 'Actively Hiring';
      case 'community-only':
        return 'Just here for the Community';
      default:
        return null;
    }
  };

  const getProfileStatusColor = (status?: string) => {
    switch (status) {
      case 'available-for-hire':
        return 'bg-success text-white';
      case 'actively-hiring':
        return 'bg-primary text-primary-foreground';
      case 'community-only':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Profile Not Found
            </h1>
            <Button
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Directory
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user cannot access this profile, show upgrade prompt
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="mb-8 text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Directory
            </Button>

            <UpgradePrompt
              feature="Full Profile Access"
              message="Additional profiles are available with a paid participation level."
              currentTier={userTier}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = formatNameForDisplay(listing, visibilityRules.canViewFullName);
  const displayPhoto = visibilityRules.canViewPhoto ? listing.profilePhoto : 'https://via.placeholder.com/400x400/e5e5e5/666666?text=Profile';

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-5xl">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-8 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Directory
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 lg:sticky lg:top-32 lg:self-start">
              <Card className="p-8 bg-card text-card-foreground">
                <div className="relative mb-6">
                  <img
                    src={displayPhoto}
                    alt={displayName}
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                  {listing.isOnlineNow && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-success text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Online Now
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                      {displayName}
                    </h1>
                    <p className="text-xl text-muted-foreground">{listing.role}</p>
                    {!listing.isOnlineNow && listing.lastOnline && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Last online: {new Date(listing.lastOnline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground"
                    >
                      {listing.category}
                    </Badge>
                    {listing.verified && (
                      <Badge
                        variant="outline"
                        className="border-success text-success"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {listing.profileStatus && (
                      <Badge className={getProfileStatusColor(listing.profileStatus)}>
                        {getProfileStatusLabel(listing.profileStatus)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-foreground">
                    <Star className="w-5 h-5 mr-2 fill-accent text-accent" />
                    <span className="font-semibold">{listing.rating}</span>
                    <span className="text-muted-foreground ml-1">/5.0</span>
                  </div>

                  {visibilityRules.canViewLocation && (
                    <div className="flex items-center text-foreground">
                      <MapPin className="w-5 h-5 mr-2 text-accent" />
                      <span>{listing.location}</span>
                    </div>
                  )}

                  {listing.category !== 'Business' && (
                    <div className="flex items-center text-foreground">
                      <Calendar className="w-5 h-5 mr-2 text-accent" />
                      <span>{listing.experienceYears} years experience</span>
                    </div>
                  )}

                  {listing.availability && (
                    <Badge className="bg-success text-white">
                      Available Now
                    </Badge>
                  )}

                  {listing.category === 'Business' && listing.businessWebsite && visibilityRules.canViewContactInfo && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center text-sm text-foreground">
                        <span className="w-4 h-4 mr-2 text-accent">🌐</span>
                        <a href={listing.businessWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  {visibilityRules.canSendMessage ? (
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Mail className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/pricing')}
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Upgrade to Message
                    </Button>
                  )}
                  
                  {listing.category === 'Business' && (
                    <>
                      {listing.bookingEnabled && (
                        <Button
                          variant="outline"
                          className="w-full border-border text-foreground hover:bg-muted"
                          onClick={() => !visibilityRules.canViewFullProfile && navigate('/pricing')}
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Book Service
                        </Button>
                      )}
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Share'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted"
                      onClick={handleRefer}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Refer
                    </Button>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      className={isSaved ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}
                      onClick={handleToggleSave}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant={isConnected ? "default" : "outline"}
                      className={isConnected ? "bg-secondary text-secondary-foreground" : "border-border text-foreground hover:bg-muted"}
                      onClick={handleToggleConnect}
                    >
                      <UserPlus className={`w-4 h-4 mr-2 ${isConnected ? 'fill-current' : ''}`} />
                      {isConnected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {!visibilityRules.canViewDetailedInfo ? (
                <UpgradePrompt
                  feature="Full Profile Details"
                  message="Full profile information is available with a paid participation level."
                  currentTier={userTier}
                />
              ) : (
                <div className="space-y-6">
                  <Card className="p-6 bg-card text-card-foreground">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                      About
                    </h2>
                    <p className="text-foreground leading-relaxed text-sm">{listing.bio}</p>
                    
                    {listing.hourlyRate && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold text-foreground mb-2">Rate</h3>
                        <p className="text-lg font-semibold text-primary">{listing.hourlyRate}</p>
                      </div>
                    )}
                  </Card>

                  {listing.languages && listing.languages.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                        Languages
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.languages.map((language, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-secondary text-secondary-foreground"
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {listing.workHistory && listing.workHistory.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                        Work History
                      </h2>
                      <div className="space-y-4">
                        {listing.workHistory.map((job, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <h3 className="text-base font-heading font-semibold text-foreground">
                              {job.jobTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.city} • {job.startDate} - {job.endDate}
                            </p>
                            <ul className="space-y-1">
                              {job.duties.map((duty, dutyIndex) => (
                                <li key={dutyIndex} className="text-foreground text-xs flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{duty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {listing.technicalSkills && listing.technicalSkills.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                        Technical Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.technicalSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-muted text-muted-foreground text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {listing.certifications && listing.certifications.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                        Certifications
                      </h2>
                      <ul className="space-y-2 text-sm">
                        {listing.certifications.map((cert, index) => (
                          <li key={index} className="flex items-start text-foreground">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-success flex-shrink-0" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {listing.reviews && listing.reviews.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground border-2 border-accent">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-heading font-bold text-foreground">
                          Reviews
                        </h2>
                        <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                          Premium
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {listing.reviews.map((review) => (
                          <div key={review.id} className="border-l-2 border-primary pl-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground text-sm">{review.reviewerName}</h3>
                                  {review.verified && (
                                    <CheckCircle className="w-3 h-3 text-success" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{review.reviewerRole}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating
                                        ? 'fill-accent text-accent'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-foreground text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
