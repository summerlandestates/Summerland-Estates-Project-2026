import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="terms" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated: March 15, 2024
            </p>
          </div>

          <Card className="p-8 bg-card text-card-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Agreement to Terms
              </h2>
              <p className="text-foreground leading-relaxed">
                By accessing or using Estate Directory, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Use of Service
              </h2>
              <div className="space-y-4 text-foreground">
                <p className="leading-relaxed">
                  Estate Directory provides a platform for connecting estate professionals with employers and service providers with clients. You agree to:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain the security of your account</li>
                  <li>Not misrepresent your qualifications or services</li>
                  <li>Not use the service for illegal purposes</li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Not engage in spam or harassment</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Account Registration
              </h2>
              <p className="text-foreground leading-relaxed">
                To use certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Profile Content
              </h2>
              <div className="space-y-4 text-foreground">
                <p className="leading-relaxed">
                  You retain ownership of content you post on your profile. By posting content, you grant us a license to use, display, and distribute that content on our platform. You represent that:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>You own or have rights to all content you post</li>
                  <li>Your content does not violate any laws or third-party rights</li>
                  <li>Your content is accurate and not misleading</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Verification and Background Checks
              </h2>
              <p className="text-foreground leading-relaxed">
                While we offer verification services, we do not guarantee the accuracy of information provided by users. Users are responsible for conducting their own due diligence when hiring or engaging services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Payments and Fees
              </h2>
              <div className="space-y-4 text-foreground">
                <p className="leading-relaxed">
                  Certain features require payment. By subscribing to paid services:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>You agree to pay all applicable fees</li>
                  <li>Fees are non-refundable except as required by law</li>
                  <li>We may change fees with 30 days notice</li>
                  <li>You authorize us to charge your payment method</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Prohibited Activities
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                You may not:
              </p>
              <ul className="space-y-2 text-foreground list-disc list-inside">
                <li>Use the service for any illegal purpose</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Collect user information without consent</li>
                <li>Interfere with the service's operation</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Post false, misleading, or fraudulent content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Intellectual Property
              </h2>
              <p className="text-foreground leading-relaxed">
                The service and its original content, features, and functionality are owned by Estate Directory and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-foreground leading-relaxed">
                The service is provided "as is" without warranties of any kind. We do not warrant that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Limitation of Liability
              </h2>
              <p className="text-foreground leading-relaxed">
                To the maximum extent permitted by law, Estate Directory shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Termination
              </h2>
              <p className="text-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Changes to Terms
              </h2>
              <p className="text-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Governing Law
              </h2>
              <p className="text-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Contact Information
              </h2>
              <p className="text-foreground leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 text-foreground">
                <p>Email: legal@estatedirectory.com</p>
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
