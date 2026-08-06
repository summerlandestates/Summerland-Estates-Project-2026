import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import NativeAd from '../components/NativeAd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DirectoryGrid from '../components/DirectoryGrid';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Loader2
} from 'lucide-react';
import { fetchListings } from '../utils/listings';
import { professionalTitles, languages } from '../data/profileOptions';
import type { Listing, FilterState, PricingTier } from '../types';

const locationOptions = [
  'Beverly Hills, CA',
  'Los Angeles, CA',
  'Malibu, CA',
  'Santa Monica, CA',
  'Bel Air, CA',
  'Pacific Palisades, CA',
  'Newport Beach, CA',
  'San Francisco, CA',
  'New York, NY',
  'Miami, FL',
  'Palm Beach, FL',
  'Aspen, CO',
  'Greenwich, CT',
  'The Hamptons, NY',
];

const experienceOptions = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' },
];

const workAvailabilityOptions = [
  'Full Time',
  'Part Time',
  'Contract',
  'Seasonal',
  'Temporary',
  'Remote',
  'Live-In',
];

const comfortWithOptions = [
  'Children',
  'Pets',
  'Large Events',
  'Travel',
  'Overnight',
  'Live-In',
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [isPublicView, setIsPublicView] = useState(true);
  const itemsPerPage = 12;

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    location: '',
    availableNow: false,
    verifiedOnly: false,
    profileStatus: 'all',
    title: '',
    serviceType: '',
    language: '',
    workAvailability: '',
    hasBackgroundCheck: false,
    willingDrugTest: false,
    certifications: [],
    comfortWith: [],
    hasCar: false,
    yearsExperience: '',
    personalityType: '',
    cookingLevel: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsPublicView(!loggedIn);
    if (loggedIn) {
      const tier = localStorage.getItem('userTier') as PricingTier | undefined;
      setUserTier(tier);
    }

    const loadListings = async () => {
      try {
        setLoading(true);
        const data = await fetchListings();
        setAllListings(data);
        setFilteredListings(data);
      } catch (err: any) {
        console.error('Failed to load listings:', err);
        setError(err.message || 'Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, allListings]);

  const applyFilters = () => {
    let filtered = [...allListings];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.name.toLowerCase().includes(query) ||
          listing.role.toLowerCase().includes(query) ||
          listing.bio.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        (listing) => listing.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Title filter
    if (filters.title) {
      filtered = filtered.filter((listing) =>
        listing.role.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    // Available now
    if (filters.availableNow) {
      filtered = filtered.filter((listing) => listing.availability);
    }

    // Verified only
    if (filters.verifiedOnly) {
      filtered = filtered.filter((listing) => listing.verified);
    }

    // Background check
    if (filters.hasBackgroundCheck) {
      filtered = filtered.filter((listing) => listing.backgroundCheckAvailable || listing.willingToBackgroundCheck);
    }

    // Drug test willing
    if (filters.willingDrugTest) {
      filtered = filtered.filter((listing) => listing.willingToDrugTest);
    }

    // Has car
    if (filters.hasCar) {
      filtered = filtered.filter((listing) => listing.hasCarAndInsurance);
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter((listing) => 
        listing.languages?.some(lang => lang.toLowerCase().includes(filters.language!.toLowerCase()))
      );
    }

    // Years experience filter
    if (filters.yearsExperience) {
      filtered = filtered.filter((listing) => {
        const years = listing.experienceYears;
        switch (filters.yearsExperience) {
          case '0-2': return years >= 0 && years <= 2;
          case '3-5': return years >= 3 && years <= 5;
          case '6-10': return years >= 6 && years <= 10;
          case '10+': return years > 10;
          default: return true;
        }
      });
    }

    // Certifications filter
    if (filters.certifications && filters.certifications.length > 0) {
      filtered = filtered.filter((listing) =>
        filters.certifications!.some(cert => 
          listing.certifications?.some(c => c.toLowerCase().includes(cert.toLowerCase()))
        )
      );
    }

    // Comfort with filter
    if (filters.comfortWith && filters.comfortWith.length > 0) {
      filtered = filtered.filter((listing) => {
        return filters.comfortWith!.every(comfort => {
          switch (comfort) {
            case 'Children': return listing.willingToWorkWithKids;
            case 'Pets': return listing.willingToWorkWithAnimals;
            case 'Travel': return listing.willingToTravel;
            case 'Overnight': return listing.willingToStayOvernight;
            case 'Live-In': return listing.willingToLiveOnSite;
            default: return true;
          }
        });
      });
    }

    // Profile status
    if (filters.profileStatus && filters.profileStatus !== 'all') {
      filtered = filtered.filter((listing) => listing.profileStatus === filters.profileStatus);
    }

    setFilteredListings(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      location: '',
      availableNow: false,
      verifiedOnly: false,
      profileStatus: 'all',
      title: '',
      serviceType: '',
      language: '',
      workAvailability: '',
      hasBackgroundCheck: false,
      willingDrugTest: false,
      certifications: [],
      comfortWith: [],
      hasCar: false,
      yearsExperience: '',
      personalityType: '',
      cookingLevel: '',
    });
    setSearchQuery('');
  };

  const toggleCertification = (cert: string) => {
    setFilters(prev => ({
      ...prev,
      certifications: prev.certifications?.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...(prev.certifications || []), cert]
    }));
  };

  const toggleComfortWith = (comfort: string) => {
    setFilters(prev => ({
      ...prev,
      comfortWith: prev.comfortWith?.includes(comfort)
        ? prev.comfortWith.filter(c => c !== comfort)
        : [...(prev.comfortWith || []), comfort]
    }));
  };

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  const activeFilterCount = [
    filters.category !== 'all',
    filters.location,
    filters.title,
    filters.availableNow,
    filters.verifiedOnly,
    filters.hasBackgroundCheck,
    filters.willingDrugTest,
    filters.hasCar,
    filters.language,
    filters.yearsExperience,
    (filters.certifications?.length || 0) > 0,
    (filters.comfortWith?.length || 0) > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Find Estate Professionals - Summerland Estates"
        description="Search and connect with verified estate professionals including private chefs, housekeepers, estate managers, and luxury service providers."
        canonical="/search"
        ogImage="https://summerlandestates.com/images/home-banner.jpg"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Find Estate Professionals',
          description: 'Search and connect with verified estate professionals.',
          url: 'https://summerlandestates.com/search',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: currentListings.slice(0, 10).map((listing, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: listing.name,
              description: listing.bio || listing.role,
              url: `https://summerlandestates.com/profile/${listing.slug || listing.id}`,
            })),
          },
        }}
      />
      <NavBar currentPage="search" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Find Professionals
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search our network of verified estate professionals and service providers
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, location, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-background border-border rounded-xl"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Toggle & View Mode */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-[#A89F91] text-white">{activeFilterCount}</Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filteredListings.length} results
              </span>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#A89F91] text-white' : ''}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#A89F91] text-white' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 flex-shrink-0">
                <Card className="p-6 bg-card sticky top-32">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                    Filter Results
                  </h3>

                  <Accordion type="multiple" defaultValue={['category', 'location', 'availability']} className="space-y-2">
                    {/* Category */}
                    <AccordionItem value="category" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="staff">Professionals</SelectItem>
                            <SelectItem value="vendor">Vendors</SelectItem>
                            <SelectItem value="business">Service Providers</SelectItem>
                            <SelectItem value="agency">Agencies</SelectItem>
                            <SelectItem value="estates">Estates</SelectItem>
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Title/Role */}
                    <AccordionItem value="title" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Title / Role</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={filters.title || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, title: value }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All Titles" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="all">All Titles</SelectItem>
                            {professionalTitles.map((title) => (
                              <SelectItem key={title} value={title}>{title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Location */}
                    <AccordionItem value="location" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Location</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={filters.location || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All Locations" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="all">All Locations</SelectItem>
                            {locationOptions.map((loc) => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Availability */}
                    <AccordionItem value="availability" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Availability</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="availableNow"
                            checked={filters.availableNow}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availableNow: !!checked }))}
                          />
                          <Label htmlFor="availableNow" className="text-sm cursor-pointer">Available Now</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="verifiedOnly"
                            checked={filters.verifiedOnly}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: !!checked }))}
                          />
                          <Label htmlFor="verifiedOnly" className="text-sm cursor-pointer">Verified Only</Label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Experience */}
                    <AccordionItem value="experience" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Years Experience</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={filters.yearsExperience || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, yearsExperience: value }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Any Experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Experience</SelectItem>
                            {experienceOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Language */}
                    <AccordionItem value="language" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Language</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={filters.language || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Any Language" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="all">Any Language</SelectItem>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Background & Verification */}
                    <AccordionItem value="verification" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Verification</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasBackgroundCheck"
                            checked={filters.hasBackgroundCheck}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasBackgroundCheck: !!checked }))}
                          />
                          <Label htmlFor="hasBackgroundCheck" className="text-sm cursor-pointer">Background Check</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="willingDrugTest"
                            checked={filters.willingDrugTest}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, willingDrugTest: !!checked }))}
                          />
                          <Label htmlFor="willingDrugTest" className="text-sm cursor-pointer">Willing to Drug Test</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasCar"
                            checked={filters.hasCar}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasCar: !!checked }))}
                          />
                          <Label htmlFor="hasCar" className="text-sm cursor-pointer">Has Car & Insurance</Label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Comfort With */}
                    <AccordionItem value="comfortWith" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Comfortable With</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {comfortWithOptions.map((comfort) => (
                          <div key={comfort} className="flex items-center space-x-2">
                            <Checkbox
                              id={`comfort-${comfort}`}
                              checked={filters.comfortWith?.includes(comfort)}
                              onCheckedChange={() => toggleComfortWith(comfort)}
                            />
                            <Label htmlFor={`comfort-${comfort}`} className="text-sm cursor-pointer">{comfort}</Label>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Certifications */}
                    <AccordionItem value="certifications" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-medium">Certifications</AccordionTrigger>
                      <AccordionContent className="space-y-2 max-h-[200px] overflow-y-auto">
                        {['CPR / AED', 'First Aid', 'Food Handler', 'ServSafe', 'Butler Certification', 'Newborn Care Specialist', 'CDL'].map((cert) => (
                          <div key={cert} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cert-${cert}`}
                              checked={filters.certifications?.includes(cert)}
                              onCheckedChange={() => toggleCertification(cert)}
                            />
                            <Label htmlFor={`cert-${cert}`} className="text-sm cursor-pointer">{cert}</Label>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>

                {/* Sponsored Content */}
                <div className="mt-6">
                  <NativeAd position="sidebar" />
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="flex-1">
              {loading ? (
                <Card className="p-12 text-center">
                  <Loader2 className="w-12 h-12 mx-auto text-[#A89F91] animate-spin mb-4" />
                  <h3 className="text-lg font-medium">Loading profiles...</h3>
                </Card>
              ) : error ? (
                <Card className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    Could not load profiles
                  </h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                </Card>
              ) : currentListings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-[#A89F91] text-[#A89F91]"
                  >
                    Clear all filters
                  </Button>
                </Card>
              ) : (
                <DirectoryGrid
                  listings={currentListings}
                  viewMode={viewMode}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  userTier={userTier}
                  isPublicView={isPublicView}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
