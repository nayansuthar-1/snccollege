import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Crumb } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: new URL(c.href, siteConfig.url).toString() } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-white/70">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <ChevronRight aria-hidden="true" size={14} className="text-white/40" />}
            {c.href ? (
              <Link href={c.href} className="transition-colors duration-200 hover:text-gold-400">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-white">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </nav>
  );
}
