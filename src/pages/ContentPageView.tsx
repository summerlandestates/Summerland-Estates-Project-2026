import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card } from '@/components/ui/card';
import { contentManager, ContentPage } from '@/lib/contentManagement';

export default function ContentPageView() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    contentManager.init().then(() => {
      const found = contentManager.getPage(slug || '');
      setPage(found || null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
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

  if (!page) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              This page is unavailable or has not been published.
            </p>
            <Link to="/" className="text-primary font-semibold hover:underline">
              Return home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title={`${page.title} - Summerland Estates`}
        description={page.metaDescription || page.title}
        canonical={`/pages/${page.slug}`}
      />
      <NavBar currentPage="" />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-4">
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

          <Card className="p-6 sm:p-8 bg-card text-card-foreground">
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
