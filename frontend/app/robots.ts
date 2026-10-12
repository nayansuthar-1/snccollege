import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The component gallery and the revalidation endpoint are not content.
      disallow: ['/styleguide', '/api/'],
    },
    sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
  };
}
