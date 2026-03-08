import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import FilterToolbar from '../components/FilterToolbar';
import DirectoryGrid from '../components/DirectoryGrid';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare, X, Shield, Users, Lock } from 'lucide-react';
import { listings } from '../data/listings';
import type { Listing, FilterState, PricingTier } from '../types';

gsap.registerPlugin(ScrollTrigger);

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [filteredListings, setFilteredListings] = useState<Listing[]>(listings);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [isPublicView, setIsPublicView] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is logged in and get their tier
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsPublicView(!loggedIn);
    
    if (loggedIn) {
      const tier = localStorage.getItem('userTier') as PricingTier | undefined;
      setUserTier(tier);
    }
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...listings];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.name.toLowerCase().includes(query) ||
          listing.role.toLowerCase().includes(query) ||
          listing.bio.toLowerCase().includes(query)
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        (listing) => listing.category.toLowerCase() === filters.category
      );
    }

    if (filters.location) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.availableNow) {
      filtered = filtered.filter((listing) => listing.availability);
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter((listing) => listing.verified);
    }

    if (filters.profileStatus && filters.profileStatus !== 'all') {
      filtered = filtered.filter((listing) => listing.profileStatus === filters.profileStatus);
    }

    setFilteredListings(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilteredListings(listings);
    setCurrentPage(1);
  };

  const handleCardClick = (id: string, e?: React.MouseEvent) => {
    if (e && (e.target as HTMLElement).closest('.comparison-checkbox')) {
      return;
    }
    navigate(`/profile/${id}`);
  };

  const handleToggleSelection = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter(selectedId => selectedId !== id));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can only compare up to 3 profiles at a time');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length < 2) {
      alert('Please select at least 2 profiles to compare');
      return;
    }
    navigate('/compare', { state: { profileIds: selectedForComparison } });
  };

  const handleClearSelection = () => {
    setSelectedForComparison([]);
  };

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentListings = filteredListings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="home" />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-24 border-b border-border/30 bg-gradient-to-b from-tertiary/20 to-background relative overflow-hidden">
          {/* Wheel background image - bottom right corner */}
          <div 
            className="absolute -bottom-32 -right-32 w-96 h-96 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'url(/favicon.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          />
          <div className="container mx-auto px-12 max-w-6xl text-center relative z-10">
            <div className="inline-block mb-6">
              <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-[#A89F91]/20 px-4 py-2 text-sm font-semibold">
                Premium Estate Services
              </Badge>
            </div>
            <h1 className="text-6xl md:text-7xl font-heading font-bold text-foreground mb-6 tracking-tight leading-tight">
              Premium Estate Services<br />
              <span className="text-[#A89F91]">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified, background-checked professionals who understand the unique needs of luxury estates. From housekeepers to private chefs, find exceptional service providers in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/add-listing')}
                size="lg"
                className="bg-[#A89F91] text-white hover:bg-[#8A8279] px-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Become a Provider
              </Button>
              <Button
                onClick={() => {
                  const directorySection = document.getElementById('directory-section');
                  if (directorySection) {
                    directorySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                variant="outline"
                size="lg"
                className="border-2 border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white px-10 transition-all duration-300 hover:-translate-y-1"
              >
                Find Professionals
              </Button>
            </div>
          </div>
        </section>

        {/* Value Section */}
        <section className="py-32 border-b border-border/30">
          <div className="container mx-auto px-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8 border-gray-200 hover:border-[#A89F91] transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#A89F91]/10 rounded-2xl">
                  <Lock className="w-10 h-10 text-[#A89F91]" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-4 tracking-tight">
                  Discretion by Design
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  All communication remains private and on-platform.
                </p>
              </Card>

              <Card className="text-center p-8 border-gray-200 hover:border-[#A89F91] transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#A89F91]/10 rounded-2xl">
                  <Shield className="w-10 h-10 text-[#A89F91]" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-4 tracking-tight">
                  Curated Membership
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  Every profile is reviewed. Standards come before scale.
                </p>
              </Card>

              <Card className="text-center p-8 border-gray-200 hover:border-[#A89F91] transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#A89F91]/10 rounded-2xl">
                  <Users className="w-10 h-10 text-[#A89F91]" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-4 tracking-tight">
                  Professional Integrity
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  This is not an open marketplace. It is a trusted network.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Philosophy Callout */}
        <section className="py-32 border-b border-border/30">
          <div className="container mx-auto px-12 max-w-4xl text-center">
            <h2 className="text-5xl font-heading font-medium text-foreground mb-12 tracking-tight leading-tight">
              Privacy isn't a setting. It's the foundation.
            </h2>
            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              size="lg"
              className="border-border text-foreground px-12 py-6 text-base"
            >
              Our Philosophy
            </Button>
          </div>
        </section>

        {/* Featured Professionals Section */}
        <section className="py-24 border-b border-border/30 bg-tertiary/10">
          <div className="container mx-auto px-12 max-w-7xl">
            <div className="mb-12 text-center">
              <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-[#A89F91]/20 px-4 py-2 text-sm font-semibold mb-4">
                Featured
              </Badge>
              <h2 className="text-4xl font-heading font-medium text-foreground mb-4 tracking-tight">
                Featured Professionals & Service Providers
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Premium members who have chosen to be highlighted in our network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.filter(l => l.verified).slice(0, 4).map((listing) => (
                <Card 
                  key={listing.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-[#A89F91]/30 bg-card"
                  onClick={() => navigate(`/profile/${listing.id}`)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-[#A89F91]/20 flex items-center justify-center mb-4 overflow-hidden">
                      {listing.profilePhoto ? (
                        <img src={listing.profilePhoto} alt={listing.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-[#A89F91]" />
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">{listing.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{listing.role}</p>
                    <p className="text-xs text-muted-foreground">{listing.location}</p>
                    {listing.verified && (
                      <Badge className="mt-3 bg-green-100 text-green-700 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white"
              >
                Get Featured on Homepage
              </Button>
            </div>
          </div>
        </section>

        {/* Directory Section */}
        <section id="directory-section" className="py-32">
          <div className="container mx-auto px-12 max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-5xl font-heading font-medium text-foreground mb-6 tracking-tight">
                Network Directory
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Vetted professionals and trusted service providers.
              </p>
            </div>

            <FilterToolbar
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {selectedForComparison.length >= 2 && (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg">
                <div className="container mx-auto px-12 max-w-7xl">
                  <Card className="p-4 bg-primary/90 border-primary-foreground/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GitCompare className="w-6 h-6" />
                        <span className="font-semibold">
                          Compare selected profiles
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                          className="text-primary-foreground hover:bg-primary-foreground/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                        <Button
                          onClick={handleCompare}
                          className="bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
                        >
                          Compare ({selectedForComparison.length})
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <DirectoryGrid
              listings={currentListings}
              viewMode={viewMode}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedForComparison={selectedForComparison}
              onToggleSelection={handleToggleSelection}
              onCardClick={handleCardClick}
              userTier={userTier}
              isPublicView={isPublicView}
            />
          </div>
        </section>

        {/* Trust Notice */}
        <section className="py-16 border-t border-border/30">
          <div className="container mx-auto px-12 max-w-4xl text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              This network is built on discretion.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Content that compromises trust is removed.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
