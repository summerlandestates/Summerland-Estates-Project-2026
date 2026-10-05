import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ArticleManager from '@/components/ArticleManager';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';

export default function MyArticlesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/my-articles' } });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A89F91]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead title="My Articles - Summerland Estates" noIndex={true} />
      <NavBar currentPage="" />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              My Articles
            </h1>
            <p className="text-muted-foreground">
              Write and manage your articles. Published articles appear on the News page.
            </p>
          </div>
          <Card className="border-border">
            <CardContent className="pt-6">
              <ArticleManager
                userRole="user"
                userId={user.id}
                userName={user.user_metadata?.full_name || user.email || 'Member'}
                userAvatar={user.user_metadata?.avatar_url}
                userTier={
                  (user.user_metadata?.tier as any) ||
                  (localStorage.getItem('userTier') as any) ||
                  'professional-basic'
                }
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
