import type { NextConfig } from 'next';

const wordpressUrl = new URL(process.env.WORDPRESS_URL ?? 'http://localhost:8881');

/**
 * Next 16's image optimizer refuses upstream images whose host resolves to a private IP (SSRF
 * protection), which blocks every WordPress image while the CMS runs on localhost. Allow it only
 * for a local CMS: on a real host (cms.snccollegedpr.in) this stays off by itself.
 */
const localWordpress = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(wordpressUrl.hostname);

/**
 * Permanent redirects from the old snccollegedpr.in URLs (design system §7.3).
 * Sources are written without a trailing slash; Next normalises `/old/` to `/old` first.
 * `/about/` and `/iqac/` are not listed because that normalisation already resolves them.
 */
const legacyRedirects: Record<string, string> = {
  '/message': '/about/messages',
  '/infrastructure': '/about/infrastructure',
  '/college-committee': '/iqac/committees',
  '/affiliations': '/about/affiliations',
  '/vision-mission': '/about/vision-mission',
  '/ladder-of-success': '/about/vision-mission',
  '/philosophy': '/about/vision-mission',
  '/activities': '/campus-life',
  '/support-guidance': '/campus-life/support-guidance',
  '/naac': '/iqac/naac',
  '/placement-cell': '/campus-life/placement-cell',
  '/student-grievance-redressal-cell': '/students/grievance-redressal',
  '/anti-ragging-committee-undertaking': '/students/anti-ragging',
  '/mandatory-disclosures': '/about/mandatory-disclosures',
  '/faculty-staff-details': '/academics/faculty',
  '/examination-section': '/academics/examinations',
  '/academic-calendar': '/academics/academic-calendar',
  '/ugc-statutory-bodies-compliance-ugc-aicte-approval-docs': '/iqac/ugc-compliance',
  '/courses': '/academics/programmes',
  '/scholarship': '/admissions/scholarships',
  '/student-corner': '/students',
  '/admission': '/admissions',
  '/admission-form': '/admissions/apply',
  '/syllabus': '/students/syllabus',
  '/old-question-papers': '/students/question-papers',
  '/migration-nodal': '/students/migration',
  '/photo-gallery': '/campus-life/gallery',
  '/video-gallery': '/campus-life/videos',
  '/press-note': '/news?category=press-notes',
  '/alumini': '/campus-life/alumni',
  '/contacts': '/contact',
};

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    ...(localWordpress ? { dangerouslyAllowLocalIP: true } : {}),
    remotePatterns: [
      {
        protocol: wordpressUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: wordpressUrl.hostname,
        port: wordpressUrl.port,
        pathname: '/wp-content/uploads/**',
      },
      // Poster frames for the click-to-load YouTube player (components/page/VideoEmbed.tsx).
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },

  async redirects() {
    return [
      ...Object.entries(legacyRedirects).map(([source, destination]) => ({ source, destination, permanent: true })),
      // Old PDF and image links keep working: they stay on the WordPress media host.
      {
        source: '/wp-content/uploads/:path*',
        destination: `${wordpressUrl.origin}/wp-content/uploads/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
