// Generate a sitemap with approved listings from Supabase
// Run with: npm run sitemap

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://summerlandestates.com';
const OUTPUT_PATH = resolve(__dirname, '../public/sitemap-static.xml');
const APP_PATH = resolve(__dirname, '../src/App.tsx');

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const NO_INDEX_PATHS = new Set([
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/my-profile',
  '/my-profile/edit',
  '/settings',
  '/notification-settings',
  '/saved-profiles',
  '/account',
  '/dashboard',
  '/messaging',
  '/messaging/:id',
  '/conversation/:id',
  '/checkout',
  '/payment-success',
  '/compare',
  '/registration-pending',
  '/email-blast',
  '/pricing',
]);

const ROUTE_OVERRIDES = {
  '/': { priority: '1.0', changefreq: 'daily' },
  '/search': { priority: '0.9', changefreq: 'daily' },
  '/open-roles': { priority: '0.8', changefreq: 'daily' },
  '/service-requests': { priority: '0.8', changefreq: 'daily' },
  '/advertisements': { priority: '0.8', changefreq: 'weekly' },
  '/collective': { priority: '0.8', changefreq: 'weekly' },
  '/events': { priority: '0.7', changefreq: 'weekly' },
  '/news': { priority: '0.7', changefreq: 'weekly' },
  '/add-listing': { priority: '0.8', changefreq: 'monthly' },
  '/post-job': { priority: '0.6', changefreq: 'monthly' },
  '/about': { priority: '0.7', changefreq: 'monthly' },
  '/contact': { priority: '0.7', changefreq: 'monthly' },
  '/faqs': { priority: '0.7', changefreq: 'monthly' },
  '/how-it-works': { priority: '0.7', changefreq: 'monthly' },
  '/privacy': { priority: '0.6', changefreq: 'monthly' },
  '/terms': { priority: '0.6', changefreq: 'monthly' },
  '/sponsorship': { priority: '0.6', changefreq: 'monthly' },
  '/recognition': { priority: '0.6', changefreq: 'monthly' },
};

const FALLBACK_STATIC_ROUTES = [
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

function discoverStaticRoutes() {
  if (!existsSync(APP_PATH)) {
    console.warn(`⚠️ ${APP_PATH} not found. Using fallback static routes.`);
    return FALLBACK_STATIC_ROUTES;
  }

  const appSource = readFileSync(APP_PATH, 'utf-8');
  const routes = new Set();

  // Match <Route path="..." ... /> declarations from react-router
  const routeRegex = /<Route\s+[^>]*?path="([^"]+)"[^>]*?\/?>/g;
  let match;
  while ((match = routeRegex.exec(appSource)) !== null) {
    const fullMatch = match[0];
    const path = match[1];

    // Skip dynamic routes, admin routes, redirects, and known private/no-index paths
    const isDynamic = path.includes(':');
    const isAdmin = path.startsWith('/admin');
    const isRedirect = fullMatch.includes('Navigate');
    const isNoIndex = NO_INDEX_PATHS.has(path);

    if (isDynamic || isAdmin || isRedirect || isNoIndex) continue;

    routes.add(path);
  }

  const discovered = Array.from(routes)
    .sort()
    .map((path) => ({
      path,
      ...(ROUTE_OVERRIDES[path] || { priority: '0.7', changefreq: 'weekly' }),
    }));

  if (discovered.length === 0) {
    console.warn('⚠️ No public routes discovered in App.tsx. Using fallback.');
    return FALLBACK_STATIC_ROUTES;
  }

  return discovered;
}

function formatDate(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toISOString().split('T')[0];
}

function buildUrlNode(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  let profileUrls = [];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('listings')
      .select('slug, updated_at')
      .eq('approved', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('⚠️ Could not fetch listings for sitemap:', error.message);
    } else if (data?.length) {
      profileUrls = data.map((listing) => ({
        path: `/profile/${listing.slug || listing.id}`,
        lastmod: listing.updated_at,
        changefreq: 'weekly',
        priority: '0.6',
      }));
      console.log(`✅ Fetched ${profileUrls.length} approved listings`);
    }
  } else {
    console.warn(
      '⚠️ Supabase env vars not found. Generating sitemap without profile URLs.'
    );
  }

  const today = formatDate();
  const staticRoutes = discoverStaticRoutes();

  const allUrls = [
    ...staticRoutes.map((route) => ({
      ...route,
      lastmod: today,
    })),
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes.join('\n')}\n</urlset>\n`;

  writeFileSync(OUTPUT_PATH, xml);
  console.log(`✅ Sitemap written to ${OUTPUT_PATH}`);
  console.log(`   Total URLs: ${allUrls.length}`);
}

main().catch((error) => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
