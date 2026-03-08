import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="contact" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help.
            </p>
          </div>

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
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p className="text-muted-foreground">info@estatedirectory.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Phone
                    </h3>
                    <p className="text-muted-foreground">(555) 123-4567</p>
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

              <Card className="p-6 bg-gradient-1 text-primary-foreground">
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

          {/* Advertisements Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-8 text-center">
              Advertisements & Promotions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-card text-card-foreground border-[#A89F91]/30 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-[#A89F91]" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Email Blast</h3>
                  <p className="text-muted-foreground text-sm mb-4">Reach our entire contact list with your message</p>
                  <p className="text-2xl font-bold text-[#A89F91] mb-4">$12.99<span className="text-sm font-normal text-muted-foreground">/email</span></p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279]">Get Started</Button>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground border-[#A89F91]/30 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#A89F91]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Instagram Boost</h3>
                  <p className="text-muted-foreground text-sm mb-4">Feature your post on our Instagram account</p>
                  <p className="text-2xl font-bold text-[#A89F91] mb-4">$24.99<span className="text-sm font-normal text-muted-foreground">/post</span></p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279]">Get Started</Button>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground border-[#A89F91]/30 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#A89F91]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Weekly Newsletter</h3>
                  <p className="text-muted-foreground text-sm mb-4">Get featured in our weekly industry newsletter</p>
                  <p className="text-2xl font-bold text-[#A89F91] mb-4">$9.99<span className="text-sm font-normal text-muted-foreground">/week</span></p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279]">Get Started</Button>
                </div>
              </Card>
            </div>

            <Card className="mt-8 p-8 bg-[#A89F91]/5 border-[#A89F91]/20 text-center">
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">Custom Advertising Solutions</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Looking for a custom advertising package? Contact us to discuss sponsorship opportunities, 
                featured placements, and bulk advertising rates.
              </p>
              <Button variant="outline" className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white">
                Contact for Custom Packages
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
