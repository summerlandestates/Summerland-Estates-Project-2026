import { useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { 
  CheckCircle,
  Users, 
  Building2, 
  Briefcase, 
  Home, 
  BadgeCheck,
  Shield,
  Star,
  FileText,
  Flag,
  UserPlus,
  Search,
  MessageSquare,
  Camera,
  Award,
  Network,
  Calendar,
  XCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Lock,
  Eye,
  AlertCircle,
  Handshake
} from 'lucide-react';

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

// Platform features data
const platformFeatures = [
  { icon: UserPlus, title: 'Professional Profiles', description: 'Create detailed profiles showcasing your experience, skills, and credentials' },
  { icon: Search, title: 'Smart Search', description: 'Find the perfect match with advanced filters and location-based search' },
  { icon: Briefcase, title: 'Job Opportunities', description: 'Post and apply for jobs with our streamlined application system' },
  { icon: MessageSquare, title: 'Direct Messaging', description: 'Communicate privately and securely with potential matches' },
  { icon: Camera, title: 'Portfolio Showcase', description: 'Upload photos and showcase your best work to stand out' },
  { icon: BadgeCheck, title: 'Verification Badges', description: 'Build trust with optional identity and background verification' },
  { icon: Network, title: 'Professional Network', description: 'Connect with industry professionals and grow your network' },
  { icon: Calendar, title: 'Availability Management', description: 'Set your schedule and let others know when you\'re available' },
];

// What we are NOT data
const notPlatformItems = [
  'An employer',
  'A staffing agency',
  'An employment agency',
  'A recruiting agency',
  'A broker',
  'A referral service',
  'A management company',
  'A contractor',
  'A payroll company',
  'A property management company',
  'A home service provider',
];

// Badges data
const badgesData = [
  { icon: BadgeCheck, name: 'Identity Verified', means: 'Identity was verified through an independent provider', notMeans: 'Does not guarantee honesty or future conduct' },
  { icon: Shield, name: 'Background Check', means: 'A background screening process was completed', notMeans: 'Does not mean the person is "approved" or "safe"' },
  { icon: Award, name: 'Licensed', means: 'Licensing information was submitted or verified', notMeans: 'Does not guarantee current status for every job' },
  { icon: Lock, name: 'Insured', means: 'Insurance information was submitted or verified', notMeans: 'Does not guarantee coverage for every circumstance' },
];

// Safety tips
const safetyTips = [
  { icon: Users, title: 'Meet Safely', description: 'Choose public or familiar locations for initial meetings' },
  { icon: Eye, title: 'Verify Identity', description: 'Confirm who you\'re working with before proceeding' },
  { icon: FileText, title: 'Check References', description: 'Speak with previous clients or employers' },
  { icon: Shield, title: 'Confirm Credentials', description: 'Verify insurance and licenses where applicable' },
  { icon: Heart, title: 'Trust Your Instincts', description: 'If something feels off, don\'t proceed' },
  { icon: Flag, title: 'Report Issues', description: 'Help keep our community safe by reporting concerns' },
];

export default function HowItWorksPage() {
  const pageRef = useScrollAnimation();

  return (
    <div className="min-h-screen bg-white" ref={pageRef}>
      <SEOHead
        title="How Summerland Estates Works | Connecting Homeowners & Professionals"
        description="Learn how Summerland Estates connects homeowners, professionals, companies, and recruiters across the United States. Understand our platform, hiring process, and safety guidelines."
        canonical="/how-it-works"
        ogImage="/images/og-image.jpg"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://summerlandestates.com/how-it-works",
              "url": "https://summerlandestates.com/how-it-works",
              "name": "How Summerland Estates Works",
              "description": "Learn how Summerland Estates connects homeowners, professionals, companies, and recruiters across the United States.",
              "isPartOf": {
                "@id": "https://summerlandestates.com/#website"
              }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://summerlandestates.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "How It Works",
                  "item": "https://summerlandestates.com/how-it-works"
                }
              ]
            }
          ]
        }}
      />
      <NavBar currentPage="how-it-works" />

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

        .feature-card {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -12px rgba(168, 159, 145, 0.22);
          border-color: #A89F91;
        }
        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(2deg);
        }

        .responsibility-card {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .responsibility-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
        }
        .responsibility-card:hover .responsibility-icon {
          transform: scale(1.1);
          background-color: rgba(168, 159, 145, 0.2);
        }

        .badge-card {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .badge-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(168, 159, 145, 0.18);
        }

        .safety-card {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .safety-card:hover {
          transform: translateY(-4px);
          border-color: #A89F91;
          box-shadow: 0 16px 32px -12px rgba(168, 159, 145, 0.12);
        }
        .safety-card:hover .feature-icon {
          transform: scale(1.1) rotate(2deg);
          background-color: rgba(168, 159, 145, 0.2);
        }

        .feature-icon, .responsibility-icon {
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .premium-underline {
          transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-28 md:pt-32">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/images/how-it-works.png)',
            backgroundColor: '#2c2c2c',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        <div className="relative z-10 container mx-auto px-4 md:px-8 text-center pt-12 pb-16">
          <div className="scroll-animate">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="w-4 h-4" />
              How It Works
            </span>
          </div>
          <h1 className="scroll-animate delay-1 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            How <span className="text-[#A89F91]">Summerland Estates</span> Works
          </h1>
          <p className="scroll-animate delay-2 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            Connecting Homeowners, Professionals, Companies & Recruiters Across the United States
          </p>
          <div className="scroll-animate delay-3 flex flex-wrap items-center justify-center gap-8 text-white/70">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span>Homeowners</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Professionals</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span>Companies</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <span>Recruiters</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 md:px-8 max-w-6xl py-16">

        {/* Introduction & Goal */}
        <section className="scroll-animate mb-24 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-6">
            Our Purpose
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
            A Marketplace Built for the Home
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6">
            Summerland Estates is an online marketplace that makes it easy for homeowners, estate owners, businesses, recruiters, and home service professionals to find one another, communicate, and build working relationships.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
            Whether you are searching for an Estate Manager, Housekeeper, Private Chef, Nanny, Caregiver, Driver, Handyman, or another trusted home professional — Summerland Estates provides one centralized place to connect.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[#FAFAF8] border border-border rounded-2xl px-8 py-6">
            <span className="text-foreground font-medium">Our goal is simple:</span>
            <span className="text-[#A89F91] font-heading font-semibold text-lg italic">
              "Make finding the right people for the home easier."
            </span>
          </div>
        </section>

        {/* What Summerland Estates Is */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              The Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              What Summerland Estates Is
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A technology platform that brings the home services community together
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {platformFeatures.map((feature, index) => (
              <div
                key={index}
                className={`scroll-animate delay-${(index % 4) + 1} feature-card group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm`}
              >
                <div className="feature-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="scroll-animate delay-3 bg-[#FAFAF8] rounded-2xl p-8 text-center">
            <p className="text-foreground text-lg">
              We simply provide the <span className="text-[#A89F91] font-medium">platform</span> that helps people find one another.
            </p>
          </div>
        </section>

        {/* What Summerland Estates Is Not */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-4">
              <AlertCircle className="w-4 h-4" />
              Important Distinction
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              What Summerland Estates Is <span className="text-amber-600">Not</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding our role helps set the right expectations
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {notPlatformItems.map((item, index) => (
              <div
                key={index}
                className="scroll-animate feature-card flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-foreground font-medium text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="scroll-animate delay-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  We Do Not
                </h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Hire or employ professionals</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Supervise or assign work</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Negotiate compensation</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Recommend one professional over another</li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center md:text-left">
                  <Shield className="w-12 h-12 text-amber-500 mx-auto md:mx-0 mb-3" />
                  <p className="text-amber-900 font-medium text-lg">We do not guarantee</p>
                  <p className="text-amber-800 text-sm">results, safety, qualifications, or future conduct of any user.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Hiring Works */}
        <section className="scroll-animate mb-24">
          <div className="bg-[#F9F6F2] rounded-3xl p-10 md:p-16 relative overflow-hidden border border-[#A89F91]/10">
            {/* Decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#A89F91]/5" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#A89F91]/5 rounded-full -translate-y-1/2 translate-x-1/3" />

            <div className="relative z-10 text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
                <Briefcase className="w-4 h-4" />
                The Process
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                How Hiring Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Hiring decisions are made entirely between users. We simply provide the connection.
              </p>
            </div>

            <div className="relative z-10 grid lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  icon: Search,
                  title: 'Search',
                  homeowners: ['Who to interview'],
                  professionals: ['Which opportunities to pursue', 'Which clients to work with'],
                },
                {
                  step: '2',
                  icon: Eye,
                  title: 'Evaluate',
                  homeowners: ['Whether someone is the right fit', 'What services are performed'],
                  professionals: ['Their availability'],
                },
                {
                  step: '3',
                  icon: Handshake,
                  title: 'Agree',
                  homeowners: ['What to pay'],
                  professionals: ['Their own pricing (where applicable)'],
                },
                {
                  step: '4',
                  icon: CheckCircle,
                  title: 'Hire',
                  homeowners: ['Who to hire', 'When work begins'],
                  professionals: ['Whether to accept work'],
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`scroll-animate delay-${index + 1} group`}
                >
                  <div className="bg-white rounded-3xl p-6 md:p-8 h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#A89F91]/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A89F91] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="w-20 h-20 rounded-full border-2 border-[#A89F91] flex items-center justify-center group-hover:bg-[#A89F91]/5 transition-all duration-500">
                        <item.icon className="w-8 h-8 text-[#A89F91] group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#8B7355] text-white text-sm font-bold flex items-center justify-center shadow-md">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground text-center mb-5">{item.title}</h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-2">Homeowners Decide</p>
                        <ul className="space-y-2">
                          {item.homeowners.map((text, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-[#A89F91] flex-shrink-0 mt-0.5" />
                              {text}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-2">Professionals Decide</p>
                        <ul className="space-y-2">
                          {item.professionals.map((text, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-[#A89F91] flex-shrink-0 mt-0.5" />
                              {text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="scroll-animate delay-3 relative z-10 mt-14 text-center bg-[#8B7355] rounded-2xl p-6 shadow-sm">
              <p className="text-white font-medium text-lg">
                Summerland Estates does not participate in hiring decisions.
              </p>
            </div>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Responsibilities
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              User Responsibilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each user type has specific responsibilities on our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Homeowners */}
            <div className="scroll-animate delay-1 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="responsibility-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center">
                  <Home className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Homeowners</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                If you are hiring someone through Summerland Estates, you are responsible for making your own decisions.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Conduct interviews',
                  'Request references',
                  'Verify licenses & insurance',
                  'Review experience & ask questions',
                  'Determine fit for your household',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground text-sm">
                    <CheckCircle className="w-4 h-4 text-[#A89F91] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground italic border-t border-gray-100 pt-4">
                Every home is different. Only you can determine who is the best fit for your needs.
              </p>
            </div>

            {/* Professionals */}
            <div className="scroll-animate delay-2 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="responsibility-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Professionals</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Professionals are responsible for maintaining accurate profiles and keeping information current.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Work history & experience',
                  'Certifications & licenses',
                  'Insurance documentation',
                  'Photos, portfolio & availability',
                  'Comply with all applicable laws',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground text-sm">
                    <CheckCircle className="w-4 h-4 text-[#A89F91] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground italic border-t border-gray-100 pt-4">
                Accurate profiles build trust with potential clients and employers.
              </p>
            </div>

            {/* Companies */}
            <div className="scroll-animate delay-3 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="responsibility-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Companies</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Companies may create business profiles and advertise employment opportunities.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Job descriptions & eligibility',
                  'Wages, payroll & taxes',
                  'Insurance & compliance',
                  'Employment law compliance',
                  'Final hiring decisions',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground text-sm">
                    <CheckCircle className="w-4 h-4 text-[#A89F91] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground italic border-t border-gray-100 pt-4">
                Summerland Estates does not employ workers on behalf of companies.
              </p>
            </div>

            {/* Recruiters */}
            <div className="scroll-animate delay-4 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="responsibility-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Recruiters</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Recruiters may use Summerland Estates to identify qualified candidates and advertise opportunities.
              </p>
              <div className="bg-[#FAFAF8] rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Recruiters are responsible for ensuring their recruiting activities comply with all applicable laws and industry standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification & Background Checks */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
              <BadgeCheck className="w-4 h-4" />
              Trust & Verification
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Identity Verification & Background Checks
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verification is optional and should be considered one factor among many
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="scroll-animate delay-1 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="responsibility-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Identity Verification</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Some users may choose to verify their identity through one of our third-party verification partners. Identity verification simply confirms that the verification process was successfully completed.
              </p>
              <div className="bg-[#FAFAF8] rounded-xl p-4">
                <p className="text-sm text-foreground font-medium mb-1">It does not guarantee:</p>
                <p className="text-sm text-muted-foreground">Character, Honesty, Professional ability, Licensing, Safety, or Future conduct.</p>
              </div>
            </div>

            <div className="scroll-animate delay-2 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="responsibility-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Background Checks</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Some users may choose to complete an optional background screening through one of our independent third-party providers. A completed background check means only that the screening process was completed.
              </p>
              <div className="bg-[#FAFAF8] rounded-xl p-4">
                <p className="text-sm text-foreground font-medium mb-1">It should not be interpreted as:</p>
                <p className="text-sm text-muted-foreground">An endorsement, A recommendation, A guarantee, or A certification of safety.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {badgesData.map((badge, index) => (
              <div
                key={index}
                className={`scroll-animate delay-${index + 1} badge-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center flex-shrink-0">
                    <badge.icon className="w-6 h-6 text-[#A89F91]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-3">{badge.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{badge.means}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{badge.notMeans}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="scroll-animate delay-3 mt-10 bg-[#FAFAF8] rounded-2xl p-6 text-center">
            <p className="text-foreground text-lg">
              Verification should be considered <span className="text-[#A89F91] font-medium">one factor among many</span> when evaluating a professional.
            </p>
          </div>
        </section>

        {/* Reviews & Payments */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Community & Agreements
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Reviews & Payments
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="scroll-animate delay-1 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Star className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Reviews</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Reviews represent the personal opinions and experiences of individual users. Reviews are not endorsements by Summerland Estates.
              </p>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-amber-800 font-medium text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  We encourage honest, respectful, and constructive feedback.
                </p>
              </div>
            </div>

            <div className="scroll-animate delay-2 responsibility-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="responsibility-icon w-14 h-14 rounded-2xl bg-[#A89F91]/10 flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground">Payments</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Unless expressly stated otherwise, payment arrangements are made directly between users.
              </p>
              <div className="bg-[#FAFAF8] rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Summerland Estates is generally not a party to agreements regarding compensation, wages, pricing, scheduling, or services performed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety First */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Your Protection
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Safety First
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your safety is important. Take smart steps to protect yourself.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {safetyTips.map((tip, index) => (
              <div
                key={index}
                className={`scroll-animate delay-${(index % 3) + 1} safety-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm`}
              >
                <div className="feature-icon w-12 h-12 rounded-xl bg-[#A89F91]/10 flex items-center justify-center mb-4">
                  <tip.icon className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            ))}
          </div>

          <div className="scroll-animate delay-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-heading font-bold text-amber-900">Trust Your Instincts</h3>
            </div>
            <p className="text-amber-800 text-lg">
              If something doesn't feel right, don't move forward.
            </p>
          </div>
        </section>

        {/* Reporting Concerns */}
        <section className="scroll-animate mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A89F91]/10 text-[#8B7355] text-sm font-medium mb-4">
              <Flag className="w-4 h-4" />
              Keeping Our Community Safe
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Reporting Concerns
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us maintain a safe and trustworthy platform for everyone.
            </p>
          </div>

          <div className="scroll-animate delay-1 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#A89F91]/10 flex items-center justify-center mb-6">
                  <Flag className="w-7 h-7 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">Report Anything Suspicious</h3>
                <p className="text-muted-foreground mb-4">
                  If you believe a profile, job posting, review, or message violates our policies, please report it through the platform.
                </p>
                <p className="text-muted-foreground">
                  Our team reviews reports and may investigate, remove content, suspend accounts, or take other appropriate action.
                </p>
              </div>
              <div className="bg-[#FAFAF8] rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-4">We take action on reports involving:</h4>
                <ul className="space-y-3">
                  {['Fake or misleading profiles', 'Inappropriate messages', 'Fraudulent job postings', 'Harmful or abusive reviews'].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-foreground text-sm">
                      <CheckCircle className="w-4 h-4 text-[#A89F91] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Promise */}
        <section className="scroll-animate mb-24">
          <div className="bg-[#8B7355] rounded-3xl p-8 md:p-14 overflow-hidden relative">
            {/* Decorative circles */}
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute -bottom-20 left-1/3 w-40 h-40 bg-white/5 rounded-full" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Image and big title */}
              <div className="scroll-animate delay-1 relative">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/images/how-it-works.png)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#8B7355]/90 via-[#8B7355]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 md:p-10">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                      Mission &<br />Promise
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right side - Mission and Promise */}
              <div className="space-y-10">
                <div className="scroll-animate delay-2 group">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-white/80" />
                    <h3 className="text-2xl font-heading font-bold text-white">Our Mission</h3>
                  </div>
                  <div className="h-0.5 w-16 bg-white/40 mb-4 group-hover:w-24 transition-all duration-500" />
                  <p className="text-white/80 leading-relaxed">
                    Summerland Estates exists to make it easier for homeowners, estate owners, professionals, companies, and recruiters to connect. We believe finding trusted home professionals should be simple, transparent, and efficient.
                  </p>
                </div>

                <div className="scroll-animate delay-3 group">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-white/80" />
                    <h3 className="text-2xl font-heading font-bold text-white">Our Promise</h3>
                  </div>
                  <div className="h-0.5 w-16 bg-white/40 mb-4 group-hover:w-24 transition-all duration-500" />
                  <p className="text-white/80 leading-relaxed">
                    We believe finding great people shouldn't feel overwhelming. That's why we are committed to building a platform that is simple to use, transparent, respectful of your privacy, and focused on helping people make informed decisions.
                  </p>
                </div>

                <div className="scroll-animate delay-4 pt-6 border-t border-white/20">
                  <p className="text-white font-medium text-lg">
                    Our role is to make meaningful connections possible. Your role is to choose the people who are right for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
