import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="about" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight">
              Our Philosophy
            </h1>
          </div>

          <div className="space-y-8">
            <Card className="p-12 bg-card text-card-foreground border-border/50">
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-loose mb-6 text-lg">
                  Exceptional households struggle to find professionals they can trust.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  Exceptional professionals struggle to access the right opportunities without compromising privacy or dignity.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  Traditional hiring is loud, public, and transactional.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  That approach fails in confidential environments.
                </p>
                <p className="text-foreground leading-relaxed mb-6">
                  This network exists to do things differently.
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-card text-card-foreground">
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  Discretion is not optional.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  Professionalism is not commoditized.
                </p>
                <p className="text-foreground leading-relaxed mb-6">
                  Trust is built through standards, not scale.
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-card text-card-foreground">
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  Every member is reviewed.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  Every placement is treated with care.
                </p>
                <p className="text-foreground leading-relaxed mb-6">
                  Every interaction meets a higher bar.
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-card text-card-foreground">
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  This is not an open marketplace.
                </p>
                <p className="text-foreground leading-relaxed mb-6">
                  It is a private network for those who understand the responsibility that comes with access.
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-card text-card-foreground">
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  Growth is intentional.
                </p>
                <p className="text-foreground leading-relaxed mb-4">
                  Reputation matters.
                </p>
                <p className="text-foreground leading-relaxed mb-6">
                  Privacy comes first.
                </p>
                <p className="text-sm text-muted-foreground italic border-t border-border/30 pt-6">
                  Access varies by participation level.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card text-card-foreground text-center">
                <div className="text-4xl font-heading font-bold text-primary mb-2">500+</div>
                <div className="text-foreground">Vetted Professionals</div>
              </Card>
              <Card className="p-6 bg-card text-card-foreground text-center">
                <div className="text-4xl font-heading font-bold text-primary mb-2">1,200+</div>
                <div className="text-foreground">Successful Placements</div>
              </Card>
              <Card className="p-6 bg-card text-card-foreground text-center">
                <div className="text-4xl font-heading font-bold text-primary mb-2">98%</div>
                <div className="text-foreground">Satisfaction Rate</div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
