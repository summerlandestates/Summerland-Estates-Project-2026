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
    <div className="min-h-screen bg-background">
      <NavBar currentPage="home" />
      
      <main>
        {/* Hero Section */}
        <section className="pt-48 pb-32 border-b border-border/30">
          <div className="container mx-auto px-12 max-w-5xl text-center">
            <h1 className="text-7xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
              A private network connecting trusted estate professionals with discreet households worldwide.
            </h1>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
              Membership is reviewed to preserve the integrity of the network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/add-listing')}
                size="lg"
                className="bg-primary text-primary-foreground px-12 py-6 text-base"
              >
                Apply for Membership
              </Button>
              <Button
                onClick={() => navigate('/add-listing')}
                variant="outline"
                size="lg"
                className="border-border text-foreground px-12 py-6 text-base"
              >
                Request Access as a Principal
              </Button>
            </div>
          </div>
        </section>

        {/* Value Section */}
        <section className="py-32 border-b border-border/30">
          <div className="container mx-auto px-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Lock className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-medium text-foreground mb-4 tracking-tight">
                  Discretion by Design
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  All communication remains private and on-platform.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-medium text-foreground mb-4 tracking-tight">
                  Curated Membership
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every profile is reviewed. Standards come before scale.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-medium text-foreground mb-4 tracking-tight">
                  Professional Integrity
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  This is not an open marketplace. It is a trusted network.
                </p>
              </div>
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

        {/* Directory Section */}
        <section className="py-32">
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
