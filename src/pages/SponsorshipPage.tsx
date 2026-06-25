import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Handshake,
  Calendar,
  Mail,
  Globe,
  TrendingUp,
  Megaphone,
  Star,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Building2,
  User,
  DollarSign,
  MessageSquare,
  Users,
  Activity,
  Heart,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { emailNotifications } from '@/services/emailNotifications';

const sponsorshipTypes = [
  {
    id: 'event',
    name: 'Event Sponsorship',
    description: 'Sponsor our exclusive networking events, workshops, and galas.',
    icon: Calendar,
    price: 'From $500/event'
  },
  {
    id: 'newsletter',
    name: 'Newsletter Sponsorship',
    description: 'Reach thousands of estate professionals in our weekly newsletter.',
    icon: Mail,
    price: 'From $200/issue'
  },
  {
    id: 'website',
    name: 'Website Banner Ads',
    description: 'Premium banner placements on high-traffic directory pages.',
    icon: Globe,
    price: 'From $300/month'
  },
  {
    id: 'premium_content',
    name: 'Premium Content',
    description: 'Sponsored articles, featured listings, and spotlight profiles.',
    icon: Star,
    price: 'From $150/article'
  },
  {
    id: 'custom',
    name: 'Custom Partnership',
    description: 'Tailored multi-channel sponsorship packages.',
    icon: Handshake,
    price: 'Custom Quote'
  }
];

const budgetRanges = [
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2500', label: '$1,000 - $2,500' },
  { value: '2500-5000', label: '$2,500 - $5,000' },
  { value: '5000-10000', label: '$5,000 - $10,000' },
  { value: 'over-10000', label: 'Over $10,000' }
];

