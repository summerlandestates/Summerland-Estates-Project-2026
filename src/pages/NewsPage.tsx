import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import FAQSection from '../components/FAQSection';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Search, Filter, Clock, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Article } from '../types/articles';
import { ARTICLE_CATEGORIES } from '../types/articles';

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, searchTerm, selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      const mapped: Article[] = (data || []).map((row: Record<string, unknown>) => ({
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
      }));
      setArticles(mapped);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...articles];

    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sort by published date (newest first)
    filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

    setFilteredArticles(filtered);
  };

  // Generate ItemList schema for articles
  const articlesSchema = filteredArticles.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Summerland Estates News & Articles',
    description: 'Latest estate management news, industry insights, and articles',
    url: 'https://summerlandestates.com/news',
    numberOfItems: filteredArticles.length,
    itemListElement: filteredArticles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: article.title,
      description: article.excerpt,
      url: `https://summerlandestates.com/articles/${article.slug}`,
      image: article.featuredImage,
    })),
  } : undefined;

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="News & Articles - Summerland Estates"
        description="Stay informed with the latest estate management news, industry insights, and articles from the Summerland Estates community."
        canonical="/news"
        schema={articlesSchema}
      />
      <NavBar currentPage="news" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              News & Articles
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay updated with the latest insights and trends in estate management
            </p>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </Card>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {articles.length === 0 
                  ? "No articles have been published yet." 
                  : "Try adjusting your filters to find what you're looking for."
                }
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link key={article.id} to={`/articles/${article.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    {article.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.readingTime} min read
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.authorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {article.viewCount} views
                        </div>
                        <div className="flex gap-1">
                          {article.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <FAQSection category="Articles" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
