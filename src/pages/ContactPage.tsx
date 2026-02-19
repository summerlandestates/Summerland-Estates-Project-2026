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
        </div>
      </main>

      <Footer />
    </div>
  );
}