export default function SponsorshipPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    budgetRange: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to submit a sponsorship inquiry');
      navigate('/login', { state: { from: '/sponsorship' } });
    }
  }, [authLoading, user, navigate]);

  // Pre-fill user data when available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        companyName: prev.companyName || user.user_metadata?.company_name || '',
        contactName: prev.contactName || user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedType) newErrors.type = 'Please select a sponsorship type';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.budgetRange) newErrors.budgetRange = 'Please select a budget range';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const sponsorshipData = {
        user_id: user?.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone || null,
        website: formData.website || null,
        sponsorship_type: selectedType,
        budget_range: formData.budgetRange,
        message: formData.message || null,
        status: 'pending'
      };

      const { error } = await supabase.from('sponsorships').insert(sponsorshipData);

      if (error) throw error;

      // Send notification to user
      await emailNotifications.notifySponsorshipInquiry({
        userEmail: formData.email,
        userName: formData.contactName,
        companyName: formData.companyName,
        sponsorshipType: selectedType,
      });

      // Send notification to admin
      await emailNotifications.notifyAdminSponsorship(sponsorshipData);

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting sponsorship:', error);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <SEOHead
          title="Sponsorship Inquiry Submitted - Summerland Estates"
          description="Your sponsorship inquiry has been received. Our team will contact you shortly."
        />
        <NavBar currentPage="sponsorship" />
        
        <main className="pt-16 pb-16 min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-4">
                Inquiry Submitted!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in partnering with Summerland Estates. 
                Our sponsorship team will review your inquiry and contact you within 24-48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/')}>
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => navigate('/events')}>
                  View Events
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <SEOHead
        title="Sponsorship Opportunities - Summerland Estates"
        description="Partner with Summerland Estates. Sponsor events, newsletters, and premium content to maximize your brand exposure to estate professionals."
        canonical="/sponsorship"
      />
      <NavBar currentPage="sponsorship" />
      
      <main className="pt-0 pb-16">
        {/* Hero Banner Section */}
        <section className="relative mb-16">
          <div className="relative h-[380px] md:h-[450px] overflow-hidden">
            <img
              src="/images/sponser-ship.webp"
              alt="Sponsorship Opportunities"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1d2018]/70 via-[#1d2018]/50 to-[#1d2018]/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                  <Handshake className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">Partnership Opportunities</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  Sponsor Summerland Estates
                </h1>
                <p className="text-white/90 max-w-3xl mx-auto text-lg md:text-xl drop-shadow-md">
                  Connect your brand with thousands of estate professionals, luxury homeowners, 
                  and industry leaders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button - Now properly spaced below banner */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-[#A89F91]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Sponsorship Types - Improved Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sponsorshipTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <Card
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`group relative overflow-hidden p-0 cursor-pointer transition-all duration-500 hover:-translate-y-2 ${
                    isSelected
                      ? 'border-[#A89F91] ring-2 ring-[#A89F91]/20 shadow-lg'
                      : 'hover:border-[#A89F91]/50 hover:shadow-xl'
                  }`}
                >
                  {/* Top gradient bar on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A89F91] via-[#6d7662] to-[#A89F91] transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${isSelected ? 'bg-[#A89F91]' : 'bg-[#A89F91]/10 group-hover:bg-[#A89F91]'}`}>
                        <Icon className={`w-6 h-6 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-[#A89F91] group-hover:text-white'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 group-hover:text-[#A89F91] transition-colors duration-300">{type.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {type.description}
                        </p>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${isSelected ? 'bg-[#A89F91] text-white' : 'bg-[#f5efe7] text-[#A89F91] group-hover:bg-[#A89F91] group-hover:text-white'}`}>
                          {type.price}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-[#A89F91] rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Inquiry Form */}
          <Card className="max-w-3xl mx-auto p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#A89F91]/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-[#A89F91]" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-semibold">Submit Your Inquiry</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24-48 hours
                </p>
              </div>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Type Display */}
              {selectedType && (
                <div className="p-4 bg-[#A89F91]/5 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Selected Sponsorship</Label>
                  <p className="font-medium">
                    {sponsorshipTypes.find(t => t.id === selectedType)?.name}
                  </p>
                </div>
              )}
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Your company name"
                    className={errors.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="contactName">
                    <User className="w-4 h-4 inline mr-1" />
                    Contact Name *
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Full name"
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-red-500">{errors.contactName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.yourcompany.com"
                  />
                </div>

                {/* Budget Range */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="budgetRange">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Budget Range *
                  </Label>
                  <Select
                    value={formData.budgetRange}
                    onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                  >
                    <SelectTrigger className={errors.budgetRange ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.budgetRange && (
                    <p className="text-sm text-red-500">{errors.budgetRange}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your sponsorship goals, target audience, preferred dates, or any specific requirements..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Handshake className="w-4 h-4 mr-2" />
                      Submit Sponsorship Inquiry
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  By submitting, you agree to be contacted about sponsorship opportunities.
                </p>
              </div>
            </form>
          </Card>

          {/* Stats Section - With proper cards and icons */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden p-8 text-center border-[#e8dfd3] hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A89F91] to-[#C4B8A8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A89F91]/10 text-[#A89F91] group-hover:bg-[#A89F91] group-hover:text-white transition-all duration-300">
                  <Activity className="h-7 w-7" />
                </div>
              </div>
              <div className="text-4xl font-bold text-[#A89F91] mb-2">10K+</div>
              <div className="text-muted-foreground">Monthly Active Users</div>
            </Card>
            
            <Card className="group relative overflow-hidden p-8 text-center border-[#e8dfd3] hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6d7662] to-[#8B9A7C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6d7662]/10 text-[#6d7662] group-hover:bg-[#6d7662] group-hover:text-white transition-all duration-300">
                  <Users className="h-7 w-7" />
                </div>
              </div>
              <div className="text-4xl font-bold text-[#6d7662] mb-2">500+</div>
              <div className="text-muted-foreground">Estate Professionals</div>
            </Card>
            
            <Card className="group relative overflow-hidden p-8 text-center border-[#e8dfd3] hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7355] to-[#A68B6A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B7355]/10 text-[#8B7355] group-hover:bg-[#8B7355] group-hover:text-white transition-all duration-300">
                  <Heart className="h-7 w-7" />
                </div>
              </div>
              <div className="text-4xl font-bold text-[#8B7355] mb-2">85%</div>
              <div className="text-muted-foreground">High-Net-Worth Audience</div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
