import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, Eye, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Article } from '../types/articles';
import '../styles/article.css';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (article) {
      updateViewCount();
      loadRelatedArticles();
      updateSEO();
    }
  }, [article]);

  const loadArticle = async (articleSlug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', articleSlug)
        .eq('status', 'published')
        .single();
      if (error || !data) { navigate('/news'); return; }
      const row = data as Record<string, unknown>;
      setArticle({
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
        content: row.content as string,
        excerpt: (row.excerpt as string) || '',
        featuredImage: row.featured_image as string | undefined,
        metaTitle: row.meta_title as string | undefined,
        metaDescription: row.meta_description as string | undefined,
        authorId: (row.author_id as string) || '',
        authorName: (row.author_name as string) || '',
        authorAvatar: row.author_avatar as string | undefined,
        category: (row.category as string) || '',
        tags: (row.tags as string[]) || [],
        status: row.status as 'published',
        publishedAt: row.published_at as string | undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        readingTime: (row.reading_time as number) || 1,
        viewCount: (row.view_count as number) || 0,
      });
    } catch (error) {
      console.error('Error loading article:', error);
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const updateViewCount = async () => {
    if (!article) return;
    try {
      await supabase.from('articles').update({ view_count: article.viewCount + 1 }).eq('id', article.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const loadRelatedArticles = async () => {
    if (!article) return;
    try {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('category', article.category)
        .neq('id', article.id)
        .order('published_at', { ascending: false })
        .limit(3);
      const mapped: Article[] = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string, title: row.title as string, slug: row.slug as string,
        content: row.content as string, excerpt: (row.excerpt as string) || '',
        featuredImage: row.featured_image as string | undefined,
        metaTitle: row.meta_title as string | undefined, metaDescription: row.meta_description as string | undefined,
        authorId: (row.author_id as string) || '', authorName: (row.author_name as string) || '',
        authorAvatar: row.author_avatar as string | undefined, category: (row.category as string) || '',
        tags: (row.tags as string[]) || [], status: row.status as 'published',
        publishedAt: row.published_at as string | undefined, createdAt: row.created_at as string,
        updatedAt: row.updated_at as string, readingTime: (row.reading_time as number) || 1,
        viewCount: (row.view_count as number) || 0,
      }));
      setRelatedArticles(mapped);
    } catch (error) {
      console.error('Error loading related articles:', error);
    }
  };

  const updateSEO = () => {
    if (!article) return;

    // Update page title
    document.title = article.metaTitle || article.title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = article.metaDescription || article.excerpt;

    // Update or create canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://summerlandestates.com/articles/${article.slug}`;

    // Update or create Open Graph tags
    const ogTags = [
      { property: 'og:title', content: article.metaTitle || article.title },
      { property: 'og:description', content: article.metaDescription || article.excerpt },
      { property: 'og:image', content: article.featuredImage || '/images/default-article.jpg' },
      { property: 'og:url', content: `https://summerlandestates.com/articles/${article.slug}` },
      { property: 'og:type', content: 'article' },
      { property: 'article:section', content: article.category },
      { property: 'article:published_time', content: article.publishedAt || article.createdAt },
      { property: 'article:author', content: article.authorName }
    ];

    ogTags.forEach(tag => {
      let meta = document.querySelector(`meta[property="${tag.property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        document.head.appendChild(meta);
      }
      meta.content = tag.content;
    });

    // Update or create Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: article.metaTitle || article.title },
      { name: 'twitter:description', content: article.metaDescription || article.excerpt },
      { name: 'twitter:image', content: article.featuredImage || '/images/default-article.jpg' }
    ];

    twitterTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = tag.name;
        document.head.appendChild(meta);
      }
      meta.content = tag.content;
    });

    // Update or create structured data (JSON-LD)
    let structuredData = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'structured-data';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.metaTitle || article.title,
      "description": article.metaDescription || article.excerpt,
      "image": article.featuredImage || "/images/default-article.jpg",
      "author": {
        "@type": "Person",
        "name": article.authorName,
        "image": article.authorAvatar
      },
      "publisher": {
        "@type": "Organization",
        "name": "Summerland Estates",
        "logo": "/images/logo.png"
      },
      "datePublished": article.publishedAt || article.createdAt,
      "dateModified": article.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://summerlandestates.com/articles/${article.slug}`
      },
      "articleSection": article.category,
      "keywords": article.tags.join(', '),
      "wordCount": article.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
      "timeRequired": `PT${article.readingTime}M`
    };

    structuredData.textContent = JSON.stringify(schema, null, 2);
  };

  const shareArticle = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.metaTitle || article.title,
        text: article.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="news" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="news" />
        <div className="container mx-auto px-8 max-w-4xl pt-32">
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/news')}>
              Back to News
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage,
    author: {
      '@type': 'Person',
      name: article.authorName || 'Summerland Estates',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Summerland Estates',
      url: 'https://summerlandestates.com',
    },
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    url: `https://summerlandestates.com/articles/${article.slug}`,
  } : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article ? `${article.title} - Summerland Estates` : 'Article - Summerland Estates'}
        description={article?.excerpt || 'Read the latest insights and articles from Summerland Estates.'}
        canonical={`/articles/${slug}`}
        ogImage={article?.featuredImage}
        schema={articleSchema}
      />
      <NavBar currentPage="news" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {article.readingTime} min read
              </div>
            </div>
            
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between text-muted-foreground mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {article.authorAvatar && (
                    <img 
                      src={article.authorAvatar} 
                      alt={article.authorName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.authorName}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="h-4 w-4" />
                  {article.viewCount} views
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={shareArticle}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div 
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="article-content"
            />
          </div>

          {/* Tags */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(relatedArticle => (
                  <Link key={relatedArticle.id} to={`/articles/${relatedArticle.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      {relatedArticle.featuredImage && (
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {relatedArticle.category}
                        </Badge>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedArticle.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(relatedArticle.publishedAt || relatedArticle.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {relatedArticle.readingTime} min
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
