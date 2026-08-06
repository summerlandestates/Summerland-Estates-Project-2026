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

  let profileUrls: { path: string; lastmod: string; changefreq: string; priority: string }[] = [];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('listings')
      .select('slug, updated_at')
      .eq('approved', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Could not fetch listings for sitemap:', error.message);
    } else if (data?.length) {
      profileUrls = data.map((listing: any) => ({
        path: `/profile/${listing.slug || listing.id}`,
        lastmod: listing.updated_at,
        changefreq: 'weekly',
        priority: '0.6',
      }));
    }
  }

  const today = formatDate(null);

  const allUrls = [
    ...staticRoutes.map((route) => ({ ...route, lastmod: today })),
    ...profileUrls,
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
