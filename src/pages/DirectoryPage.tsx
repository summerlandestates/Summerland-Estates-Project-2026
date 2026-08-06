import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import FilterToolbar from '../components/FilterToolbar';
import DirectoryGrid from '../components/DirectoryGrid';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import FAQSection from '../components/FAQSection';
import BannerAds from '../components/BannerAds';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BriefcaseBusiness, Search, Sparkles, Loader2 } from 'lucide-react';
import { fetchListings } from '../utils/listings';
import type { Listing, FilterState, PricingTier } from '../types';

const homepageCollections = [
  {
    title: 'Private Chef',
    image: '/public/images/private-chef.jpg',
    tags: ['Household Staff', 'Estate Managers', 'Housekeepers', 'Private Chefs', 'Butlers'],
  },
  {
    title: 'Housekeeping',
    image: '/public/images/housekeeping.jpg',
    tags: ['Lifestyle & Personal', 'Personal Assistants', 'Nannies', 'Companions'],
  },
  {
    title: 'Masseuse',
    image: '/public/images/Masseuse.jpg',
    tags: ['Specialty', 'Yacht Crew', 'Equestrian Staff', 'Stylists', 'Travel Companions'],
  },
  {
    title: 'Security',
    image: '/public/images/security.jpg',
    tags: ['Operations & Property', 'Property Managers', 'Maintenance Specialists', 'Security'],
  },
];

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [isPublicView, setIsPublicView] = useState(true);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...allListings];

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
  };

  const handleResetFilters = () => {
    setFilteredListings(allListings);
  };

  const handleCardClick = (slug: string, e?: React.MouseEvent) => {
    if (e && (e.target as HTMLElement).closest('.comparison-checkbox')) {
      return;
    }
    navigate(`/profile/${slug}`);
  };

  const directoryPreview = filteredListings.slice(0, 4);

  const homepageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Summerland Estates',
        url: 'https://summerlandestates.com',
        description:
          'A private network for trusted estate professionals and discreet households.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://summerlandestates.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Featured Estate Professionals',
        description: 'A curated selection of verified estate professionals and service providers.',
        url: 'https://summerlandestates.com',
        numberOfItems: directoryPreview.length,
        itemListElement: directoryPreview.map((listing, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: listing.name,
          description: listing.bio || listing.role,
          url: `https://summerlandestates.com/profile/${listing.slug || listing.id}`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f7f3ee] page-transition">
      <SEOHead
        title="Summerland Estates - Where Luxury Meets Trust"
        description="A private network for trusted estate professionals and discreet households. Connect with verified private chefs, housekeepers, estate managers, and luxury service providers."
        canonical="/"
        ogImage="https://summerlandestates.com/images/home-banner.jpg"
        schema={homepageSchema}
      />
      <NavBar currentPage="home" />

      <main className="pt-24 md:pt-28">
        <section className="pb-14 pt-6">
          <div className="container mx-auto max-w-7xl px-5 md:px-10">
            <Card className="overflow-hidden rounded-[28px] border border-[#d7cdc0] bg-white px-3 pb-6 pt-3 shadow-[0_24px_80px_rgba(74,73,63,0.08)] sm:px-4 sm:pb-8 sm:pt-4">
              <div className="overflow-hidden rounded-[28px] border border-[#e8dfd3]">
                <div className="relative h-[550px] sm:h-[480px] md:h-[520px]">
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet="/public/images/mobile-home-banner.webp"
                      type="image/webp"
                    />
                    <img
                      src="/public/images/home-banner.jpg"
                      alt="Summerland Estates"
                      className="h-full w-full object-cover object-[center_42%] md:object-[center_25%]"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1d2018]/30 via-[#1d2018]/10 to-[#1d2018]/30" />
                  <div className="absolute inset-x-0 top-4 flex justify-center px-4 text-center">
                    <div className="max-w-3xl">
                      <Badge className="rounded-full border border-white/40 bg-[#1d2018]/40 px-4 py-2 text-[11px] tracking-[0.32em] text-white backdrop-blur-md sm:text-xs">
                        Curated Estate Network
                      </Badge>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 sm:bottom-6">
                    <div className="flex w-full max-w-4xl flex-col gap-3 md:flex-row md:justify-center">
                      <Button
                        onClick={() => navigate('/add-listing')}
                        className="min-h-12 w-full rounded-full bg-[#a79f91] px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-[#948979] md:w-auto md:min-w-[190px]"
                      >
                        Become a Provider
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const directorySection = document.getElementById('directory-section');
                          if (directorySection) {
                            directorySection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="min-h-12 w-full rounded-full border-white/75 bg-white/92 px-5 py-4 text-sm font-semibold text-white shadow-lg backdrop-blur-sm hover:bg-[#5f6756] md:w-auto md:min-w-[190px]"
                      >
                        Find Professionals
                      </Button>
                      <Button
                        onClick={() => navigate('/open-roles')}
                        className="min-h-12 w-full rounded-full bg-[#6d7662] px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-[#5f6756] md:w-auto md:min-w-[250px]"
                      >
                        View Open Roles & Requests
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-4">
                {homepageCollections.map((collection) => (
                  <div key={collection.title} className="flex h-full flex-col gap-4">
                    <div className="group overflow-hidden rounded-[22px] border border-[#ddd3c6] bg-[#f5efe7] shadow-sm">
                      <div className="relative h-[190px]">
                        <img
                          src={collection.image}
                          alt={collection.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151812]/55 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                          <h3 className="font-heading text-2xl font-medium italic text-white">
                            {collection.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex h-full min-h-[215px] flex-1 flex-col rounded-[20px] border border-[#e6ddd2] bg-[#fcfaf7] px-4 py-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#6d7662]">
                        {collection.tags[0]}
                      </h4>
                      <ul className="space-y-1 text-sm leading-6 text-[#4f4a43]">
                        {collection.tags.slice(1).map((tag) => (
                          <li key={tag} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#a79f91]" />
                            <span>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="directory-section" className="pb-24">
          <div className="container mx-auto max-w-7xl px-5 md:px-10">
            <Card className="rounded-[32px] border border-[#d7cdc0] bg-white p-6 shadow-[0_18px_65px_rgba(74,73,63,0.07)] md:p-10">
              <div className="mb-10 text-center">
                <Badge className="mb-4 rounded-full border border-[#d7cdc0] bg-[#f8f4ee] px-4 py-2 text-xs tracking-[0.28em] text-[#6d7662]">
                  Network Directory
                </Badge>
                <h2 className="font-heading text-4xl font-medium tracking-tight text-[#23231f] md:text-5xl">
                  Network Directory
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#6b665f] md:text-lg">
                  Vetted professionals and trusted service providers. This homepage shows a curated preview, while the full directory remains available for deeper browsing.
                </p>
              </div>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card className="rounded-[24px] border border-[#e8dfd3] bg-[#fcfaf7] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6d7662]/10 text-[#6d7662]">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-[#23231f]">Refined Search</h3>
                      <p className="text-sm text-[#6b665f]">Search by role, location, and profile status.</p>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[24px] border border-[#e8dfd3] bg-[#fcfaf7] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a79f91]/15 text-[#8c7f70]">
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-[#23231f]">Open Roles</h3>
                      <p className="text-sm text-[#6b665f]">Explore current placements and service requests.</p>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[24px] border border-[#e8dfd3] bg-[#fcfaf7] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#23231f]/6 text-[#23231f]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-[#23231f]">Curated Preview</h3>
                      <p className="text-sm text-[#6b665f]">A few featured profiles are highlighted below.</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sponsored Banner Ads */}
              <div className="mb-8">
                <BannerAds position="directory_top" maxAds={3} />
              </div>

              <FilterToolbar
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {loading ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-10 h-10 mx-auto text-[#A89F91] animate-spin mb-3" />
                  <p className="text-muted-foreground">Loading featured profiles...</p>
                </div>
              ) : (
                <DirectoryGrid
                  listings={directoryPreview}
                  viewMode={viewMode}
                  currentPage={1}
                  totalPages={1}
                  onPageChange={() => undefined}
                  onCardClick={handleCardClick}
                  userTier={userTier}
                  isPublicView={isPublicView}
                />
              )}

              <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[24px] border border-[#ebe2d7] bg-[#fbf8f3] px-6 py-5 text-center md:flex-row md:text-left">
                <div>
                  <h3 className="font-heading text-2xl font-medium text-[#23231f]">
                    Looking for the full directory?
                  </h3>
                  <p className="mt-1 text-sm text-[#6b665f]">
                    Continue browsing every available profile, or jump directly into current open roles and requests.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/search')}
                    className="rounded-full border-[#d6cdc0] px-6 text-[#5c5a51] hover:bg-[#5f6756]"
                  >
                    Browse Full Directory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigate('/open-roles')}
                    className="rounded-full bg-[#6d7662] px-6 text-white hover:bg-[#5f6756]"
                  >
                    View Open Roles & Requests
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection 
          category="Directory"
          title="Directory FAQs"
          subtitle="Common questions about finding professionals and using our directory"
          maxItems={5}
          className="bg-muted/30"
        />
      </main>

      <Footer />
    </div>
  );
}
