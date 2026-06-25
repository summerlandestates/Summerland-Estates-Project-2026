import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Instagram, 
  Newspaper, 
  MailOpen, 
  Handshake, 
  Megaphone, 
  Zap, 
  Calendar, 
  Globe, 
  Star,
  CheckCircle,
  Send,
  Target,
  Users,
  TrendingUp,
  Activity,
  Heart,
  DollarSign,
  ChevronRight,
  MousePointerClick,
  Eye
} from 'lucide-react';

export default function AdvertisementsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickOptions = [
    {
      icon: Mail,
      title: 'Email Blast',
      description: 'Reach our entire contact list with your message. Dedicated email to 8,500+ members.',
      price: '$12.99/email',
      action: 'Get Started',
      link: '/email-blast',
      features: ['Instant delivery', 'Open rate tracking', 'Click analytics', 'Target by category']
    },
    {
      icon: Instagram,
      title: 'Instagram Boost',
      description: 'Feature your post on our Instagram account with 10K+ engaged followers.',
      price: '$24.99/post',
      action: 'Coming Soon',
      link: null,
      features: ['Story feature included', 'Hashtag exposure', 'Engagement boost', 'Save to highlights']
    },
    {
      icon: Newspaper,
      title: 'Newsletter Feature',
      description: 'Get featured in our weekly industry newsletter sent to all premium members.',
      price: '$9.99/week',
      action: 'Learn More',
      link: '/sponsorship',
      features: ['Prime placement', 'Link to your profile', 'High engagement', 'Weekly recurring']
    }
  ];

  const sponsorshipTiers = [
    {
      icon: Calendar,
      title: 'Event Sponsorship',
      price: 'Custom Pricing',
      description: 'Sponsor networking events, workshops, or educational sessions.',
      benefits: [
        'Logo on all event materials',
        'Speaking opportunity',
        'VIP attendee list access',
        'Booth or table space',
        'Social media promotion',
        'Post-event thank you feature'
      ],
      color: 'from-[#6d7662] to-[#5a6250]'
    },
    {
      icon: Mail,
      title: 'Newsletter Sponsorship',
      price: 'From $49/month',
      description: 'Exclusive sponsor of our weekly newsletter to 8,500+ members.',
      benefits: [
        'Header banner placement',
        'Dedicated sponsor section',
        'Click tracking & analytics',
        'Subscriber growth reports',
        'Priority content features',
        'Brand mention in intro'
      ],
      color: 'from-[#A89F91] to-[#8A8279]'
    },
    {
      icon: Globe,
      title: 'Website Banner',
      price: 'From $29/week',
      description: 'Premium banner placement on high-traffic pages.',
      benefits: [
        'Homepage carousel spot',
        'Directory sidebar placement',
        'Profile page visibility',
        'Impression & click tracking',
        'Rotating display option',
        'Mobile & desktop optimized'
      ],
      color: 'from-[#23231f] to-[#151512]'
    },
    {
      icon: Star,
      title: 'Premium Content',
      price: 'Custom Packages',
      description: 'Sponsored articles, guides, and featured content.',
      benefits: [
        'Native article placement',
        'Expert positioning',
        'SEO benefits',
        'Social amplification',
        'Lead generation forms',
        'Evergreen visibility'
      ],
      color: 'from-[#8B7355] to-[#6B5344]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ee] pt-24">
      <SEOHead
        title="Advertise with Summerland Estates"
        description="Promote your services to our exclusive network. Reach high-net-worth households and estate professionals through email blasts, newsletter features, and sponsored placements."
        canonical="/advertisements"
      />
      <NavBar currentPage="advertisements" />
      
      <main className="pt-0 pb-16 md:pb-24">
        {/* Hero Banner Section - Like Homepage */}
        <section className="relative mb-16">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden">
            <img
              src="/images/advertise-bg.webp"
              alt="Advertise with Summerland Estates"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1d2018]/60 via-[#1d2018]/40 to-[#1d2018]/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 max-w-4xl mx-auto">
                <Badge className="mb-4 px-4 py-2 text-xs tracking-[0.2em] bg-white/10 text-white border-white/30 backdrop-blur-sm">
                  ADVERTISING OPPORTUNITIES
                </Badge>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  Reach Estate Professionals
                </h1>
                <p className="text-white/90 max-w-2xl mx-auto text-lg md:text-xl drop-shadow-md">
                  Connect with our exclusive network of 8,500+ verified estate professionals, 
                  private service providers, and high-net-worth households.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4">

          {/* Quick Advertising Options */}
          <div className="mb-20">
            <h2 className="font-heading text-2xl font-semibold text-[#23231f] mb-8 text-center">
              Quick Advertising
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickOptions.map((option) => (
                <Card 
                  key={option.title} 
                  className="group relative overflow-hidden rounded-[24px] border border-[#e8dfd3] bg-white p-0 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Top gradient bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A89F91] via-[#6d7662] to-[#A89F91] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="p-6">
                    {/* Price Tag - Prominent */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-br from-[#A89F91] to-[#8A8279] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {option.price}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5efe7] to-[#e8dfd3] text-[#a79f91] group-hover:from-[#A89F91] group-hover:to-[#8A8279] group-hover:text-white transition-all duration-500 shadow-sm">
                        <option.icon className="h-6 w-6" />
                      </div>
                    </div>

                    <h3 className="font-heading text-xl font-semibold text-[#23231f] mb-3 group-hover:text-[#A89F91] transition-colors duration-300">
                      {option.title}
                    </h3>
                    <p className="text-sm text-[#6b665f] mb-5 leading-relaxed">
                      {option.description}
                    </p>

                    <ul className="space-y-3 mb-6">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#6b665f] group-hover:text-[#4f4a43] transition-colors duration-300">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full rounded-full bg-[#a79f91] text-white hover:bg-[#8A8279] group-hover:shadow-lg transition-all duration-300 font-medium"
                      onClick={() => option.link ? navigate(option.link) : null}
                      disabled={!option.link}
                    >
                      {option.action}
                      {option.link && <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sponsorship Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A89F91] to-[#8A8279] text-white shadow-lg">
                  <Handshake className="h-7 w-7" />
                </div>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-[#23231f] mb-4">
                Sponsorship Opportunities
              </h2>
              <p className="text-[#6b665f] max-w-2xl mx-auto">
                Build lasting partnerships with our community. Choose the sponsorship tier 
                that aligns with your marketing goals and budget.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sponsorshipTiers.map((tier) => (
                <Card 
                  key={tier.title} 
                  className="group relative overflow-hidden rounded-[24px] border border-[#e8dfd3] bg-white p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A89F91]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.color} text-white flex-shrink-0 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                        <tier.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl font-semibold text-[#23231f] group-hover:text-[#A89F91] transition-colors duration-300">
                          {tier.title}
                        </h3>
                        <div className="mt-2 inline-block bg-gradient-to-r from-[#f5efe7] to-[#fcfaf7] text-[#A89F91] px-3 py-1 rounded-full text-sm font-bold border border-[#e8dfd3]">
                          {tier.price}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#6b665f] mb-4">
                      {tier.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#4f4a43]">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A89F91]/10 flex-shrink-0 mt-0.5">
                            <Zap className="w-3 h-3 text-[#A89F91]" />
                          </div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline"
                      className="w-full rounded-full border-[#d6cdc0] text-[#5c5a51] hover:bg-[#A89F91] hover:text-white hover:border-[#A89F91] transition-all duration-300 group-hover:shadow-md"
                      onClick={() => navigate('/sponsorship')}
                    >
                      <Megaphone className="w-4 h-4 mr-2" />
                      Inquire Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Email Blast Process Section */}
          <div className="mb-20">
            <Card className="rounded-[24px] border border-[#e8dfd3] bg-gradient-to-br from-[#f8f4ee] to-[#fcfaf7] p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6d7662] text-white">
                      <Send className="h-5 w-5" />
                    </div>
                    <Badge className="bg-[#6d7662]/10 text-[#6d7662] border-[#6d7662]/20">
                      Only $12.99
                    </Badge>
                  </div>
                  <h2 className="font-heading text-3xl font-semibold text-[#23231f] mb-4">
                    Email Blast Campaigns
                  </h2>
                  <p className="text-[#6b665f] mb-6">
                    Send a dedicated email directly to our entire network. Perfect for 
                    announcements, promotions, hiring needs, or special offers.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d7662] text-white text-sm font-medium flex-shrink-0">1</div>
                      <div>
                        <p className="font-medium text-[#23231f]">Compose Your Message</p>
                        <p className="text-sm text-[#6b665f]">Write your email with our easy-to-use editor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d7662] text-white text-sm font-medium flex-shrink-0">2</div>
                      <div>
                        <p className="font-medium text-[#23231f]">Pay & Submit</p>
                        <p className="text-sm text-[#6b665f]">Secure payment via Stripe ($12.99)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d7662] text-white text-sm font-medium flex-shrink-0">3</div>
                      <div>
                        <p className="font-medium text-[#23231f]">Admin Review</p>
                        <p className="text-sm text-[#6b665f]">We review within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d7662] text-white text-sm font-medium flex-shrink-0">4</div>
                      <div>
                        <p className="font-medium text-[#23231f]">Send & Track</p>
                        <p className="text-sm text-[#6b665f]">Email sent + delivery analytics</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="rounded-full bg-[#6d7662] px-8 text-white hover:bg-[#5f6756]"
                    onClick={() => navigate('/email-blast')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create Email Blast
                  </Button>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e8dfd3]">
                  <h4 className="font-semibold text-[#23231f] mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#A89F91]" />
                    Targeting Options
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#f8f4ee] rounded-lg">
                      <Users className="w-5 h-5 text-[#6d7662]" />
                      <div>
                        <p className="font-medium text-sm text-[#23231f]">All Members</p>
                        <p className="text-xs text-[#6b665f]">8,500+ total subscribers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#f8f4ee] rounded-lg">
                      <UserIcon className="w-5 h-5 text-[#A89F91]" />
                      <div>
                        <p className="font-medium text-sm text-[#23231f]">Professionals Only</p>
                        <p className="text-xs text-[#6b665f]">Private staff & service providers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#f8f4ee] rounded-lg">
                      <BuildingIcon className="w-5 h-5 text-[#8B7355]" />
                      <div>
                        <p className="font-medium text-sm text-[#23231f]">Businesses & Agencies</p>
                        <p className="text-xs text-[#6b665f]">Service companies & agencies</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-[#e8dfd3]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b665f]">Average Open Rate</span>
                      <span className="font-semibold text-[#23231f]">42%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-[#6b665f]">Average Click Rate</span>
                      <span className="font-semibold text-[#23231f]">18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Section - With proper cards and icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            <Card className="group relative overflow-hidden p-6 text-center border-[#e8dfd3] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6d7662] to-[#8B9A7C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6d7662]/10 text-[#6d7662] group-hover:bg-[#6d7662] group-hover:text-white transition-all duration-300">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#6d7662] mb-1">8,500+</p>
              <p className="text-sm text-[#6b665f]">Active Members</p>
            </Card>
            
            <Card className="group relative overflow-hidden p-6 text-center border-[#e8dfd3] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A89F91] to-[#C4B8A8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A89F91]/10 text-[#A89F91] group-hover:bg-[#A89F91] group-hover:text-white transition-all duration-300">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#A89F91] mb-1">42%</p>
              <p className="text-sm text-[#6b665f]">Avg. Open Rate</p>
            </Card>
            
            <Card className="group relative overflow-hidden p-6 text-center border-[#e8dfd3] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7355] to-[#A68B6A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B7355]/10 text-[#8B7355] group-hover:bg-[#8B7355] group-hover:text-white transition-all duration-300">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#8B7355] mb-1">10K+</p>
              <p className="text-sm text-[#6b665f]">Instagram Followers</p>
            </Card>
            
            <Card className="group relative overflow-hidden p-6 text-center border-[#e8dfd3] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23231f] to-[#4a4a42] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#23231f]/10 text-[#23231f] group-hover:bg-[#23231f] group-hover:text-white transition-all duration-300">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#23231f] mb-1">$12.99</p>
              <p className="text-sm text-[#6b665f]">Email Blast Price</p>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="rounded-[24px] border border-[#e8dfd3] bg-gradient-to-br from-[#6d7662] to-[#5a6250] p-8 text-center text-white">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold mb-4">
              Ready to Reach Our Network?
            </h3>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              Get started with an email blast today or inquire about custom sponsorship packages 
              tailored to your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="rounded-full bg-white text-[#6d7662] hover:bg-white/90 px-8"
                onClick={() => navigate('/email-blast')}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Email Blast
              </Button>
              <Button 
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white/10 px-8"
                onClick={() => navigate('/sponsorship')}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Explore Sponsorships
              </Button>
            </div>
          </Card>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <p className="text-[#6b665f] mb-2">
              Questions about advertising?
            </p>
            <p className="font-semibold text-[#23231f]">
              Email us at:{' '}
              <a 
                href="mailto:summerlandestates@summerlandestates.com" 
                className="text-[#6d7662] hover:underline"
              >
                summerlandestates@summerlandestates.com
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Icons for targeting options
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
