// Vercel Serverless Function for dynamic sitemap.xml
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://summerlandestates.com';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/search', priority: '0.9', changefreq: 'daily' },
  { path: '/add-listing', priority: '0.8', changefreq: 'monthly' },
  { path: '/open-roles', priority: '0.8', changefreq: 'daily' },
  { path: '/service-requests', priority: '0.8', changefreq: 'daily' },
  { path: '/advertisements', priority: '0.8', changefreq: 'weekly' },
  { path: '/collective', priority: '0.8', changefreq: 'weekly' },
  { path: '/events', priority: '0.7', changefreq: 'weekly' },
  { path: '/news', priority: '0.7', changefreq: 'weekly' },
  { path: '/services', priority: '0.8', changefreq: 'weekly' },
  { path: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/faqs', priority: '0.7', changefreq: 'monthly' },
  { path: '/recognition', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.6', changefreq: 'monthly' },
  { path: '/sponsorship', priority: '0.6', changefreq: 'monthly' },
  { path: '/post-job', priority: '0.6', changefreq: 'monthly' },
];

function formatDate(dateString: string | null) {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toISOString().split('T')[0];
}

function buildUrlNode(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string
) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function generateSitemapXml(): Promise<string> {
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  type UrlEntry = { path: string; lastmod: string; changefreq: string; priority: string };
  let dynamicUrls: UrlEntry[] = [];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const sources = [
      {
        table: 'listings',
        select: 'slug, updated_at',
        apply: (q: any) => q.eq('approved', true).not('slug', 'is', null),
        toUrl: (row: any) => `/profile/${row.slug || row.id}`,
        changefreq: 'weekly',
        priority: '0.6',
      },
      {
        table: 'job_postings',
        select: 'id, updated_at',
        apply: (q: any) => q.eq('status', 'active'),
        toUrl: (row: any) => `/job/${row.id}`,
        changefreq: 'daily',
        priority: '0.7',
      },
      {
        table: 'events',
        select: 'id, updated_at',
        apply: (q: any) => q.in('status', ['approved', 'published']),
        toUrl: (row: any) => `/event/${row.id}`,
        changefreq: 'weekly',
        priority: '0.6',
      },
      {
        table: 'service_requests',
        select: 'id, created_at',
        apply: (q: any) => q.eq('status', 'open'),
        toUrl: (row: any) => `/service-request/${row.id}`,
        changefreq: 'daily',
        priority: '0.6',
      },
      {
        table: 'articles',
        select: 'slug, updated_at',
        apply: (q: any) => q.eq('status', 'published'),
        toUrl: (row: any) => `/articles/${row.slug || row.id}`,
        changefreq: 'weekly',
        priority: '0.6',
      },
      {
        table: 'site_content_pages',
        select: 'slug, updated_at',
        apply: (q: any) => q.eq('is_published', true),
        toUrl: (row: any) => `/pages/${row.slug}`,
        changefreq: 'monthly',
        priority: '0.5',
      },
    ];

    for (const source of sources) {
      try {
        const { data, error } = await source.apply(
          supabase.from(source.table).select(source.select)
        );
        if (error) {
          console.error(`Could not fetch ${source.table} for sitemap:`, error.message);
          continue;
        }
        dynamicUrls.push(
          ...(data || []).map((row: any) => ({
            path: source.toUrl(row),
            lastmod: row.updated_at || row.created_at,
            changefreq: source.changefreq,
            priority: source.priority,
          }))
        );
      } catch (err: any) {
        console.error(`Skipping ${source.table} for sitemap:`, err.message);
      }
    }
  }

  const today = formatDate(null);

  const allUrls = [
    ...staticRoutes.map((route) => ({ ...route, lastmod: today })),
    ...dynamicUrls,
  ];

  const urlNodes = allUrls.map((route) =>
    buildUrlNode(
      `${BASE_URL}${route.path}`,
      formatDate(route.lastmod),
      route.changefreq,
      route.priority
    )
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes.join('\n')}\n</urlset>\n`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const xml = await generateSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('Sitemap generation error:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Could not generate sitemap</error>');
  }
}
