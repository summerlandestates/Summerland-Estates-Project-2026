import { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { serviceGroups } from '../data/serviceCategories';
import { Search, ChevronDown, Sparkles, Briefcase } from 'lucide-react';

const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.scroll-animate');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
};

export default function ServicesPage() {
  const pageRef = useScrollAnimation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());

  const allCategories = serviceGroups.flatMap((group) =>
    group.categories.map((cat) => ({ ...cat, groupName: group.name }))
  );

  const filteredCategories = allCategories.filter((cat) => {
    const q = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.groupName.toLowerCase().includes(q) ||
      cat.services.some((s) => s.toLowerCase().includes(q))
    );
  });

  const toggleCategory = (number: number) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white" ref={pageRef}>
      <SEOHead
        title="In-Home & Personal Services | Summerland Estates"
        description="Browse 30+ categories of in-home and personal services available through Summerland Estates, from housekeeping and childcare to pet care, events, and senior care."
        canonical="/services"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': 'https://summerlandestates.com/services',
              url: 'https://summerlandestates.com/services',
              name: 'In-Home & Personal Services',
              description:
                'Browse 30+ categories of in-home and personal services available through Summerland Estates.',
              isPartOf: {
                '@id': 'https://summerlandestates.com/#website',
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://summerlandestates.com/',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Services',
                  item: 'https://summerlandestates.com/services',
                },
              ],
            },
          ],
        }}
      />
      <NavBar currentPage="services" />

      <style>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-animate.delay-1 { transition-delay: 0.1s; }
        .scroll-animate.delay-2 { transition-delay: 0.2s; }
        .scroll-animate.delay-3 { transition-delay: 0.3s; }
        .scroll-animate.delay-4 { transition-delay: 0.4s; }

        .service-card {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(168, 159, 145, 0.18);
          border-color: #A89F91;
        }
      `}</style>

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-28 md:pt-32 bg-gradient-to-br from-[#F9F6F2] to-white">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,#A89F91_0%,transparent_50%)]" />
        <div className="relative z-10 container mx-auto px-4 md:px-8 text-center py-16 md:py-24">
          <div className="scroll-animate">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" />
              Service Directory
            </span>
          </div>
          <h1 className="scroll-animate delay-1 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            In-Home & <span className="text-[#A89F91]">Personal Services</span>
          </h1>
          <p className="scroll-animate delay-2 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            Browse the full range of services available through the Summerland Estates network. From everyday home care to specialty lifestyle support, find professionals across 30+ categories.
          </p>

          <div className="scroll-animate delay-3 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, categories, or keywords..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-foreground placeholder-gray-400 focus:outline-none focus:border-[#A89F91] focus:ring-1 focus:ring-[#A89F91] shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 md:px-8 max-w-6xl py-16 md:py-24">
        {searchQuery && (
          <div className="mb-10 scroll-animate">
            <p className="text-muted-foreground">
              Showing {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </div>
        )}

        {serviceGroups.map((group) => {
          const visibleCategories = searchQuery
            ? group.categories.filter((cat) =>
                filteredCategories.some((fc) => fc.number === cat.number)
              )
            : group.categories;

          if (visibleCategories.length === 0) return null;

          return (
            <section key={group.name} className="scroll-animate mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-5 h-5 text-[#A89F91]" />
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  {group.name}
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {visibleCategories.map((cat, catIndex) => (
                  <div
                    key={cat.number}
                    className={`scroll-animate delay-${(catIndex % 2) + 1} service-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.number)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">
                          {cat.emoji}
                        </span>
                        <div>
                          <h3 className="font-heading font-semibold text-foreground text-lg">
                            {cat.number}. {cat.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat.services.length} services
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#A89F91] flex-shrink-0 transition-transform duration-300 ${
                          openCategories.has(cat.number) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ${
                        openCategories.has(cat.number)
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pt-0">
                          <div className="border-t border-gray-100 pt-4">
                            <ul className="grid sm:grid-cols-2 gap-2">
                              {cat.services.map((service, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91] mt-1.5 flex-shrink-0" />
                                  {service}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-20 scroll-animate">
            <p className="text-xl text-muted-foreground mb-2">No services found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        )}

        <section className="scroll-animate mt-20">
          <div className="bg-[#8B7355] rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
              Find the Right Professional
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Summerland Estates connects you with trusted professionals across every category of in-home and personal service.
            </p>
            <a
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#8B7355] rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Search Professionals
              <Sparkles className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
