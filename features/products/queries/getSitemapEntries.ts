import type { MetadataRoute } from 'next';
import type { CatalogPorts } from '@/features/products/core/ports';

const SITE_URL = 'https://sanglogium.com';

type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

type SitemapEntry = MetadataRoute.Sitemap[number] & {
  changeFrequency?: ChangeFreq;
  priority?: number;
};

export async function getSitemapEntries(ports: { catalog: Pick<CatalogPorts, 'getSitemapSlugs'> }): Promise<MetadataRoute.Sitemap> {
    try {
      const { products, categories } = await ports.catalog.getSitemapSlugs();

      const productUrls = (products || []).map((p: any) => {
        const safeSlug = encodeURIComponent(p.slug);

        return {
          url: `${SITE_URL}/product/${safeSlug}`,
          lastModified: p._updatedAt ? new Date(p._updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });

      const categoryUrls = (categories || []).map((c: any) => {
        const safeSlug = encodeURIComponent(c.slug);

        return {
          url: `${SITE_URL}/category/${safeSlug}`,
          lastModified: c._updatedAt ? new Date(c._updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        };
      });

      const staticRoutes: SitemapEntry[] = [
        '', // Homepage
        '/products', // All Products Page
        '/basket', // Cart Page
        '/checkout', // Checkout Page
        '/search', // Search Page
        '/about-us', // About Us
        '/contact', // Contact Us
        '/faq', // FAQ
        '/shipping-policy', // Shipping Policy
        '/returns-policy', // Returns Policy
        '/terms-of-service', // Terms of Service
        '/privacy-policy', // Privacy Policy
      ].map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency:
          route === '' || route === '/products'
            ? ('daily' as ChangeFreq)
            : ('monthly' as ChangeFreq),
        priority:
          route === ''
            ? 1.0
            : route === '/products'
              ? 0.9
              : 0.5,
      }));

      return [
        ...staticRoutes,
        ...productUrls,
        ...categoryUrls,
      ] as MetadataRoute.Sitemap;
    } catch (err) {
      console.error('Sitemap generation failed:', err);
      return [{ url: SITE_URL, lastModified: new Date() }];
    }
}
