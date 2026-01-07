import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Top Estate Management Trends for 2024',
    excerpt: 'Discover the latest trends in luxury estate management, from smart home integration to sustainable practices.',
    category: 'Estate Management',
    author: 'Sarah Johnson',
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop'
  },
  {
    id: '2',
    title: 'The Ultimate Guide to Holiday Gift Ideas for High-Net-Worth Clients',
    excerpt: 'Curated gift ideas that will impress even the most discerning recipients this holiday season.',
    category: 'Gift Ideas',
    author: 'Michael Chen',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'Celebrity Estate Manager Shares Insider Tips',
    excerpt: 'Learn from the best in the business about managing high-profile estates and maintaining discretion.',
    category: 'Celebrity News',
    author: 'Jennifer Martinez',
    date: '2024-03-08',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Luxury Home Services: What\'s Worth the Investment',
    excerpt: 'A comprehensive guide to premium home services that add real value to luxury properties.',
    category: 'Home Services',
    author: 'David Thompson',
    date: '2024-03-05',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=400&fit=crop'
  },
  {
    id: '5',
    title: 'Smart Home Technology for Estate Managers',
    excerpt: 'The latest in home automation and how it\'s revolutionizing estate management.',
    category: 'Estate Management',
    author: 'Robert Kim',
    date: '2024-03-01',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=400&fit=crop'
  },
  {
    id: '6',
    title: 'Christmas Gift Guide: Luxury Items Under $500',
    excerpt: 'Thoughtful and elegant gift ideas that won\'t break the bank but still impress.',
    category: 'Gift Ideas',
    author: 'Amanda Wilson',
    date: '2024-02-28',
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&h=400&fit=crop'
  }
];

export default function NewsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="news" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              News & Articles
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Stay informed with the latest in estate management, luxury home services, celebrity news, and gift ideas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="bg-card text-card-foreground overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6 space-y-4">
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {article.category}
                  </Badge>
                  
                  <h3 className="text-xl font-heading font-bold text-foreground line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
