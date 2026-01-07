import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="privacy" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: March 15, 2024
            </p>
          </div>

          <Card className="p-8 bg-card text-card-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Introduction
              </h2>
              <p className="text-foreground leading-relaxed">
                Estate Directory ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our directory service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4 text-foreground">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="leading-relaxed">
                    We collect information you provide directly, including name, email address, phone number, location, professional experience, certifications, and other profile details.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <p className="leading-relaxed">
                    We automatically collect information about your interactions with our service, including pages viewed, search queries, and features used.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Device Information</h3>
                  <p className="leading-relaxed">
                    We collect device-specific information such as IP address, browser type, operating system, and device identifiers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                How We Use Your Information
              </h2>
              <ul className="space-y-2 text-foreground list-disc list-inside">
                <li>To create and maintain your profile</li>
                <li>To connect you with potential employers or service providers</li>
                <li>To process payments and transactions</li>
                <li>To send you updates and communications</li>
                <li>To improve our services and user experience</li>
                <li>To prevent fraud and ensure security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Information Sharing
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="space-y-2 text-foreground list-disc list-inside">
                <li>With your consent or at your direction</li>
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal requirements</li>
                <li>To protect our rights and prevent fraud</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Data Security
              </h2>
              <p className="text-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Your Rights
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-foreground list-disc list-inside">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Children's Privacy
              </h2>
              <p className="text-foreground leading-relaxed">
                Our service is not intended for children under 18. We do not knowingly collect information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Changes to This Policy
              </h2>
              <p className="text-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 text-foreground">
                <p>Email: privacy@estatedirectory.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Address: 123 Estate Lane, Beverly Hills, CA 90210</p>
              </div>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
