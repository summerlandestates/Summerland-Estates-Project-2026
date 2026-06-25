import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Megaphone, Target, TrendingUp, Users } from 'lucide-react';

export default function AdvertisementsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="advertisements" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Advertisements & Promotions
            </h1>
            <p className="text-lg text-muted-foreground">
              Partner with Summerland Estates to reach our exclusive network of high-net-worth households and estate professionals.
            </p>
          </div>

          {/* Advertisement Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="p-6 bg-card text-card-foreground border-[#A89F91]/30 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  Featured Listings
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get your services featured at the top of search results and category pages.
                </p>
                <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white">
                  Learn More
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card text-card-foreground border-[#A89F91]/30 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  Targeted Ads
                </h3>
                <p className="text-muted-foreground mb-4">
                  Reach specific demographics and locations with our targeted advertising solutions.
                </p>
                <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white">
                  Learn More
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card text-card-foreground border-[#A89F91]/30 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-[#A89F91]" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  Sponsorships
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sponsor events, newsletters, and premium content to maximize your brand exposure.
                </p>
                <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white">
                  Learn More
                </Button>
              </div>
            </Card>
          </div>

          {/* Contact Information Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-8 text-center">
              Get in Touch
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="p-8 bg-card text-card-foreground">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                    Send us a message
                  </h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="bg-background text-foreground border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="bg-background text-foreground border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-foreground">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-foreground">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-card text-card-foreground">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-foreground mb-1">
                        Email
                      </h3>
                      <p className="text-muted-foreground break-all text-sm">summerlandestates@summerlandestates.com</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card text-card-foreground">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">
                        Office
                      </h3>
                      <p className="text-muted-foreground">
                        123 Estate Lane<br />
                        Beverly Hills, CA 90210
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-[#A89F91] to-[#8A8279] text-white">
                  <h3 className="font-heading font-semibold mb-2">
                    Business Hours
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Advertising Stats */}
          <Card className="p-8 bg-gradient-to-r from-[#A89F91]/10 to-[#8A8279]/10 border-[#A89F91]/30">
            <div className="text-center">
              <Users className="w-16 h-16 text-[#A89F91] mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Reach Our Exclusive Network
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div>
                  <div className="text-3xl font-bold text-[#A89F91] mb-2">10,000+</div>
                  <p className="text-muted-foreground">Active Members</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#A89F91] mb-2">500+</div>
                  <p className="text-muted-foreground">Estate Professionals</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#A89F91] mb-2">50+</div>
                  <p className="text-muted-foreground">Premium Locations</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
