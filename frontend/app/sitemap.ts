import type { MetadataRoute } from 'next';
import { mainNav, navItemLinks } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { getPaths } from '@/lib/wp/api';

/** Routes that exist in code rather than as WordPress pages. */
const codeRoutes = ['/', '/academics/programmes', '/academics/faculty', '/campus-life/gallery', '/news', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, programmes, news, gallery } = await getPaths();

  const paths = new Set<string>([
    ...codeRoutes,
    // Everything the menus link to, so a page listed in navigation is never missed.
    ...mainNav
      .flatMap((item) => [item.href, ...navItemLinks(item).map((link) => link.href)])
      .filter((href) => href.startsWith('/'))
      // A menu link may carry a query string (/news?category=press-notes); index the page itself.
      .map((href) => href.split('?')[0]),
    ...pages.map((path) => `/${path}`),
    ...programmes.map((slug) => `/academics/programmes/${slug}`),
    ...news.map((slug) => `/news/${slug}`),
    ...gallery.map((slug) => `/campus-life/gallery/${slug}`),
  ]);

  const now = new Date();
  return [...paths].sort().map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.split('/').length <= 2 ? 0.8 : 0.6,
  }));
}
