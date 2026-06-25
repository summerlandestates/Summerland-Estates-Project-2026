import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  schema?: object;
  noIndex?: boolean;
}

const BASE_URL = 'https://summerlandestates.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-image.jpg`;

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  noIndex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title.includes('Summerland Estates')
      ? title
      : `${title} | Summerland Estates`;

    document.title = fullTitle;

    const setMeta = (selector: string, content: string, attr = 'content') => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const [key, val] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(key.trim(), val.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', noIndex ? 'noindex, nofollow' : 'index, follow');

    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : window.location.href;
    setLink('canonical', canonicalUrl);

    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:image"]', ogImage);

    setMeta('meta[property="twitter:title"]', fullTitle);
    setMeta('meta[property="twitter:description"]', description);
    setMeta('meta[property="twitter:image"]', ogImage);

    if (schema) {
      let structuredData = document.querySelector('#page-schema') as HTMLScriptElement | null;
      if (!structuredData) {
        structuredData = document.createElement('script');
        structuredData.id = 'page-schema';
        structuredData.type = 'application/ld+json';
        document.head.appendChild(structuredData);
      }
      structuredData.textContent = JSON.stringify(schema, null, 2);
    }
  }, [title, description, canonical, ogImage, schema, noIndex]);

  return null;
}
