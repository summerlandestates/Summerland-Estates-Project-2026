import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card } from '@/components/ui/card';
import { contentManager, ContentPage } from '@/lib/contentManagement';

export default function PrivacyPage() {
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const privacyPage = contentManager.getPage('privacy');
    setPage(privacyPage || null);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="privacy" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!page || !page.isPublished) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="privacy" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              The privacy policy is currently unavailable. Please check back later.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Privacy Policy - Summerland Estates"
        description="Read the Summerland Estates Privacy Policy to understand how we collect, use, and protect your personal information."
        canonical="/privacy"
      />
      <NavBar currentPage="privacy" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              {page.title}
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date(page.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <Card className="p-8 bg-card text-card-foreground">
            <div 
              className="prose prose-sm max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}