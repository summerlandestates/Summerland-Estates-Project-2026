export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  viewCount: number;
  schema?: ArticleSchema;
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  author: {
    '@type': 'Person';
    name: string;
    image?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: string;
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': string;
  };
}

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: File | string;
  metaTitle?: string;
  metaDescription?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface ArticleFilters {
  category?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const ARTICLE_CATEGORIES = [
  'Estate Management',
  'Staffing Solutions',
  'Property Care',
  'Security & Safety',
  'Lifestyle Services',
  'Technology & Innovation',
  'Industry News',
  'Professional Development',
  'Market Insights',
  'Best Practices'
] as const;

export const ARTICLE_TAGS = [
  'Private Staff',
  'Estate Management',
  'Household Management',
  'Property Maintenance',
  'Security',
  'Chef Services',
  'Housekeeping',
  'Nanny Services',
  'Estate Planning',
  'Luxury Living',
  'Professional Staff',
  'Domestic Staff',
  'Butler Services',
  'Groundskeeping',
  'Property Security',
  'Estate Technology',
  'Staff Training',
  'Industry Trends',
  'Recruitment',
  'Staff Retention',
  'Service Excellence'
] as const;
